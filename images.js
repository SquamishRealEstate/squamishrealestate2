const { google } = require("googleapis");
const axios = require("axios");
const sharp = require("sharp");
const fs = require("fs").promises;
require("dotenv").config({ path: [".env.local", ".env"] });

// ------------------------------------
// Configuration & Auth
// ------------------------------------
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const drive = google.drive({ version: "v3", auth: oauth2Client });
const accessToken = process.env.BRIDGE_API_TOKEN;

// Legacy JPG roots are kept only to disambiguate the WebP folders by parent.
const PARCELS_ROOT_FOLDER_ID = "1dZnLEUjDYm7JiUNu3pJyKiyPlCOXWHm1";
const STRATA_ROOT_FOLDER_ID = "1OHeWfV64XGXc_cZwXxu0sHReVm4hioVr";

// WebP roots are resolved by name at runtime (see storeImagesInDrive).
let parcelsWebpRootId = null;
let strataWebpRootId = null;

async function resolveRootFolderId(desiredName, preferredParentId) {
  const find = (q) =>
    withRetry(() =>
      drive.files.list({
        q,
        fields: "files(id,name,parents,mimeType)",
        pageSize: 100,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      }),
    ).then((res) => res.data.files || []);

  const allWebpFolders = await find(
    `name contains 'Webp' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
  );
  const candidates = allWebpFolders.filter(
    (f) => f.name.trim().toLowerCase() === desiredName.trim().toLowerCase(),
  );

  if (!candidates.length) {
    // Diagnostics: show what WebP-ish folders exist and what the legacy roots contain
    console.log(
      `WebP folders visible to this account: ${allWebpFolders.map((f) => `'${f.name}' (id ${f.id})`).join(", ") || "NONE"}`,
    );
    for (const [label, legacyId] of [
      ["Parcels", PARCELS_ROOT_FOLDER_ID],
      ["Strata", STRATA_ROOT_FOLDER_ID],
    ]) {
      try {
        const kids = (await find(`'${legacyId}' in parents and trashed=false`))
          .filter((k) => k.mimeType === "application/vnd.google-apps.folder");
        console.log(`${label} root folder children: ${kids.map((k) => `'${k.name}'`).join(", ") || "(none)"}`);
      } catch (e) {
        console.log(`${label} root children: <error: ${e.message}>`);
      }
    }
    console.log(
      `Creating WebP root folder '${desiredName}' inside the legacy root...`,
    );
    const folder = await withRetry(() =>
      drive.files.create({
        requestBody: {
          name: desiredName,
          mimeType: "application/vnd.google-apps.folder",
          parents: [preferredParentId],
        },
        fields: "id",
        supportsAllDrives: true,
      }),
    );
    console.log(
      `Created WebP root '${desiredName}' -> folder id ${folder.data.id}`,
    );
    return folder.data.id;
  }

  const pick =
    candidates.find((c) => (c.parents || [])[0] === preferredParentId) ||
    candidates[0];

  console.log(
    `Resolved WebP root '${desiredName}' -> folder id ${pick.id}` +
      (candidates.length > 1 ? ` (${candidates.length} candidates)` : ""),
  );
  return pick.id;
}

// ------------------------------------
// 1. Local Database (Speed Boost & Write-Safe)
// ------------------------------------
const DB_FILE = "./synced_mls_webp.json";
let syncedListings = new Set();
let isWritingDB = false;

async function loadLocalDatabase() {
  try {
    const data = await fs.readFile(DB_FILE, "utf-8");
    const parsed = JSON.parse(data);
    syncedListings = new Set(parsed);
    console.log(
      `📁 Loaded ${syncedListings.size} previously synced listings from local DB.`,
    );
  } catch (err) {
    console.log("No local database found. Creating a new one...");
    await fs.writeFile(DB_FILE, JSON.stringify([]));
  }
}

async function markAsSynced(mlsNumber) {
  syncedListings.add(String(mlsNumber));

  // Prevent file corruption if both tracks try to save at the exact same millisecond.
  if (isWritingDB) return;

  isWritingDB = true;
  try {
    await fs.writeFile(DB_FILE, JSON.stringify([...syncedListings], null, 2));
  } catch (err) {
    console.error("Failed to write to DB:", err);
  } finally {
    isWritingDB = false;
  }
}

// ------------------------------------
// 2. Promise Cache (Fixes Race Conditions)
// ------------------------------------
const folderCache = new Map();

function getOrCreateFolderCached(folderName, parentId) {
  const cacheKey = `${parentId}_${folderName}`;

  if (folderCache.has(cacheKey)) {
    return folderCache.get(cacheKey);
  }

  const folderPromise = (async () => {
    const res = await withRetry(() =>
      drive.files.list({
        q: `name='${folderName}' and '${parentId}' in parents and trashed=false`,
        fields: "files(id,name)",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      }),
    );

    if (res.data.files.length) {
      return res.data.files[0].id;
    }

    const folder = await withRetry(() =>
      drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: "application/vnd.google-apps.folder",
          parents: [parentId],
        },
        fields: "id",
        supportsAllDrives: true,
      }),
    );

    console.log(`Created folder: ${folderName}`);
    return folder.data.id;
  })();

  folderCache.set(cacheKey, folderPromise);
  return folderPromise;
}

// ------------------------------------
// 3. Helpers & Retry Logic
// ------------------------------------
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry(apiCall, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await apiCall();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(
        `API Error. Retrying in ${delay / 1000}s... (${err.message})`,
      );
      await wait(delay);
    }
  }
}

function chunkArray(array, size) {
  const chunked = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
}

function cleanStreetName(street) {
  if (!street) return "";
  const firstWord = street.trim().replace(/\s+/g, " ").split(" ")[0];
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
}

// ------------------------------------
// 4. Image Uploader
// ------------------------------------
async function uploadPropertyImages(
  address,
  imageUrls,
  mlsNumber,
  propertyType,
) {
  let streetName, propertyFolder, rootFolderId;

  if (propertyType === "strata") {
    streetName = cleanStreetName(address[2]);
    propertyFolder = address[0]
      ? `${address[0]}-${address[1]}-${streetName}`
      : `${address[1]}-${streetName}`;
    rootFolderId = strataWebpRootId;
  } else {
    streetName = cleanStreetName(address[1]);
    propertyFolder = `${address[0]}-${streetName}`;
    rootFolderId = parcelsWebpRootId;
  }

  const streetFolderId = await getOrCreateFolderCached(
    streetName,
    rootFolderId,
  );
  const photosFolderId = await getOrCreateFolderCached(
    "Photos",
    streetFolderId,
  );
  const propertyFolderId = await getOrCreateFolderCached(
    propertyFolder,
    photosFolderId,
  );
  const mlsFolderId = await getOrCreateFolderCached(
    String(mlsNumber),
    propertyFolderId,
  );

  // Skip photos already uploaded on a previous (possibly interrupted) run
  const existingRes = await withRetry(() =>
    drive.files.list({
      q: `'${mlsFolderId}' in parents and trashed=false`,
      fields: "files(name)",
      pageSize: 1000,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    }),
  );
  const existingNames = new Set(
    (existingRes.data.files || []).map((f) => f.name),
  );

  // Upload images in batches of 10 to respect Google Drive rate limits
  const imageBatches = chunkArray(imageUrls, 10);

  for (const batch of imageBatches) {
    const uploadPromises = batch.map(async (url) => {
      try {
        const rawName = url.split("/").pop().split("?")[0] || "photo";
        const baseName = rawName.replace(/\.(jpe?g|png|gif|bmp|tiff?)$/i, "");
        const fileName = `${baseName}.webp`;

        if (existingNames.has(fileName)) return;

        await withRetry(async () => {
          const response = await axios.get(url, {
            responseType: "arraybuffer",
          });
          const webpBuffer = await sharp(response.data)
            .webp({ quality: 80 })
            .toBuffer();
          await drive.files.create({
            requestBody: { name: fileName, parents: [mlsFolderId] },
            media: { mimeType: "image/webp", body: webpBuffer },
            supportsAllDrives: true,
          });
        });
      } catch (err) {
        console.error(`Permanent upload failure for ${url}:`, err.message);
      }
    });

    await Promise.all(uploadPromises);
  }

  console.log(`Completed: ${mlsNumber}`);
}

// ------------------------------------
// 5. Fetch Bridge Data
// ------------------------------------
const fields = [
  "StreetNumber",
  "StreetName",
  "StreetSuffix",
  "ListingId",
  "Media",
];
const strataFields = [
  "StreetNumber",
  "StreetName",
  "StreetSuffix",
  "UnitNumber",
  "ListingId",
  "Media",
];

async function fetchFromBridge(structureType, selectedFields) {
  const fieldsQuery = selectedFields.join(",");
  let listings = [];
  let skip = 0;

  while (true) {
    // Note: Adjust the MLSAreaMajor or ListAgent filters here if you need to scope the query down
    let url =
      structureType === "Multi Family"
        ? `https://api.bridgedataoutput.com/api/v2/OData/bcres/Property?access_token=${accessToken}&$filter=StructureType eq 'Multi Family' and MLSAreaMajor eq 'Squamish'&$select=${fieldsQuery}&$top=200&$skip=${skip}`
        : `https://api.bridgedataoutput.com/api/v2/OData/bcres/Property?access_token=${accessToken}&$filter=StructureType/any(a:a eq '${structureType}') and MLSAreaMajor eq 'Squamish'&$select=${fieldsQuery}&$top=200&$skip=${skip}`;

    const response = await withRetry(() => axios.get(url));
    const data = response.data.value;
    listings = listings.concat(data);

    if (data.length < 200) break;
    skip += 200;
  }

  return listings;
}

// ------------------------------------
// 6. Track Processing Logic
// ------------------------------------
async function processListingsCategory(configs, trackName) {
  console.log(`\n[${trackName}] Fetching data...`);

  const allFetchedData = await Promise.all(
    configs.map(async (config) => {
      const rawData = await fetchFromBridge(config.apiFilter, config.fields);
      return rawData.map((listing) => ({
        ...listing,
        _injectedPropertyType: config.type,
      }));
    }),
  );

  const combinedListings = allFetchedData.flat();
  const unProcessedListings = combinedListings.filter(
    (raw) => !syncedListings.has(String(raw.ListingId)),
  );

  console.log(
    `\n[${trackName}] Fetch complete. Found ${unProcessedListings.length} new listings.`,
  );

  if (unProcessedListings.length === 0) return;

  // Process 5 properties at a time for THIS track
  const batches = chunkArray(unProcessedListings, 5);

  for (const batch of batches) {
    const batchPromises = batch.map(async (raw) => {
      try {
        const pType = raw._injectedPropertyType;

        let address =
          pType === "strata"
            ? [
                raw.UnitNumber,
                raw.StreetNumber,
                raw.StreetName,
                raw.StreetSuffix,
              ]
            : [raw.StreetNumber, raw.StreetName, raw.StreetSuffix];

        const imageUrls =
          raw.Media?.map((m) => m.MediaURL || m.Uri || m.Url).filter(Boolean) ||
          [];

        if (!imageUrls.length) {
          await markAsSynced(raw.ListingId);
          return;
        }

        await uploadPropertyImages(address, imageUrls, raw.ListingId, pType);
        await markAsSynced(raw.ListingId);
      } catch (err) {
        console.error(
          `[${trackName}] Failed property ${raw.ListingId}:`,
          err.message,
        );
      }
    });

    await Promise.all(batchPromises);
  }

  console.log(`\n[${trackName}] Finished processing.`);
}

// ------------------------------------
// 7. Main Execution (Two Parallel Tracks)
// ------------------------------------
async function storeImagesInDrive() {
  try {
    await loadLocalDatabase();

    const about = await drive.about.get({ fields: "user" });
    console.log(`Google Drive account: ${about.data.user.emailAddress}`);

    parcelsWebpRootId = await resolveRootFolderId(
      "Parcels Webp",
      PARCELS_ROOT_FOLDER_ID,
    );
    strataWebpRootId = await resolveRootFolderId(
      "Strata Webp",
      STRATA_ROOT_FOLDER_ID,
    );

    const parcelsConfigs = [
      { type: "detached", apiFilter: "Residential Detached", fields: fields },
      { type: "land", apiFilter: "Land Only", fields: fields },
      { type: "multifamily", apiFilter: "Multi Family", fields: fields },
    ];

    const strataConfigs = [
      {
        type: "strata",
        apiFilter: "Residential Attached",
        fields: strataFields,
      },
    ];

    console.log(
      "\n Starting Simultaneous Sync Tracks: Parcels (5) & Strata (5) => Total 10 properties processing at once...",
    );

    // RUN BOTH TRACKS AT THE EXACT SAME TIME
    await Promise.all([
      processListingsCategory(parcelsConfigs, "TRACK 1: PARCELS"),
      processListingsCategory(strataConfigs, "TRACK 2: STRATA"),
    ]);

    // One final save to guarantee nothing was missed during the write lock
    await fs.writeFile(DB_FILE, JSON.stringify([...syncedListings], null, 2));

    console.log("\nFULL SYNC COMPLETE");
  } catch (err) {
    console.error("Sync failed:", err.message);
  }
}

// Execute the script
storeImagesInDrive();

// const { google } = require("googleapis");
// const axios = require("axios");
// require("dotenv").config();

// // ------------------------------------
// // Google Drive Auth
// // ------------------------------------

// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
// );

// oauth2Client.setCredentials({
//   refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
// });

// const drive = google.drive({
//   version: "v3",
//   auth: oauth2Client,
// });

// const accessToken = process.env.BRIDGE_API_TOKEN;

// // Root Google Drive folder
// const PARCELS_ROOT_FOLDER_ID = "1dZnLEUjDYm7JiUNu3pJyKiyPlCOXWHm1";
// const STRATA_ROOT_FOLDER_ID = "1OHeWfV64XGXc_cZwXxu0sHReVm4hioVr";

// // ------------------------------------
// // Folder Helpers
// // ------------------------------------

// async function getOrCreateFolder(folderName, parentId) {
//   const res = await drive.files.list({
//     q: `name='${folderName}' and '${parentId}' in parents and trashed=false`,

//     fields: "files(id,name)",
//   });

//   if (res.data.files.length) {
//     return res.data.files[0].id;
//   }

//   const folder = await drive.files.create({
//     requestBody: {
//       name: folderName,
//       mimeType: "application/vnd.google-apps.folder",
//       parents: [parentId],
//     },

//     fields: "id",
//   });

//   console.log(`Created folder: ${folderName}`);

//   return folder.data.id;
// }

// async function findFolder(folderName, parentId) {
//   const res = await drive.files.list({
//     q: `name='${folderName}' and '${parentId}' in parents and trashed=false`,

//     fields: "files(id,name)",
//   });

//   return res.data.files.length ? res.data.files[0] : null;
// }

// async function fileExists(folderId, fileName) {
//   const res = await drive.files.list({
//     q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,

//     fields: "files(id)",
//   });

//   return res.data.files.length > 0;
// }

// // ------------------------------------
// // Clean Street Name
// // ------------------------------------

// function cleanStreetName(street) {
//   if (!street) return "";

//   return (
//     street.trim().replace(/\s+/g, " ").split(" ")[0].charAt(0).toUpperCase() +
//     street.trim().replace(/\s+/g, " ").split(" ")[0].slice(1).toLowerCase()
//   );
// }

// // ------------------------------------
// // Upload Images
// // ------------------------------------

// async function uploadPropertyImages(
//   address,
//   imageUrls,
//   mlsNumber,
//   propertyType,
// ) {
//   let streetName;
//   let propertyFolder;
//   let rootFolderId;

//   // ------------------------------------
//   // STRATA
//   // address:
//   // [UnitNumber, StreetNumber, StreetName, Suffix]
//   // ------------------------------------

//   if (propertyType === "strata") {
//     streetName = address[2];
//     streetName = cleanStreetName(streetName);

//     propertyFolder = `${address[0]}-${address[1]}-${streetName}`;
//     rootFolderId = STRATA_ROOT_FOLDER_ID;
//   }

//   // ------------------------------------
//   // DETACHED / LAND / MULTIFAMILY
//   // address:
//   // [StreetNumber, StreetName, Suffix]
//   // ------------------------------------
//   else {
//     streetName = address[1];
//     streetName = cleanStreetName(streetName);

//     propertyFolder = `${address[0]}-${streetName}`;
//     rootFolderId = PARCELS_ROOT_FOLDER_ID;
//   }
//   // Street folder

//   const streetFolderId = await getOrCreateFolder(streetName, rootFolderId);

//   // Photos folder

//   const photosFolderId = await getOrCreateFolder("Photos", streetFolderId);

//   // Property folder

//   const propertyFolderId = await getOrCreateFolder(
//     propertyFolder,
//     photosFolderId,
//   );

//   // Check MLS

//   const existingMLS = await findFolder(String(mlsNumber), propertyFolderId);

//   if (existingMLS) {
//     console.log(`MLS ${mlsNumber} already exists`);

//     return;
//   }

//   const mlsFolderId = await getOrCreateFolder(
//     String(mlsNumber),
//     propertyFolderId,
//   );

//   // Upload images

//   for (const url of imageUrls) {
//     try {
//       let fileName = url.split("/").pop().split("?")[0];

//       if (await fileExists(mlsFolderId, fileName)) {
//         console.log(`Skipping ${fileName}`);

//         continue;
//       }

//       const response = await axios.get(url, {
//         responseType: "stream",
//       });

//       await drive.files.create({
//         requestBody: {
//           name: fileName,

//           parents: [mlsFolderId],
//         },

//         media: {
//           mimeType: "image/jpeg",

//           body: response.data,
//         },
//       });

//       console.log(`Uploaded ${fileName}`);
//     } catch (err) {
//       console.error("Upload failed:", err.message);
//     }
//   }
// }

// // ------------------------------------
// // Bridge Fields
// // ------------------------------------

// const fields = [
//   "StreetNumber",
//   "StreetName",
//   "StreetSuffix",
//   "ListingId",
//   "Media",
// ];

// const strataFields = [
//   "StreetNumber",
//   "StreetName",
//   "StreetSuffix",
//   "UnitNumber",
//   "ListingId",
//   "Media",
// ];

// // ------------------------------------
// // Fetch Bridge Data
// // ------------------------------------

// async function fetchFromBridge(structureType, fields) {
//   const fieldsQuery = fields.join(",");

//   let listings = [];

//   let skip = 0;

//   while (true) {
//     let url;

//     if (structureType === "MultiFamily Only") {
//       url = `https://api.bridgedataoutput.com/api/v2/OData/bcres/Property?access_token=${accessToken}&$filter=StructureType eq 'Multi Family' and MLSAreaMajor eq 'Squamish'&$select=${fieldsQuery}&$top=200&$skip=${skip}`;
//     } else {
//       url = `https://api.bridgedataoutput.com/api/v2/OData/bcres/Property?access_token=${accessToken}&$filter=StructureType/any(a:a eq '${structureType}') and MLSAreaMajor eq 'Squamish'&$select=${fieldsQuery}&$top=200&$skip=${skip}`;
//     }

//     const response = await axios.get(url);

//     const data = response.data.value;

//     listings = listings.concat(data);

//     console.log(`${structureType}: ${listings.length}`);

//     if (data.length < 200) break;

//     skip += 200;
//   }

//   return listings;
// }

// // ------------------------------------
// // Main Sync
// // ------------------------------------

// async function storeImagesInDrive() {
//   try {
//     const syncConfigs = [
//       {
//         type: "detached",
//         apiFilter: "Residential Detached",
//         fields: fields,
//       },

//       {
//         type: "strata",
//         apiFilter: "Residential Attached",
//         fields: strataFields,
//       },

//       {
//         type: "land",
//         apiFilter: "Land Only",
//         fields: fields,
//       },

//       {
//         type: "multifamily",
//         apiFilter: "Multi Family",
//         fields: fields,
//       },
//     ];

//     for (const config of syncConfigs) {
//       console.log(`Processing ${config.type}`);

//       const rawData = await fetchFromBridge(config.apiFilter, config.fields);

//       for (const raw of rawData) {
//         try {
//           let address;

//           if (config.type === "strata") {
//             address = [
//               raw.UnitNumber,
//               raw.StreetNumber,
//               raw.StreetName,
//               raw.StreetSuffix,
//             ];
//           } else {
//             address = [raw.StreetNumber, raw.StreetName, raw.StreetSuffix];
//           }

//           const imageUrls =
//             raw.Media?.map((m) => m.MediaURL || m.Uri || m.Url).filter(
//               Boolean,
//             ) || [];

//           if (!imageUrls.length) {
//             console.log(`No images ${raw.ListingId}`);

//             continue;
//           }

//           await uploadPropertyImages(
//             address,

//             imageUrls,

//             raw.ListingId,

//             config.type,
//           );
//         } catch (err) {
//           console.error(raw.ListingId, err.message);
//         }
//       }
//     }
//   } catch (err) {
//     console.error("Sync failed:", err.message);
//   }
// }

// storeImagesInDrive();

// const { google } = require("googleapis");
// const axios = require("axios");
// const fs = require("fs").promises; // Built into Node.js
// require("dotenv").config();

// // ------------------------------------
// // Configuration & Auth
// // ------------------------------------
// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
// );

// oauth2Client.setCredentials({
//   refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
// });

// const drive = google.drive({ version: "v3", auth: oauth2Client });
// const accessToken = process.env.BRIDGE_API_TOKEN;

// const PARCELS_ROOT_FOLDER_ID = "1dZnLEUjDYm7JiUNu3pJyKiyPlCOXWHm1";
// const STRATA_ROOT_FOLDER_ID = "1OHeWfV64XGXc_cZwXxu0sHReVm4hioVr";

// // ------------------------------------
// // 1. Local Database (SPEED BOOST)
// // ------------------------------------
// const DB_FILE = "./synced_mls.json";
// let syncedListings = new Set();

// async function loadLocalDatabase() {
//   try {
//     const data = await fs.readFile(DB_FILE, "utf-8");
//     const parsed = JSON.parse(data);
//     syncedListings = new Set(parsed);
//     console.log(
//       `📁 Loaded ${syncedListings.size} previously synced listings from local DB.`,
//     );
//   } catch (err) {
//     console.log("📁 No local database found. Creating a new one...");
//     await fs.writeFile(DB_FILE, JSON.stringify([]));
//   }
// }

// async function markAsSynced(mlsNumber) {
//   syncedListings.add(String(mlsNumber));
//   await fs.writeFile(DB_FILE, JSON.stringify([...syncedListings], null, 2));
// }

// // ------------------------------------
// // 2. Promise Cache (FIXES RACE CONDITIONS)
// // ------------------------------------
// const folderCache = new Map();

// function getOrCreateFolderCached(folderName, parentId) {
//   const cacheKey = `${parentId}_${folderName}`;

//   // If we are already in the process of creating this folder, wait for it!
//   if (folderCache.has(cacheKey)) {
//     return folderCache.get(cacheKey);
//   }

//   // Otherwise, create a Promise that will fetch/create the folder
//   const folderPromise = (async () => {
//     // Wrap Drive API in our retry logic
//     const res = await withRetry(() =>
//       drive.files.list({
//         q: `name='${folderName}' and '${parentId}' in parents and trashed=false`,
//         fields: "files(id,name)",
//       }),
//     );

//     if (res.data.files.length) {
//       return res.data.files[0].id;
//     }

//     const folder = await withRetry(() =>
//       drive.files.create({
//         requestBody: {
//           name: folderName,
//           mimeType: "application/vnd.google-apps.folder",
//           parents: [parentId],
//         },
//         fields: "id",
//       }),
//     );

//     console.log(`Created folder: ${folderName}`);
//     return folder.data.id;
//   })();

//   // Store the PROMISE in the cache, not the ID.
//   folderCache.set(cacheKey, folderPromise);
//   return folderPromise;
// }

// // ------------------------------------
// // 3. Retry Logic & Helpers
// // ------------------------------------
// const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// async function withRetry(apiCall, retries = 3, delay = 2000) {
//   for (let i = 0; i < retries; i++) {
//     try {
//       return await apiCall();
//     } catch (err) {
//       if (i === retries - 1) throw err;
//       console.warn(
//         `⚠️ API Error (Rate Limit/Network). Retrying in ${delay / 1000}s...`,
//       );
//       await wait(delay);
//     }
//   }
// }

// function chunkArray(array, size) {
//   const chunked = [];
//   for (let i = 0; i < array.length; i += size) {
//     chunked.push(array.slice(i, i + size));
//   }
//   return chunked;
// }

// function cleanStreetName(street) {
//   if (!street) return "";
//   const firstWord = street.trim().replace(/\s+/g, " ").split(" ")[0];
//   return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
// }

// // ------------------------------------
// // Image Uploader
// // ------------------------------------
// async function uploadPropertyImages(
//   address,
//   imageUrls,
//   mlsNumber,
//   propertyType,
// ) {
//   let streetName, propertyFolder, rootFolderId;

//   if (propertyType === "strata") {
//     streetName = cleanStreetName(address[2]);
//     propertyFolder = `${address[0]}-${address[1]}-${streetName}`;
//     rootFolderId = STRATA_ROOT_FOLDER_ID;
//   } else {
//     streetName = cleanStreetName(address[1]);
//     propertyFolder = `${address[0]}-${streetName}`;
//     rootFolderId = PARCELS_ROOT_FOLDER_ID;
//   }

//   // Folder creation is now safe from race conditions
//   const streetFolderId = await getOrCreateFolderCached(
//     streetName,
//     rootFolderId,
//   );
//   const photosFolderId = await getOrCreateFolderCached(
//     "Photos",
//     streetFolderId,
//   );
//   const propertyFolderId = await getOrCreateFolderCached(
//     propertyFolder,
//     photosFolderId,
//   );
//   const mlsFolderId = await getOrCreateFolderCached(
//     String(mlsNumber),
//     propertyFolderId,
//   );

//   // Upload images in batches of 10 to respect Google Drive rate limits
//   const imageBatches = chunkArray(imageUrls, 10);

//   for (const batch of imageBatches) {
//     const uploadPromises = batch.map(async (url) => {
//       try {
//         const fileName = url.split("/").pop().split("?")[0];

//         // Retry logic wrapped around both the download AND the upload
//         await withRetry(async () => {
//           const response = await axios.get(url, { responseType: "stream" });
//           await drive.files.create({
//             requestBody: { name: fileName, parents: [mlsFolderId] },
//             media: { mimeType: "image/jpeg", body: response.data },
//           });
//         });
//       } catch (err) {
//         console.error(`❌ Permanent upload failure for ${url}:`, err.message);
//       }
//     });

//     // Wait for the batch of 10 to finish before starting the next 10
//     await Promise.all(uploadPromises);
//   }

//   console.log(`✅ Completed: ${mlsNumber}`);
// }

// // ------------------------------------
// // Fetch Bridge Data
// // ------------------------------------
// const fields = [
//   "StreetNumber",
//   "StreetName",
//   "StreetSuffix",
//   "ListingId",
//   "Media",
// ];
// const strataFields = [
//   "StreetNumber",
//   "StreetName",
//   "StreetSuffix",
//   "UnitNumber",
//   "ListingId",
//   "Media",
// ];

// async function fetchFromBridge(structureType, selectedFields) {
//   const fieldsQuery = selectedFields.join(",");
//   let listings = [];
//   let skip = 0;

//   while (true) {
//     let url =
//       structureType === "MultiFamily Only"
//         ? `https://api.bridgedataoutput.com/api/v2/OData/bcres/Property?access_token=${accessToken}&$filter=StructureType eq 'Multi Family' and MLSAreaMajor eq 'Squamish'&$select=${fieldsQuery}&$top=200&$skip=${skip}`
//         : `https://api.bridgedataoutput.com/api/v2/OData/bcres/Property?access_token=${accessToken}&$filter=StructureType/any(a:a eq '${structureType}') and MLSAreaMajor eq 'Squamish'&$select=${fieldsQuery}&$top=200&$skip=${skip}`;

//     // Apply retry logic to the main Bridge API as well
//     const response = await withRetry(() => axios.get(url));
//     const data = response.data.value;
//     listings = listings.concat(data);

//     if (data.length < 200) break;
//     skip += 200;
//   }

//   console.log(`Fetched ${listings.length} ${structureType} listings.`);
//   return listings;
// }

// // ------------------------------------
// // Main Execution
// // ------------------------------------
// async function storeImagesInDrive() {
//   try {
//     await loadLocalDatabase();

//     const syncConfigs = [
//       { type: "detached", apiFilter: "Residential Detached", fields: fields },
//       {
//         type: "strata",
//         apiFilter: "Residential Attached",
//         fields: strataFields,
//       },
//       { type: "land", apiFilter: "Land Only", fields: fields },
//       { type: "multifamily", apiFilter: "Multi Family", fields: fields },
//     ];

//     for (const config of syncConfigs) {
//       console.log(`\n--- Processing ${config.type.toUpperCase()} ---`);
//       const rawData = await fetchFromBridge(config.apiFilter, config.fields);

//       // Filter out properties we already synced locally (ZERO API CALLS!)
//       const unProcessedListings = rawData.filter(
//         (raw) => !syncedListings.has(String(raw.ListingId)),
//       );

//       console.log(
//         `Found ${unProcessedListings.length} new listings to process.`,
//       );

//       const batches = chunkArray(unProcessedListings, 5); // Process 5 properties at once

//       for (const batch of batches) {
//         const batchPromises = batch.map(async (raw) => {
//           try {
//             let address =
//               config.type === "strata"
//                 ? [
//                     raw.UnitNumber,
//                     raw.StreetNumber,
//                     raw.StreetName,
//                     raw.StreetSuffix,
//                   ]
//                 : [raw.StreetNumber, raw.StreetName, raw.StreetSuffix];

//             const imageUrls =
//               raw.Media?.map((m) => m.MediaURL || m.Uri || m.Url).filter(
//                 Boolean,
//               ) || [];

//             if (!imageUrls.length) {
//               await markAsSynced(raw.ListingId); // Mark as synced even if no images, so we don't try again
//               return;
//             }

//             await uploadPropertyImages(
//               address,
//               imageUrls,
//               raw.ListingId,
//               config.type,
//             );
//             await markAsSynced(raw.ListingId); // Save to local JSON file
//           } catch (err) {
//             console.error(`Failed property ${raw.ListingId}:`, err.message);
//           }
//         });

//         await Promise.all(batchPromises);
//       }
//     }
//     console.log("\n🎉 FULL SYNC COMPLETE 🎉");
//   } catch (err) {
//     console.error("Sync failed:", err.message);
//   }
// }

// storeImagesInDrive();

const { google } = require("googleapis");
const axios = require("axios");
const fs = require("fs").promises;
require("dotenv").config();

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

// Replace with your actual Google Drive Root Folder IDs
const PARCELS_ROOT_FOLDER_ID = "1dZnLEUjDYm7JiUNu3pJyKiyPlCOXWHm1";
const STRATA_ROOT_FOLDER_ID = "1OHeWfV64XGXc_cZwXxu0sHReVm4hioVr";

// ------------------------------------
// 1. Local Database (Speed Boost & Write-Safe)
// ------------------------------------
const DB_FILE = "./synced_mls.json";
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
    console.log("📁 No local database found. Creating a new one...");
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
        `⚠️ API Error. Retrying in ${delay / 1000}s... (${err.message})`,
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
    rootFolderId = STRATA_ROOT_FOLDER_ID;
  } else {
    streetName = cleanStreetName(address[1]);
    propertyFolder = `${address[0]}-${streetName}`;
    rootFolderId = PARCELS_ROOT_FOLDER_ID;
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

  // Upload images in batches of 10 to respect Google Drive rate limits
  const imageBatches = chunkArray(imageUrls, 10);

  for (const batch of imageBatches) {
    const uploadPromises = batch.map(async (url) => {
      try {
        const fileName = url.split("/").pop().split("?")[0];

        await withRetry(async () => {
          const response = await axios.get(url, { responseType: "stream" });
          await drive.files.create({
            requestBody: { name: fileName, parents: [mlsFolderId] },
            media: { mimeType: "image/jpeg", body: response.data },
          });
        });
      } catch (err) {
        console.error(`❌ Permanent upload failure for ${url}:`, err.message);
      }
    });

    await Promise.all(uploadPromises);
  }

  console.log(`✅ Completed: ${mlsNumber}`);
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
  console.log(`\n🚀 [${trackName}] Fetching data...`);

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
    `\n✅ [${trackName}] Fetch complete. Found ${unProcessedListings.length} new listings.`,
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
          `❌ [${trackName}] Failed property ${raw.ListingId}:`,
          err.message,
        );
      }
    });

    await Promise.all(batchPromises);
  }

  console.log(`\n🏁 [${trackName}] Finished processing.`);
}

// ------------------------------------
// 7. Main Execution (Two Parallel Tracks)
// ------------------------------------
async function storeImagesInDrive() {
  try {
    await loadLocalDatabase();

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
      "\n⚡ Starting Simultaneous Sync Tracks: Parcels (5) & Strata (5) => Total 10 properties processing at once...",
    );

    // RUN BOTH TRACKS AT THE EXACT SAME TIME
    await Promise.all([
      processListingsCategory(parcelsConfigs, "TRACK 1: PARCELS"),
      processListingsCategory(strataConfigs, "TRACK 2: STRATA"),
    ]);

    // One final save to guarantee nothing was missed during the write lock
    await fs.writeFile(DB_FILE, JSON.stringify([...syncedListings], null, 2));

    console.log("\n🎉 FULL SYNC COMPLETE 🎉");
  } catch (err) {
    console.error("Sync failed:", err.message);
  }
}

// Execute the script
storeImagesInDrive();

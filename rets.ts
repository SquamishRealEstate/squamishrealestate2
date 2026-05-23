import axios from "axios";
import dns from "node:dns";
import dotenv from "dotenv";

// 1. Initialize dotenv immediately
dotenv.config();

// 2. Apply DNS fix
dns.setDefaultResultOrder("ipv4first");

// 3. Access your variable
const accessToken = process.env.BRIDGE_API_TOKEN;

// src/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key in environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- HELPERS ---
const formatArrayToString = (arr: any[]): string =>
  arr && Array.isArray(arr) ? arr.join(", ") : "";
const formatParcelNumber = (pid: string): string =>
  pid?.replace(/^(\d{3})(\d{3})(\d{3})$/, "$1-$2-$3") || "";

function getBathrooms(full: any, half: any): string {
  const f = parseInt(full) || 0;
  const h = parseInt(half) || 0;
  return f + h > 0 ? (f + h * 0.5).toString() : "−";
}

const toDate = (val: any) => (val && val !== "" ? val : null);
const toNum = (val: any) => {
  if (val === "" || val === null || val === undefined) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
};
const toArr = (val: any) => (Array.isArray(val) ? val : []);

const detachedFields = [
  "ParcelNumber",
  "ListingId",
  "StreetNumber",
  "StreetName",
  "StreetSuffix",
  "ListingContractDate",
  "ListingKeyNumeric",
  "MlsStatus",
  "OriginalListPrice",
  "BuildingAreaTotal",
  "LotSizeArea",
  "PublicRemarks",
  "AssociationAmenities",
  "Appliances",
  "Heating",
  "ListOfficeKey",
  "ParkingFeatures",
  "MLSAreaMinor",
  "PropertySubType",
  "BathroomsHalf",
  "BathroomsFull",
  "BedroomsTotal",
  "YearBuilt",
  "ModificationTimestamp",
  "BCRES_SubjectRemovalDate",
  "ClosePrice",
  "CloseDate",
  "BCRES_Age",
  "VirtualTourURLBranded",
  "Stories",
  "BCRES_MainFloorFinishedArea",
  "BCRES_AboveMainFinishedArea",
  "BCRES_AboveMain2FinishedArea",
  "BCRES_BasementFinishedArea",
  "BCRES_LivingAreaFinished",
  "BCRES_TotalFloorUnfinishedArea",
  "Media",
];

const strataFields = [
  "ParcelNumber",
  "ListingId",
  "StreetNumber",
  "UnitNumber",
  "StreetName",
  "StreetSuffix",
  "ListingContractDate",
  "ListingKeyNumeric",
  "MlsStatus",
  "OriginalListPrice",
  "BuildingAreaTotal",
  "PublicRemarks",
  "AssociationFee",
  "AssociationAmenities",
  "Appliances",
  "Heating",
  "ListOfficeKey",
  "ParkingFeatures",
  "MLSAreaMinor",
  "PropertySubType",
  "BathroomsHalf",
  "BathroomsFull",
  "BedroomsTotal",
  "YearBuilt",
  "ModificationTimestamp",
  "BCRES_SubjectRemovalDate",
  "ClosePrice",
  "CloseDate",
  "BCRES_Age",
  "VirtualTourURLBranded",
  "Stories",
  "BCRES_MainFloorFinishedArea",
  "BCRES_AboveMainFinishedArea",
  "BCRES_AboveMain2FinishedArea",
  "BCRES_BasementFinishedArea",
  "BCRES_LivingAreaFinished",
  "BCRES_TotalFloorUnfinishedArea",
  "Media",
];

const landFields = [
  "ParcelNumber",
  "ListingId",
  "StreetNumber",
  "StreetName",
  "StreetSuffix",
  "ListingContractDate",
  "ListingKeyNumeric",
  "MlsStatus",
  "OriginalListPrice",
  "BuildingAreaTotal",
  "LotSizeArea",
  "PublicRemarks",
  "Appliances",
  "ListOfficeKey",
  "MLSAreaMinor",
  "PropertySubType",
  "YearBuilt",
  "ModificationTimestamp",
  "BCRES_SubjectRemovalDate",
  "ClosePrice",
  "CloseDate",
  "VirtualTourURLBranded",
  "Media",
];

const multifamilyFields = [
  "ParcelNumber",
  "ListingId",
  "StreetNumber",
  "StreetName",
  "StreetSuffix",
  "ListingContractDate",
  "ListingKeyNumeric",
  "MlsStatus",
  "OriginalListPrice",
  "BuildingAreaTotal",
  "LotSizeArea",
  "PublicRemarks",
  "AssociationAmenities",
  "Appliances",
  "Heating",
  "ListOfficeKey",
  "ParkingFeatures",
  "MLSAreaMinor",
  "PropertySubType",
  "BathroomsHalf",
  "BathroomsFull",
  "BedroomsTotal",
  "YearBuilt",
  "ModificationTimestamp",
  "BCRES_SubjectRemovalDate",
  "ClosePrice",
  "CloseDate",
  "BCRES_Age",
  "VirtualTourURLBranded",
  "Stories",
  "BCRES_MainFloorFinishedArea",
  "BCRES_AboveMainFinishedArea",
  "BCRES_AboveMain2FinishedArea",
  "BCRES_BasementFinishedArea",
  "BCRES_LivingAreaFinished",
  "BCRES_TotalFloorUnfinishedArea",
  "Media",
];

/**
 * Fetches data from Bridge API with pagination
 */
async function fetchFromBridge(structureType: string, fields: string[]) {
  const fieldsQuery = fields.join(",");
  let allListings: any[] = [];
  let skip = 0;
  let url = " ";

  console.log(`📡 Starting fetch for: ${structureType}`);

  while (true) {
    if (structureType === "MultiFamily Only") {
      url = `https://api.bridgedataoutput.com/api/v2/OData/bcres/Property?access_token=${accessToken}&$filter= StructureType eq 'Multi Family' and StructureType ne 'Residential Attached' and MLSAreaMajor eq 'Squamish'&$select=${fieldsQuery}&$top=200&$skip=${skip}&$expand=ListOffice`;
    } else {
      url = `https://api.bridgedataoutput.com/api/v2/OData/bcres/Property?access_token=${accessToken}&$filter=StructureType/any(a: a eq '${structureType}') and MLSAreaMajor eq 'Squamish'&$select=${fieldsQuery}&$top=200&$skip=${skip}&$expand=ListOffice`;
    }
    const response = await axios.get(url);
    const data = response.data.value;

    allListings = allListings.concat(data);
    console.log(`✅ Fetched ${allListings.length} total...`);

    if (data.length < 200) break;
    skip += 200;
  }

  return allListings;
}

function processAndTransformListings(
  rawListings: any[],
  listingType: "detached" | "strata" | "land" | "multifamily",
) {
  const latestByPid: Record<string, any> = {};

  rawListings.forEach((raw) => {
    const pid = formatParcelNumber(raw.ParcelNumber);

    const existingListing = latestByPid[pid];
    const isNewer =
      !existingListing ||
      new Date(raw.ListingContractDate) >
        new Date(existingListing.listing_date);

    if (isNewer) {
      // 1. Base Mapping (Fields in ALL tables)
      const base: any = {
        pid: pid,
        listing_id: toNum(raw.ListingKeyNumeric),
        mls_number: raw.ListingId,
        listing_date: toDate(raw.ListingContractDate),
        market_status: raw.MlsStatus,
        asking_price: toNum(raw.OriginalListPrice),
        total_floor_area: toNum(raw.BuildingAreaTotal),
        listing_remarks: raw.PublicRemarks,
        features: toArr(raw.Appliances),
        sub_area: raw.MLSAreaMinor,
        dwell_type: raw.PropertySubType,
        year_built: toNum(raw.YearBuilt),
        listing_office: raw.ListOffice?.OfficeName || "",
        update_time: toDate(raw.ModificationTimestamp),
        subject_removal_date: toDate(raw.BCRES_SubjectRemovalDate),
        sold_price: toNum(raw.ClosePrice),
        completed_date: toDate(raw.CloseDate),
        virtual_tour: raw.VirtualTourURLBranded,
        photos: raw.Media ? raw.Media.map((m: any) => m.MediaURL) : [],
      };

      // 2. Build Address
      const addressParts = [
        listingType === "strata" ? raw.UnitNumber : null,
        raw.StreetNumber,
        raw.StreetName,
        raw.StreetSuffix,
      ].filter(Boolean);
      base.civic_address = addressParts.join(" ").trim();

      // 3. Conditional: Lot Size (ONLY for Detached and Land)
      if (
        listingType === "detached" ||
        listingType === "land" ||
        listingType === "multifamily"
      ) {
        base.lot_size = toNum(raw.LotSizeArea);
      }

      // 3. Conditional Fields (Only add what the table supports)
      if (listingType !== "land") {
        Object.assign(base, {
          amenities: toArr(raw.AssociationAmenities),
          heating: toArr(raw.Heating),
          parking: toArr(raw.ParkingFeatures),
          half_baths: toNum(raw.BathroomsHalf),
          full_baths: toNum(raw.BathroomsFull),
          bedrooms: toNum(raw.BedroomsTotal),
          years_constructed: toNum(raw.BCRES_Age),
          stories: toNum(raw.Stories),
          first_floor: toNum(raw.BCRES_MainFloorFinishedArea),
          second_floor: toNum(raw.BCRES_AboveMainFinishedArea),
          third_floor: toNum(raw.BCRES_AboveMain2FinishedArea),
          fourth_floor: toNum(raw.BCRES_BasementFinishedArea),
          finished: toNum(raw.BCRES_LivingAreaFinished),
          unfinished: toNum(raw.BCRES_TotalFloorUnfinishedArea),
        });
      }

      // 4. Strata ONLY fields
      if (listingType === "strata") {
        base.strata_fee = toNum(raw.AssociationFee);
      }

      latestByPid[pid] = base;
    }
  });

  return Object.values(latestByPid);
}

async function enrichAndSyncListings(
  processedListings: any[],
  listingType: "detached" | "strata" | "land" | "multifamily",
) {
  // 1. Determine which tables to use
  let targetListingTable: string;
  let sourceParcelTable: string;

  switch (listingType) {
    case "detached":
      targetListingTable = "detached_listings";
      sourceParcelTable = "parcels_duplicate";
      break;
    case "strata":
      targetListingTable = "strata_listings";
      sourceParcelTable = "strata_duplicate";
      break;
    case "land":
      targetListingTable = "land_listings";
      sourceParcelTable = "parcels_duplicate"; // Land usually uses the main parcel table
      break;
    case "multifamily":
      targetListingTable = "multifamily_listings";
      sourceParcelTable = "parcels_duplicate"; // Land usually uses the main parcel table
      break;
  }
  const finalListingUploads = [];
  const parcelUpdateBatch = [];

  console.log(
    `🔍 Enriching ${processedListings.length} ${listingType} listings using ${sourceParcelTable}...`,
  );

  for (const listing of processedListings) {
    // 2. Pull parcel data from the specific duplicate table
    const { data: parcel } = await supabase
      .from(sourceParcelTable)
      .select("*")
      .eq("pid", listing.pid)
      .single();

    if (parcel) {
      let mlsHistory = Array.isArray(parcel.mls_data) ? parcel.mls_data : [];
      let lastMlsDate = parcel.last_mls_date;

      // 3. History Logic (Pending / Closed)
      if (listing.market_status === "Pending") {
        const exists = mlsHistory.some(
          (h: any) =>
            String(h.price) === String(listing.sold_price) &&
            h.type === "Pending",
        );
        if (!exists) {
          mlsHistory.unshift({
            date: listing.subject_removal_date,
            price: listing.sold_price,
            type: "Pending",
          });
        }
      } else if (listing.market_status === "Closed") {
        const index = mlsHistory.findIndex(
          (item: any) => item.date === listing.subject_removal_date,
        );
        const newEntry = {
          date: listing.completed_date,
          price: listing.sold_price,
          type: "Improved Single Property",
        };

        if (
          index !== -1 ||
          (mlsHistory[0]?.type === "Pending" &&
            String(mlsHistory[0]?.price) === String(listing.sold_price))
        ) {
          const updateIndex = index !== -1 ? index : 0;
          mlsHistory[updateIndex] = newEntry;
        } else {
          const closedIndex = mlsHistory.findIndex(
            (item: any) => item.date === listing.completed_date,
          );
          if (closedIndex === -1) mlsHistory.unshift(newEntry);
        }
        lastMlsDate = listing.completed_date;
      }

      // 4. Calculate total bathrooms
      const totalBaths =
        (toNum(listing.full_baths) || 0) +
        (toNum(listing.half_baths) || 0) * 0.5;

      // 5. Mapping for the Listings Table
      const listingRecord: any = {
        ...listing,
        latitude: parcel.latitude,
        longitude: parcel.longitude,
        bc_assessment_data: parcel.bc_assessment_data,
        gross_tax_data: parcel.gross_tax_data,
        elementary_school: parcel.elementary_school,
        postal_code: parcel.postal_code,
        neighbourhood: parcel.neighbourhood,
        legal_detail: parcel.legal_detail,
        bc_assessment_desc: parcel.bc_assessment_desc,
        last_mls_date: lastMlsDate,
        mls_data: mlsHistory,
        lot_size: parcel.lot_size,
      };

      if (
        listingType === "detached" ||
        listingType === "land" ||
        listingType === "multifamily"
      ) {
        listingRecord.zone_code = parcel.zone_code;
        listingRecord.zone_desc = parcel.zone_desc;
      } else if (listingType === "strata") {
        listingRecord.zoning = parcel.zoning; // Strata uses 'zoning'
        listingRecord.gis_id = parcel.gis_id; // Added GISID for strata
      }

      finalListingUploads.push(listingRecord);

      // 6. Mapping for the Parcel/Strata Table update
      let updateRecord: any;

      if (listingType === "land") {
        // Specifically for Land: Fill specific specs with '0' as requested
        updateRecord = {
          pid: listing.pid,
          market_status: listing.market_status,
          bedrooms: "0",
          bathrooms: "0",
          year_constructed: "0",
          stories: "0",
          first_floor: "0",
          second_floor: "0",
          third_floor: "0",
          fourth_floor: "0",
          finished: "0",
          unfinished: "0",
          virtual_tour: listing.virtual_tour,
          last_mls: listing.mls_number,
          floor_area: listing.total_floor_area,
          photos: listing.photos,
          mls_data: mlsHistory,
          last_mls_date: lastMlsDate,
        };
      } else {
        // For Detached and Strata: Use actual calculated values
        updateRecord = {
          pid: listing.pid,
          market_status: listing.market_status,
          bedrooms: listing.bedrooms,
          bathrooms: totalBaths,
          year_constructed: listing.year_built,
          stories: listing.stories,
          first_floor: listing.first_floor,
          second_floor: listing.second_floor,
          third_floor: listing.third_floor,
          fourth_floor: listing.fourth_floor,
          finished: listing.finished,
          unfinished: listing.unfinished,
          virtual_tour: listing.virtual_tour,
          last_mls: listing.mls_number,
          floor_area: listing.total_floor_area,
          photos: listing.photos,
          mls_data: mlsHistory,
          last_mls_date: lastMlsDate,
          // Add strata_fee only if it's a strata type
          ...(listingType === "strata" && { strata_fee: listing.strata_fee }),
        };
      }

      parcelUpdateBatch.push(updateRecord);
    }
  }

  // 7. Bulk Upload / Upsert
  if (finalListingUploads.length > 0) {
    await supabase.from(targetListingTable).delete().neq("pid", "0");
    const { error } = await supabase
      .from(targetListingTable)
      .insert(finalListingUploads);
    if (error) {
      console.log("Error in listinsg upload");
      console.log(error);
      throw error;
    }
    console.log(`✅ ${targetListingTable} updated.`);
  }

  if (parcelUpdateBatch.length > 0) {
    const { error } = await supabase
      .from(sourceParcelTable)
      .upsert(parcelUpdateBatch, { onConflict: "pid" });
    if (error) {
      console.log("Error in properties upload");
      console.log(error);
      throw error;
    }
    console.log(`✅ ${sourceParcelTable} updated.`);
  }
}

const fetchOpenHouseListings = async (allListings: any[]) => {
  const batchSize = 200;
  let allOpenHouseListings: any[] = [];

  // Helper to chunk the data to stay within Bridge API URL limits
  const chunkArray = (array: any[], size: number) => {
    const result = [];
    for (let i = 0; i < array.length; i += size)
      result.push(array.slice(i, i + size));
    return result;
  };

  const batches = chunkArray(allListings, batchSize);

  for (let batch of batches) {
    // 1. Prepare MLS list for the API filter
    const mlsList = batch.map((l) => l.mls_number);
    const listingIdsString = `'${mlsList.join("','")}'`;

    console.log(
      `📡 Fetching Open Houses for batch of ${mlsList.length} listings...`,
    );

    try {
      const response = await fetch(
        `https://api.bridgedataoutput.com/api/v2/OData/bcres/OpenHouse?access_token=${accessToken}&$filter=ListingId in (${listingIdsString})`,
      );

      if (!response.ok) {
        console.error(`❌ Bridge API Error: ${response.statusText}`);
        continue;
      }

      const data = await response.json();

      if (!data.value || data.value.length === 0) {
        console.log("ℹ️ No open houses found in this batch.");
        continue;
      }

      // 2. Map the data and ENRICH with Photos/Type from memory
      const mappedBatch = data.value.map((oh: any) => {
        // Find the original listing in our master list using the ListingId
        const original = allListings.find((l) => l.mls_number === oh.ListingId);

        return {
          // Standard Fields from Bridge
          mls_number: oh.ListingId,
          listing_id: oh.ListingKeyNumeric,
          status: oh.OpenHouseStatus,
          status_date: oh.ModificationTimestamp
            ? oh.ModificationTimestamp.split("T")[0]
            : null,
          comments: oh.OpenHouseRemarks,
          end_timestamp: oh.OpenHouseEndTime,
          start_timestamp: oh.OpenHouseStartTime,
          start_date: oh.OpenHouseDate,

          // Enriched Fields (from our local memory)
          photos: original?.photos || [],
          type: original?.type || "",
        };
      });

      allOpenHouseListings = [...allOpenHouseListings, ...mappedBatch];
      console.log(`✅ Found ${mappedBatch.length} Open Houses.`);
    } catch (error: any) {
      console.error("❌ Error in Open House batch processing:", error.message);
    }
  }

  console.log(`🏁 Total Open Houses gathered: ${allOpenHouseListings.length}`);
  return allOpenHouseListings;
};

async function postOpenHouseListings(openhouseListings: any[]) {
  if (!openhouseListings || openhouseListings.length === 0) {
    console.log("ℹ️ No Open Houses to post.");
    return;
  }

  try {
    console.log(`🧹 Clearing old open houses from Supabase...`);
    // Use a filter that catches everything, like 'mls_number' is not null
    const { error: delErr } = await supabase
      .from("openhouse_listings")
      .delete()
      .neq("mls_number", "0");

    if (delErr) throw delErr;

    console.log(
      `📤 Inserting ${openhouseListings.length} open houses into Supabase...`,
    );

    const { data, error: insErr } = await supabase
      .from("openhouse_listings")
      .insert(openhouseListings);

    if (insErr) throw insErr;

    console.log("🚀 Open Houses synced successfully to Supabase!");
  } catch (error: any) {
    console.error("❌ Error updating Open Houses in Supabase:", error.message);
  }
}

async function syncAllListings() {
  try {
    // 1. Define your sync configurations
    const syncConfigs = [
      {
        type: "detached",
        apiFilter: "Residential Detached",
        fields: detachedFields,
      },
      {
        type: "strata",
        apiFilter: "Residential Attached",
        fields: strataFields,
      },
      { type: "land", apiFilter: "Land Only", fields: landFields },
      {
        type: "multifamily",
        apiFilter: "MultiFamily Only",
        fields: multifamilyFields,
      },
    ];

    let allProcessed: any[] = [];

    console.log("🚀 Starting Full Property Sync...");

    // 2. Loop through each configuration
    for (const config of syncConfigs) {
      console.log(`--- Processing ${config.type.toUpperCase()} ---`);

      // Fetch from Bridge API
      const rawData = await fetchFromBridge(config.apiFilter, config.fields);

      if (!rawData || rawData.length === 0) {
        console.log(`⚠️ No listings found for ${config.type}, skipping...`);
        continue;
      }

      // Transform & Deduplicate
      const processed = processAndTransformListings(
        rawData,
        config.type as any,
      );

      if (config.type !== "multifamily") {
        const tagged = processed.map((l) => ({
          mls_number: l.mls_number,
          photos: l.photos,
          type: config.type,
        }));
        allProcessed = [...allProcessed, ...tagged];
      }

      await enrichAndSyncListings(processed, config.type as any);

      console.log(`✅ Completed sync for ${config.type}`);
    }

    const openhouses = await fetchOpenHouseListings(allProcessed);
    await postOpenHouseListings(openhouses);

    console.log("🎉 ALL SYNC PROCESSES COMPLETE!");
  } catch (error: any) {
    console.error("❌ Critical Sync Failure:", error.message);
  }
}

syncAllListings();

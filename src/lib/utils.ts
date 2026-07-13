import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/config/supabaseClient";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string): string {
  const priceNum = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceNum);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-CA").format(num);
}

export function formatPid(pid: any): string {
  return pid.slice(0, 3) + "-" + pid.slice(3, 6) + "-" + pid.slice(6);
}

export const formatString = (inputString: any) => {
  return inputString.replace(/ /g, "-").toLowerCase();
};

export const checkIfEmpty = (input: string | number) => {
  if (input === 0 || input === "0" || input === "" || input === "0 sf") {
    return "-";
  } else {
    return input;
  }
};

export const numberWithCommas = (input: string | number) => {
  const number =
    typeof input === "string"
      ? parseFloat(input.replace(/,/g, ""))
      : Number(input);
  return number.toLocaleString("en-US");
};

export function getBathrooms(
  FULL_BATH: number | null | undefined,
  HALF_BATH: number | null | undefined,
) {
  // Fallback to 0 if the value is null, undefined, or NaN
  const fullBathCount = FULL_BATH && !isNaN(FULL_BATH) ? FULL_BATH : 0;
  const halfBathCount = HALF_BATH && !isNaN(HALF_BATH) ? HALF_BATH : 0;

  const totalBathrooms = fullBathCount + halfBathCount * 0.5;

  // Return the total if it's greater than 0, otherwise return your fallback dash
  return totalBathrooms > 0 ? totalBathrooms : "−";
}

export const handleUpload = async (
  files: File | File[],
  folderType: "blogs" | "reviews",
): Promise<string[]> => {
  try {
    const formData = new FormData();
    const fileArray = Array.isArray(files) ? files : [files];

    fileArray.forEach((file) => {
      formData.append("files", file); // API should use getAll("files")
    });
    formData.append("folderType", folderType);

    const response = await fetch("/api/upload-drive", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    const data = await response.json();
    // Return array of URLs (even if it's just one)
    return data.urls;
  } catch (err) {
    console.error("Upload error:", err);
    throw err;
  }
};

export function getElapsedTime(listDate: Date): string {
  if (!listDate) return "—";

  // Ensure we have a valid Date object instance
  const listingDate =
    typeof listDate === "string" ? new Date(listDate) : listDate;

  // Check if the date object is valid (e.g., handles invalid string formats safely)
  if (isNaN(listingDate.getTime())) {
    return "Invalid date format";
  }

  const todayDate = new Date();
  const deltaT = todayDate.getTime() - listingDate.getTime();

  // Handle case where listing date is set in the future due to timezone mismatches
  if (deltaT < 0) return "New Listing";

  const listingDays = Math.floor(deltaT / (1000 * 60 * 60 * 24));

  if (listingDays === 0) {
    return "Listed today";
  }

  if (listingDays < 30) {
    return listingDays === 1 ? "1 day ago" : `${listingDays} days ago`;
  } else {
    const months = Math.floor(listingDays / 30);
    const days = listingDays % 30;

    const monthStr = months === 1 ? "1 month" : `${months} months`;
    const dayStr = days === 0 ? "" : days === 1 ? ", 1 day" : `, ${days} days`;

    return `${monthStr}${dayStr} ago`;
  }
}

// export const formatDate = (inputDate: Date): string => {
//   if (!inputDate) return "N/A";

//   const date = typeof inputDate === "string" ? new Date(inputDate) : inputDate;
//   if (isNaN(date.getTime())) return "Invalid Date";

//   const months = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];

//   // Use UTC or local methods depending on your database timezone preferences
//   const day = date.getDate();
//   const monthIndex = date.getMonth();
//   const year = date.getFullYear();

//   return `${day} ${months[monthIndex]}, ${year}`;
// };

export function formatDate(
  dateObject: Date | string | null | undefined,
): string {
  if (!dateObject) return "";

  const date = new Date(dateObject);

  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC", // Optional: locks the day to match the DB exactly
  }).format(date);
}

export function getGarageSituation(availableParking: any): string {
  const answer: string = "Other";
  if (!availableParking) return answer;

  // Typo fixed: 'Carpot' updated to 'Carport'
  const rank: string[] = [
    "Triple",
    "Double",
    "Single",
    "Carport",
    "Carpot",
    "Open",
    "Parking Available",
    "Underground",
  ];

  try {
    let parkingList: string[] = [];

    // 1. If Supabase returns it as a native array of items/strings
    if (Array.isArray(availableParking)) {
      parkingList = availableParking.map((item) => String(item));
    }
    // 2. Fallback: If it's saved as a stringified JSON array or standard string
    else if (typeof availableParking === "string") {
      if (availableParking.startsWith("[") && availableParking.endsWith("]")) {
        parkingList = JSON.parse(availableParking).map((item: any) =>
          String(item),
        );
      } else {
        parkingList = availableParking.split(",");
      }
    }

    // Run the prioritization hierarchy matrix evaluation match
    for (const parkingType of rank) {
      for (const word of parkingList) {
        if (word.toLowerCase().includes(parkingType.toLowerCase())) {
          // Normalize spelling output for the client UI layer
          return parkingType === "Carpot" ? "Carport" : parkingType;
        }
      }
    }
  } catch (error) {
    console.error("Error parsing parking JSONB metadata field:", error);
  }

  return answer;
}

export function formatTime(timestamp: string): string {
  const options = {
    hour: "numeric",
    minute: "numeric",
  } as const;

  const date = new Date(timestamp);

  return date.toLocaleString("en-US", {
    ...options,
    timeZone: "America/Los_Angeles",
  });
}

export const formatDatePST = (timestamp: string): string => {
  const date = new Date(timestamp);

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const formatTimePST = (timestamp: string): string => {
  const date = new Date(timestamp);

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

import { FilterState } from "@/components/ListingFilters";

export function serializeFilters(filters: FilterState): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (key === "propertiesOnly" && value === true) {
      params.set(key, "true");
    } else if (Array.isArray(value)) {
      if (value.length > 0) params.set(key, value.join(","));
    } else if (value && typeof value !== "boolean") {
      params.set(key, value);
    }
  });
  return params.toString();
}

export function deserializeFilters(searchParams: any, user: any): FilterState {
  return {
    propertiesOnly: searchParams.get("propertiesOnly") === "true", // Add this
    searchQuery: searchParams.get("searchQuery") || "",
    category: searchParams.get("category")
      ? searchParams.get("category").split(",")
      : [],
    status: searchParams.get("status")
      ? searchParams.get("status").split(",")
      : user
        ? []
        : ["Active"],
    bedrooms: searchParams.get("bedrooms") || "",
    bathrooms: searchParams.get("bathrooms") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minLot: searchParams.get("minLot") || "",
    maxLot: searchParams.get("maxLot") || "",
    minArea: searchParams.get("minArea") || "",
    maxArea: searchParams.get("maxArea") || "",
    minYear: searchParams.get("minYear") || "",
    maxYear: searchParams.get("maxYear") || "",
  };
}

// Helper to clean suffix and convert to Title Case (e.g., "ALDER PL" -> "Alder")
export function cleanStreetName(streetPhrase: string) {
  if (!streetPhrase) return "";

  const words = streetPhrase.trim().split(/\s+/);
  // Common suffixes to identify and remove from the end of the path
  const suffixes = [
    "PL",
    "ST",
    "AVE",
    "RD",
    "DR",
    "BLVD",
    "WAY",
    "LN",
    "CRT",
    "CT",
    "CRES",
    "CIR",
    "GATE",
  ];

  // Remove the suffix if it's the last word
  if (
    words.length > 1 &&
    suffixes.includes(words[words.length - 1].toUpperCase())
  ) {
    words.pop();
  }

  // Format to Title Case (capitalize first letter, lowercase the rest)
  return words
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export const preloadImage = (src: string) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = resolve;
    img.onerror = resolve;
  });
};

export const fetchFloorPlans = async (
  property: any,
  type: string,
): Promise<string[]> => {
  console.log("Fetching Floor Plans for:", type);
  let bucketName = "";
  let folderPath = "";
  let targetPrefix = "";

  const isDetachedOrLand = ["detached", "multifamily", "land"].some((t) =>
    type.includes(t),
  );
  const isStrata = type.includes("strata");

  let civicAddress = property.civic_address.replace(/-/g, " ");
  var civic_address = civicAddress.split(" ");

  // --- CASE 1: DETACHED / MULTIFAMILY / LAND ---
  if (isDetachedOrLand) {
    if (!property.civic_address) return [];

    bucketName = "streetview";

    if (!isNaN(Number(civic_address[1]))) {
      civic_address[2] =
        civic_address[2][0].toUpperCase() +
        civic_address[2].slice(1).toLowerCase();
      folderPath = `${civic_address[2]}/fp`;
      targetPrefix = `${civic_address[0]}-${civic_address[1]}-${civic_address[2]}`;
    } else {
      civic_address[1] =
        civic_address[1][0].toUpperCase() +
        civic_address[1].slice(1).toLowerCase();
      folderPath = `${civic_address[1]}/fp`;
      targetPrefix = `${civic_address[0]}-${civic_address[1]}}`;
    }
  }

  // --- CASE 2: STRATA ---
  else if (isStrata) {
    bucketName = "strata";
    console.log("Strata bucket name:", bucketName);

    if (!property.civic_address) return [];

    // FIX: Ensure no trailing or double slashes are built into this string path
    folderPath = `${property.gis_id}/fp`;

    civic_address[0] = civic_address[0].replace(/,/g, "");
    civic_address[2] =
      civic_address[2][0].toUpperCase() +
      civic_address[2].slice(1).toLowerCase();

    // Target prefix for filtering files inside that folder
    targetPrefix = `${civic_address[0]}-${civic_address[1]}-${civic_address[2]}-Floor-Plan`;
    console.log("Strata target prefix:", targetPrefix);
  } else {
    return [];
  }

  // --- CORE UTILITY: EXECUTE STORAGE LOOKUP ---
  try {
    // Clean and explicitly trim the target prefix to prevent invisible spaces from breaking matches
    const searchPrefix = targetPrefix.trim();

    // FIX 1: Pass the search option directly to Supabase.
    // This instructs Supabase to only return files matching "1855-Alder-Floor-Plan" inside "Alder/fp"
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath, {
        limit: 100,
        search: searchPrefix,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      console.error("Supabase Storage error:", error.message);
      return [];
    }

    if (!files || files.length === 0) {
      console.log(
        `No assets returned by Supabase API for path: ${bucketName}/${folderPath} with search prefix: ${searchPrefix}`,
      );
      return [];
    }

    // FIX 2: Relax validation using case-insensitive extension matching (.png vs .PNG)
    const matchedUrls = files
      .filter((file) => {
        const lowerName = file.name.toLowerCase();
        return lowerName.endsWith(".png") || lowerName.endsWith(".webp");
      })
      .map((file) => {
        // Build absolute public URLs safely
        const fullPath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${folderPath}/${file.name}`;
        return encodeURI(fullPath);
      });

    return matchedUrls;
  } catch (err) {
    console.error(
      "Critical failure during floor plan recovery execution:",
      err,
    );
    return [];
  }
};

export const getS3Image = (
  property: any,
  propertyType: any,
  imageType: string,
) => {
  const PARCELS_BUCKET_NAME = "streetview";
  const STRATA_BUCKET_NAME = "strata";

  if (!property || !property.civic_address) return "";

  let civicAddress = property.civic_address.replace(/-/g, " ");
  var civic_address = civicAddress.split(" ");

  if (
    propertyType === "detached" ||
    propertyType === "multifamily" ||
    propertyType === "land" ||
    propertyType === "parcel"
  ) {
    if (!isNaN(Number(civic_address[1]))) {
      civic_address[2] =
        civic_address[2][0].toUpperCase() +
        civic_address[2].slice(1).toLowerCase();
    } else {
      civic_address[1] =
        civic_address[1][0].toUpperCase() +
        civic_address[1].slice(1).toLowerCase();
    }

    const card_image_path = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${PARCELS_BUCKET_NAME}/${civic_address[1]}/${imageType}/${civic_address[0]}-${civic_address[1]}.webp`;
    return encodeURI(card_image_path);
  } else if (propertyType.includes("strata")) {
    const cleanedAddress = property.civic_address
      .replace("-", " ")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .toLowerCase()
      .split(" ");
    cleanedAddress[2] =
      cleanedAddress[2][0].toUpperCase() +
      cleanedAddress[2].slice(1).toLowerCase();
    const address =
      cleanedAddress[0] + "-" + cleanedAddress[1] + "-" + cleanedAddress[2];

    if (imageType === "card") {
      const card_image_path = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${STRATA_BUCKET_NAME}/${property.gis_id}/card.webp`;
      return encodeURI(card_image_path);
    } else {
      const card_image_path = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${STRATA_BUCKET_NAME}/${property.gis_id}/landing/${address}.webp`;
      return encodeURI(card_image_path);
    }
  }
  return "";
};

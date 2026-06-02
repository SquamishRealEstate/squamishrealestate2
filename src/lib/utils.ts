import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

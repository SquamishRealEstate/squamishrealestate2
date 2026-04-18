import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
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

export function getBathrooms(FULL_BATH: string, HALF_BATH: string) {
  const halfBathExists = Boolean(HALF_BATH.trim().replace("-", ""));
  const fullBathExists = Boolean(FULL_BATH.trim().replace("-", ""));

  const halfBathCount = halfBathExists ? parseInt(HALF_BATH) : 0;
  const fullBathCount = fullBathExists ? parseInt(FULL_BATH) : 0;

  if (fullBathCount || halfBathCount) {
    return fullBathCount + halfBathCount * 0.5;
  } else {
    return "−";
  }
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

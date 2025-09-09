import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function flattenAttributes(data: any): any {
  if (
    typeof data !== "object" ||
    data === null ||
    data instanceof Date ||
    typeof data === "function"
  ) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => flattenAttributes(item));
  }
  let flattened: { [key: string]: any } = {};
  for (let key in data) {
    if (!data.hasOwnProperty(key)) continue;
    if (
      (key === "attributes" || key === "data") &&
      typeof data[key] === "object" &&
      !Array.isArray(data[key])
    ) {
      Object.assign(flattened, flattenAttributes(data[key]));
    } else {
      flattened[key] = flattenAttributes(data[key]);
    }
  }
  return flattened;
}

export function getStrapiURL() {
  return process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
}

export function getStrapiMedia(url: string | null) {
  if (url == null) return null;
  if (url.startsWith("data:")) return url;
  if (url.startsWith("http") || url.startsWith("//")) return url;
  return `${getStrapiURL()}${url}`;
}

export function extractYouTubeID(
  urlOrID: string | null | undefined
): string | null {
  if (!urlOrID) return null;
  if (typeof urlOrID !== "string") return null;

  const str = urlOrID.trim();

  const isYouTubeID = /^[a-zA-Z0-9_-]{11}$/.test(str);
  if (isYouTubeID) return str;

  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = str.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

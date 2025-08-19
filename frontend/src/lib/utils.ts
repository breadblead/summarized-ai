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

export function extractYouTubeID(urlOrID: string): string | null {
  const regExpID = /^[a-zA-Z0-9_-]{11}$/;

  if (regExpID.test(urlOrID)) {
    return urlOrID;
  }

  const regExpStandard = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;

  const regExpShorts = /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/;

  const matchStandard = urlOrID.match(regExpStandard);
  if (matchStandard) {
    return matchStandard[1];
  }

  const matchShorts = urlOrID.match(regExpShorts);
  if (matchShorts) {
    return matchShorts[1];
  }

  return null;
}

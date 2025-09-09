import { getStrapiURL } from "@/lib/utils";
import { getAuthToken } from "./get-token";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function mutateData<T = any>(
  method: HttpMethod,
  path: string,
  payload?: unknown,
  token?: string
): Promise<T> {
  const baseUrl = getStrapiURL();
  const url = new URL(path, baseUrl);

  const authToken = token ?? (await getAuthToken());
  if (!authToken) throw new Error("No auth token found");

  const hasBody = payload !== undefined && method !== "GET";

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: hasBody ? JSON.stringify(payload) : undefined,
    cache: "no-store",
  });

  if (method === "DELETE") {
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const j = await res.json();
        msg = j?.error?.message || j?.message || msg;
      } catch {}
      throw new Error(msg);
    }
    return true as unknown as T;
  }

  let json: any = null;
  if (res.status !== 204) {
    try {
      json = await res.json();
    } catch {
      json = null;
    }
  }

  if (!res.ok || (json && json.error)) {
    const msg = json?.error?.message || json?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return json as T;
}

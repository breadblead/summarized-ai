import { getStrapiURL } from "@/lib/utils";
import { getAuthToken } from "./get-token";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Универсальная сигнатура: можно передать ожидаемый тип ответа <T>
export async function mutateData<T = any>(
  method: HttpMethod,
  path: string,
  payload?: unknown,
  token?: string // ← можно передать токен снаружи
): Promise<T> {
  const baseUrl = getStrapiURL(); // например: http://localhost:1337
  const url = new URL(path, baseUrl); // path = "/api/summaries"

  // Если токен не передали — достанем внутри
  const authToken = token ?? (await getAuthToken());
  if (!authToken) throw new Error("No auth token found");

  const hasBody = payload !== undefined && method !== "GET";

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
      // ВАЖНО: не ставим "Strapi-Response-Format: v4", если хотим documentId
    },
    body: hasBody ? JSON.stringify(payload) : undefined,
    cache: "no-store",
  });

  // DELETE может вернуть 204 — просто отдаём true/false
  if (method === "DELETE") {
    if (!res.ok) {
      // Попробуем вытащить текст ошибки (если есть)
      let msg = `HTTP ${res.status}`;
      try {
        const j = await res.json();
        msg = j?.error?.message || j?.message || msg;
      } catch {}
      throw new Error(msg);
    }
    return true as unknown as T;
  }

  // Безопасно парсим тело (на 204 тела нет)
  let json: any = null;
  if (res.status !== 204) {
    try {
      json = await res.json();
    } catch {
      // пустое/не-JSON тело
      json = null;
    }
  }

  // Строго кидаем на любом фейле
  if (!res.ok || (json && json.error)) {
    const msg = json?.error?.message || json?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return json as T;
}

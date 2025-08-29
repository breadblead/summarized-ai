"use server";

import { getAuthToken } from "@/data/services/get-token";
import { mutateData } from "@/data/services/mutate-data";
import { redirect } from "next/navigation";

interface Payload {
  data: { title?: string; videoId: string; summary: any };
}

type V5Create = { data: { documentId: string } };

export async function createSummaryAction(payload: Payload) {
  const token = await getAuthToken();
  if (!token) throw new Error("No auth token found");

  // 🛡️ мягко приводим к строке
  const raw = payload.data.summary;
  const summary =
    typeof raw === "string" ? raw : JSON.stringify(raw ?? "", null, 2);

  const safePayload = {
    data: {
      title: payload.data.title,
      videoId: payload.data.videoId,
      summary,
    },
  };

  const res = await mutateData<V5Create>(
    "POST",
    "/api/summaries",
    safePayload,
    token
  );

  const documentId = res?.data?.documentId;
  if (!documentId) {
    console.error("Create Summary raw:", JSON.stringify(res, null, 2));
    throw new Error("Invalid API response: documentId missing");
  }

  redirect(`/dashboard/summaries/${documentId}`);
}

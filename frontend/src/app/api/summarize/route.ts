import { NextRequest } from "next/server";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import { getAuthToken } from "@/data/services/get-token";

import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// ✅ Официальный SDK Gemini
import { GoogleGenAI } from "@google/genai";

const TEMPLATE = `
INSTRUCTIONS:
- Detect the original language of the transcript and perform ALL steps in that same language.
- Also output one line at the very end: "LANG:<iso_639_1_code>" (e.g., LANG:ru, LANG:en, LANG:es).
- Generate a title based on the content.
- Summarize the content in first person, natural tone, include 5 key topics.
- Write a YouTube video description with headings, sections, keywords, and key takeaways.
- Generate a bulleted list of key points and benefits.
- Provide possible and best recommended keywords.
`;

// -------------------- helpers --------------------
function extractLangCode(s: string): string | null {
  // Ищем "LANG:xx" (в конце или где-нибудь в тексте)
  const m = s.match(/^\s*LANG\s*:\s*([a-z]{2})(?:-[A-Z]{2})?\s*$/im);
  return m?.[1] ?? null; // "ru" | "en" | "es" ...
}

function stripLangTag(s: string): string {
  return s.replace(/^\s*LANG\s*:\s*[a-z]{2}(?:-[A-Z]{2})?\s*$/gim, "").trim();
}

function chunkText(text: string, max = 8000): string[] {
  if (text.length <= max) return [text];
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += max) {
    chunks.push(text.slice(i, i + max));
  }
  return chunks;
}

// -------------------- Gemini: суммаризация транскрипта --------------------
async function generateSummary(transcript: string, template: string) {
  // Готовим system-инструкцию как отдельную часть (см. доки по contents)
  const prompt = PromptTemplate.fromTemplate(template);
  const systemInstruction = await prompt.format({ text: "" });

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const modelId = process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite";

  // Если транскрипт очень большой — чанкнём и попросим собрать финальный summary
  const chunks = chunkText(transcript, 8000);

  try {
    // 1) Если один чанк — делаем прямой запрос
    if (chunks.length === 1) {
      const resp = await ai.models.generateContent({
        model: modelId,
        contents: [
          { role: "user", parts: [{ text: systemInstruction }] },
          { role: "user", parts: [{ text: chunks[0] }] },
        ],
      });
      // В JS-квикстарте это .text (геттер) — см. официальный пример
      const raw = (resp as any).text ?? resp.text;
      const lang = extractLangCode(raw) ?? "en";
      const cleaned = stripLangTag(raw);

      // Парсим для совместимости с твоей схемой
      const outputParser = new StringOutputParser();
      const parsed = await outputParser.parse(cleaned);

      return { text: parsed, lang };
    }

    // 2) Если чанков несколько — отправляем их как отдельные сообщения,
    // затем модель сама склеит итог (дешевле, чем много проходов)
    const parts = [
      { role: "user", parts: [{ text: systemInstruction }] } as const,
    ];
    for (const c of chunks) {
      parts.push({ role: "user", parts: [{ text: c }] } as const);
    }

    const resp = await ai.models.generateContent({
      model: modelId,
      contents: parts as any,
    });
    const raw = (resp as any).text ?? resp.text;
    const lang = extractLangCode(raw) ?? "en";
    const cleaned = stripLangTag(raw);

    const outputParser = new StringOutputParser();
    const parsed = await outputParser.parse(cleaned);

    return { text: parsed, lang };
  } catch (error: any) {
    const message = error?.message ?? "Failed to generate summary.";
    return new Response(JSON.stringify({ error: message }));
  }
}

// -------------------- Твой Route Handler --------------------
export async function POST(req: NextRequest) {
  const user = await getUserMeLoader();
  const token = await getAuthToken();

  if (!user.ok || !token) {
    return new Response(
      JSON.stringify({ data: null, error: "Not authenticated" }),
      { status: 401 }
    );
  }

  if (user.data.credits < 1) {
    return new Response(
      JSON.stringify({ data: null, error: "Insufficient credits" }),
      { status: 402 }
    );
  }

  const body = await req.json();
  const videoId = body.videoId;
  const url = `https://deserving-harmony-9f5ca04daf.strapiapp.com/utilai/yt-transcript/${videoId}`;

  let transcriptData: string;

  try {
    const transcript = await fetch(url);
    transcriptData = await transcript.text();

    console.log(
      `summarize/route.ts - transcript length`,
      transcriptData.length
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message ?? "Unknown error" })
    );
  }

  try {
    const result = await generateSummary(transcriptData, TEMPLATE);

    // Если generateSummary вернул Response (ошибка) — пробросим её как есть
    if (result instanceof Response) return result;

    // Возвращаем и текст summary, и определённый ISO-код языка — чтобы фронт/бек мог
    // сохранить запись в Strapi под правильной локалью (locale=<lang>).
    // Строку LANG:... мы уже вырезали.
    return new Response(
      JSON.stringify({
        data: result.text,
        locale: result.lang, // <-- используй это как locale при записи в Strapi
        error: null,
      })
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message ?? "Error generating summary." })
    );
  }
}

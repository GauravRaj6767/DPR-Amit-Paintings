import { GoogleGenAI } from "@google/genai"
import { z } from "zod"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
const MODEL = "gemini-2.0-flash"

const ExtractionSchema = z.object({
  workers_present: z.union([z.number().int().nonnegative(), z.null()]).catch(null),
  work_done: z.union([z.string().max(1000), z.null()]).catch(null),
  materials_needed: z.union([z.string().max(500), z.null()]).catch(null),
  issues_flagged: z.union([z.string().max(500), z.null()]).catch(null),
  summary: z.union([z.string().max(500), z.null()]).catch(null),
})

// Transcribe audio bytes using Gemini's native audio understanding
export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const base64Audio = audioBuffer.toString("base64")

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Audio,
            },
          },
          {
            text: "Transcribe this audio message exactly as spoken. The speaker may use Hindi, English, or Hinglish (Hindi-English mix). Output only the transcription, nothing else.",
          },
        ],
      },
    ],
  })

  return response.text ?? ""
}

type ExtractionResult = z.infer<typeof ExtractionSchema>

// Extract structured daily report from combined text
export async function extractReportData(combinedText: string): Promise<ExtractionResult> {
  const prompt = `You are processing a daily progress report from a painting site supervisor sent via WhatsApp.
The messages below may be in English or Hindi or a mix (Hinglish). Extract the following fields:

1. workers_present: number of workers present today (integer, or null if not mentioned)
2. work_done: what work was done today (1-3 sentences, or null if not mentioned)
3. materials_needed: materials or supplies needed (comma-separated list, or null if not mentioned)
4. issues_flagged: any problems or issues mentioned (1-2 sentences, or null if none)
5. summary: a brief 1-sentence overall summary of the day's report

Respond ONLY with a valid JSON object with exactly these 5 keys. No markdown, no explanation.

Messages:
${combinedText}`

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  })

  const text = (response.text ?? "").trim()

  // Strip markdown code fences if present
  const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim()

  try {
    const parsed = JSON.parse(clean)
    return ExtractionSchema.parse(parsed)
  } catch {
    console.error("[gemini] Failed to parse extraction response:", text)
    return {
      workers_present: null,
      work_done: null,
      materials_needed: null,
      issues_flagged: null,
      summary: text.slice(0, 500) || null,
    }
  }
}

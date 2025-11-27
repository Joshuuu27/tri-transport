import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { text } = await req.json();

  const audio = await client.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "alloy",
    input: text,
    format: "mp3",
  });

  return new NextResponse(audio.body, {
    headers: {
      "Content-Type": "audio/mpeg",
    },
  });
}

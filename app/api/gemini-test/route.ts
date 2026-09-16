import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "GEMINI_API_KEY is missing from .env.local",
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents:
        "Write one short, warm, encouraging motivational sentence for someone having a normal day.",
    });

    return NextResponse.json({
      success: true,
      thought:
        response.text?.trim() ||
        "Keep going. You are doing better than you think.",
    });
  } catch (error: unknown) {
    console.error("Gemini test error:", error);

    const message =
      error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
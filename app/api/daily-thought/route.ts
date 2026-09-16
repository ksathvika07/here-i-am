import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get the currently logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    // Use today's UTC date as the daily key
    const today = new Date().toISOString().split("T")[0];

    // Check whether today's thought already exists
    const { data: existingThought, error: fetchError } = await supabase
      .from("daily_thoughts")
      .select("thought")
      .eq("user_id", user.id)
      .eq("thought_date", today)
      .maybeSingle();

    if (fetchError) {
      console.error("Daily thought fetch error:", fetchError);

      return NextResponse.json(
        {
          error: "Unable to load today's thought.",
        },
        { status: 500 }
      );
    }

    // Return the saved thought instead of generating another one
    if (existingThought) {
      return NextResponse.json({
        success: true,
        thought: existingThought.thought,
        generated: false,
      });
    }

    // Gemini API key
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is missing from .env.local",
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const userName =
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "you";

    // Generate today's personal thought
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: `
Create one short, warm, personal motivational thought for ${userName}.

Rules:
- Write only one sentence.
- Keep it between 10 and 25 words.
- Make it gentle, encouraging, and meaningful.
- Do not use quotation marks.
- Do not mention that you are an AI.
- Do not use emojis.
- Do not start with "Remember".
- Avoid clichés.
- Make it feel like a thought written especially for this person.
      `.trim(),
    });

    const thought =
      response.text?.trim() ||
      "You are becoming someone your future self will be proud to meet.";

    // Save today's thought
    const { error: insertError } = await supabase
      .from("daily_thoughts")
      .insert({
        user_id: user.id,
        thought_date: today,
        thought,
      });

    // If another request generated it at the same time,
    // retrieve the already-saved version.
    if (insertError) {
      const { data: savedThought } = await supabase
        .from("daily_thoughts")
        .select("thought")
        .eq("user_id", user.id)
        .eq("thought_date", today)
        .maybeSingle();

      if (savedThought) {
        return NextResponse.json({
          success: true,
          thought: savedThought.thought,
          generated: false,
        });
      }

      console.error("Daily thought insert error:", insertError);

      return NextResponse.json(
        {
          error: "Unable to save today's thought.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      thought,
      generated: true,
    });
  } catch (error: unknown) {
    console.error("Daily thought error:", error);

    const message =
      error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}
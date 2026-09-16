import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = body?.query?.trim();

    if (!query) {
      return NextResponse.json(
        { error: "Please enter a search query." },
        { status: 400 }
      );
    }

    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Tavily API key is not configured." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        topic: "general",
        max_results: 8,
        include_answer: false,
        include_raw_content: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Tavily error:", errorText);

      return NextResponse.json(
        { error: "Unable to search the web right now." },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      results: data.results ?? [],
    });
  } catch (error) {
    console.error("Search API error:", error);

    return NextResponse.json(
      { error: "Something went wrong while searching." },
      { status: 500 }
    );
  }
}
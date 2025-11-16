import { NextResponse } from "next/server"
import { hybridSearch } from "@/lib/hybridSearch"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    const results = await hybridSearch(query)
    return NextResponse.json(results)
  } catch (error) {
    console.error("Hybrid search error:", error)
    return NextResponse.json(
      { error: "Search failed", results: [] },
      { status: 500 }
    )
  }
}

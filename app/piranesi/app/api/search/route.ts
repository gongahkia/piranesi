import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`)
  const data = await response.json()

  const results = data.docs.slice(0, 5).map((book: any) => ({
    id: book.key,
    title: book.title,
    author_name: book.author_name,
    cover_i: book.cover_i,
  }))

  return NextResponse.json(results)
}

import { NextResponse } from "next/server"

interface BookAPIResponse {
  key: string
  title: string
  author_name?: string[]
  cover_i?: number
}

interface Book {
  id: string
  title: string
  author_name?: string[]
  cover_i?: number
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }
  const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`)
  const data = await response.json()
  const results: Book[] = data.docs.slice(0, 5).map((book: BookAPIResponse) => ({
    id: book.key,
    title: book.title,
    author_name: book.author_name,
    cover_i: book.cover_i,
  }))
  return NextResponse.json(results)
}

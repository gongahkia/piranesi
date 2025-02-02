import { NextResponse } from "next/server"

interface BookData {
  id: string
  title: string
  author_name: string[]
  cover_i?: number
  isbn?: string[]
  first_publish_year?: number
  publisher?: string[]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`)
  const data = await response.json()

  const results = data.docs.slice(0, 5).map((book: BookData) => ({
    id: book.key,
    title: book.title,
    author_name: book.author_name,
    cover_i: book.cover_i,
    isbn: book.isbn ? book.isbn[0] : "N/A",
    first_publish_year: book.first_publish_year || "N/A",
    publisher: book.publisher ? book.publisher[0] : "N/A",
  }))

  return NextResponse.json(results)
}

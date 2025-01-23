import { NextResponse } from "next/server"

interface Book {
  id: string
  title: string
  author: string
  cover: string
}

const books: Book[] = []

export async function GET() {
  return NextResponse.json(books)
}

export async function POST(request: Request) {
  const book = await request.json()
  const newBook: Book = {
    id: Date.now().toString(),
    title: book.title,
    author: book.author_name?.[0] || "Unknown",
    cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : "/placeholder.svg",
  }
  books.push(newBook)
  return NextResponse.json(newBook)
}

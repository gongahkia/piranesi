import { NextResponse } from "next/server"
import type { Book, ReadingStatus } from "@/types/book"

let books: Book[] = []

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
    isbn: book.isbn || "N/A",
    first_publish_year: book.first_publish_year || "N/A",
    publisher: book.publisher || "N/A",
    status: book.status || 'imprisoned',
    dateAdded: new Date().toISOString(),
    pageCount: book.number_of_pages_median || book.pageCount,
  }
  books.push(newBook)
  return NextResponse.json(newBook)
}

export async function PATCH(request: Request) {
  const { id, status, dateCompleted } = await request.json()

  if (!id) {
    return NextResponse.json({ error: "Book ID is required" }, { status: 400 })
  }

  const bookIndex = books.findIndex((book) => book.id === id)

  if (bookIndex === -1) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 })
  }

  books[bookIndex] = {
    ...books[bookIndex],
    status: status || books[bookIndex].status,
    dateCompleted: status === 'escaped' ? (dateCompleted || new Date().toISOString()) : undefined,
  }

  return NextResponse.json(books[bookIndex])
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Book ID is required" }, { status: 400 })
  }

  const initialLength = books.length
  books = books.filter((book) => book.id !== id)

  if (books.length === initialLength) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}

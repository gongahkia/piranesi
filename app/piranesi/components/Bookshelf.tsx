"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

interface Book {
  id: string
  title: string
  author: string
  cover: string
}

const fetchBooks = async (): Promise<Book[]> => {
  const response = await fetch("/api/books")
  if (!response.ok) {
    throw new Error("Failed to fetch books")
  }
  return response.json()
}

export default function Bookshelf() {
  const [hoveredBook, setHoveredBook] = useState<Book | null>(null)
  const { data: books = [] } = useQuery({
    queryKey: ["books"],
    queryFn: fetchBooks,
  })

  const renderBookSpine = (book: Book) => {
    const spineText = `${book.title.slice(0, 10)}...`
    return (
      <div
        key={book.id}
        className="w-8 h-40 bg-gray-300 mr-1 cursor-pointer text-xs writing-mode-vertical-rl"
        onMouseEnter={() => setHoveredBook(book)}
        onMouseLeave={() => setHoveredBook(null)}
      >
        {spineText}
      </div>
    )
  }

  return (
    <div className="mt-8">
      <div className="flex">{books.map(renderBookSpine)}</div>
      {hoveredBook && (
        <div className="mt-4">
          <img
            src={hoveredBook.cover || "/placeholder.svg"}
            alt={hoveredBook.title}
            className="w-32 h-48 object-cover"
          />
          <p className="mt-2 font-bold">{hoveredBook.title}</p>
          <p>{hoveredBook.author}</p>
        </div>
      )}
    </div>
  )
}

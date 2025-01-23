"use client"

import Image from "next/image" 
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

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

const removeBook = async (id: string): Promise<void> => {
  const response = await fetch(`/api/books?id=${id}`, { method: "DELETE" })
  if (!response.ok) {
    throw new Error("Failed to remove book")
  }
}

export default function Bookshelf() {
  const [hoveredBook, setHoveredBook] = useState<Book | null>(null)
  const queryClient = useQueryClient()
  const { data: books = [] } = useQuery({
    queryKey: ["books"],
    queryFn: fetchBooks,
  })

  const removeMutation = useMutation({
    mutationFn: removeBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] })
    },
  })

  const handleRemove = (id: string) => {
    removeMutation.mutate(id)
  }

  const renderBookSpine = (book: Book) => {
    const spineText = `${book.title.slice(0, 10)}...`
    return (
      <div
        key={book.id}
        className="w-8 h-40 bg-gray-300 mr-1 cursor-pointer text-xs writing-mode-vertical-rl relative group"
        onMouseEnter={() => setHoveredBook(book)}
        onMouseLeave={() => setHoveredBook(null)}
      >
        {spineText}
        <button
          onClick={() => handleRemove(book.id)}
          className="absolute top-0 right-0 bg-red-500 text-white p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove book"
        >
          X
        </button>
      </div>
    )
  }

  return (
    <div className="mt-8">
      {books.length === 0 ? (
        <div className="text-center p-4 bg-gray-100 border border-gray-300">
          Your bookshelf is empty. Use the search bar above to add some books!
        </div>
      ) : (
        <div className="flex overflow-x-auto pb-4">{books.map(renderBookSpine)}</div>
      )}
      {hoveredBook && (
        <div className="mt-4">
          <Image
            src={hoveredBook.cover || "/placeholder.svg"}
            alt={hoveredBook.title}
            width={128} 
            height={192}
            className="object-cover"
          />
          <p className="mt-2 font-bold">{hoveredBook.title}</p>
          <p>{hoveredBook.author}</p>
        </div>
      )}
    </div>
  )
}

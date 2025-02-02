"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { X } from "lucide-react"

interface Book {
  id: string
  title: string
  author: string
  cover: string
  isbn: string
  first_publish_year: number | string
  publisher: string
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

const getRandomColor = () => {
  const colors = ["bg-gray-700", "bg-gray-800", "bg-gray-900", "bg-slate-700", "bg-slate-800", "bg-slate-900"]
  return colors[Math.floor(Math.random() * colors.length)]
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

  const bookStyles = useMemo(() => {
    return books.map(() => ({
      color: getRandomColor(),
    }))
  }, [books])

  const renderBookSpine = (book: Book, index: number) => {
    const { color } = bookStyles[index]
    return (
      <div
        key={book.id}
        className={`w-8 h-48 relative group cursor-pointer transition-transform duration-200 ease-in-out transform hover:-translate-y-2 ${color}`}
        onMouseEnter={() => setHoveredBook(book)}
        onMouseLeave={() => setHoveredBook(null)}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-xs writing-mode-vertical-rl rotate-180 whitespace-nowrap overflow-hidden text-ellipsis max-h-full px-1">
            {book.title}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleRemove(book.id)
          }}
          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Remove ${book.title}`}
        >
          <X size={12} />
        </button>
      </div>
    )
  }

  return (
    <div className="mt-8">
      {books.length === 0 ? (
        <div className="text-center p-8 bg-gray-100 border border-gray-200 rounded-lg shadow-inner">
          <p className="text-gray-600">Your bookshelf is empty. Use the search bar above to add some books!</p>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-8 rounded-lg shadow-lg">
          <div className="flex flex-wrap gap-2 justify-center">
            {books.map((book, index) => renderBookSpine(book, index))}
          </div>
        </div>
      )}
      {hoveredBook && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-md flex items-start space-x-4">
          <img
            src={hoveredBook.cover || "/placeholder.svg"}
            alt={hoveredBook.title}
            className="w-24 h-36 object-cover rounded"
          />
          <div>
            <h3 className="font-bold text-lg">{hoveredBook.title}</h3>
            <p className="text-gray-600">{hoveredBook.author}</p>
            <p className="text-gray-500 text-sm mt-1">ISBN: {hoveredBook.isbn}</p>
            <p className="text-gray-500 text-sm">First Published: {hoveredBook.first_publish_year}</p>
            <p className="text-gray-500 text-sm">Publisher: {hoveredBook.publisher}</p>
          </div>
        </div>
      )}
    </div>
  )
}

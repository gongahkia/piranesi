"use client"

import { useState, useMemo, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { X } from "lucide-react"
import type { Book, ReadingStatus } from "@/types/book"
import { STATUS_CONFIG } from "@/types/book"
import StatusBadge from "./StatusBadge"
import StatusSelector from "./StatusSelector"
import BookDetailModal from "./BookDetailModal"
import { extractColorClient, getSpineColorStyle } from "@/lib/colorExtraction"
import { getSpineStyles } from "@/lib/spineWidth"

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

const updateBookStatus = async ({ id, status }: { id: string; status: ReadingStatus }) => {
  const response = await fetch("/api/books", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  })
  if (!response.ok) {
    throw new Error("Failed to update book status")
  }
  return response.json()
}

const updateBookShelf = async ({ id, shelfId }: { id: string; shelfId: string }) => {
  const response = await fetch("/api/books", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, shelfId }),
  })
  if (!response.ok) {
    throw new Error("Failed to update book shelf")
  }
  return response.json()
}

interface BookshelfProps {
  selectedShelfId: string
}

export default function Bookshelf({ selectedShelfId }: BookshelfProps) {
  const [hoveredBook, setHoveredBook] = useState<Book | null>(null)
  const [modalBook, setModalBook] = useState<Book | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [bookColors, setBookColors] = useState<Record<string, string>>({})
  const queryClient = useQueryClient()
  const { data: allBooks = [] } = useQuery({
    queryKey: ["books"],
    queryFn: fetchBooks,
  })

  // Filter books by selected shelf
  const books = allBooks.filter(book => book.shelfId === selectedShelfId)

  // Extract colors for books that don't have them yet
  useEffect(() => {
    books.forEach(async (book) => {
      if (!bookColors[book.id] && book.cover && !book.cover.includes('placeholder')) {
        try {
          const color = await extractColorClient(book.cover)
          setBookColors(prev => ({ ...prev, [book.id]: color }))
        } catch (error) {
          console.error(`Failed to extract color for ${book.title}:`, error)
        }
      }
    })
  }, [books, bookColors])

  const removeMutation = useMutation({
    mutationFn: removeBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] })
    },
  })

  const statusMutation = useMutation({
    mutationFn: updateBookStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] })
    },
  })

  const shelfMutation = useMutation({
    mutationFn: updateBookShelf,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] })
    },
  })

  const handleRemove = (id: string) => {
    removeMutation.mutate(id)
  }

  const handleStatusChange = (id: string, status: ReadingStatus) => {
    statusMutation.mutate({ id, status })
  }

  const handleShelfChange = (id: string, shelfId: string) => {
    shelfMutation.mutate({ id, shelfId })
  }

  const handleBookClick = (book: Book) => {
    setModalBook(book)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setModalBook(null)
  }

  const renderBookSpine = (book: Book, index: number) => {
    // Prioritize extracted color, fall back to status color
    const extractedColor = book.spineColor || bookColors[book.id]
    const statusColor = STATUS_CONFIG[book.status].color
    const spineColor = extractedColor || statusColor

    // Get spine width based on page count
    const spineInfo = getSpineStyles(book.pageCount)

    const colorStyle = extractedColor ? getSpineColorStyle(extractedColor) : {}
    const hasCustomColor = !!extractedColor

    // Combine color and width styles
    const combinedStyle = {
      ...colorStyle,
      ...spineInfo.widthStyle
    }

    return (
      <div
        key={book.id}
        className={`h-48 relative group cursor-pointer transition-transform duration-200 ease-in-out transform hover:-translate-y-2 ${hasCustomColor ? '' : statusColor}`}
        style={combinedStyle}
        onMouseEnter={() => setHoveredBook(book)}
        onMouseLeave={() => setHoveredBook(null)}
        onClick={() => handleBookClick(book)}
        title={`${book.title} (${spineInfo.description}${book.pageCount ? ` - ${book.pageCount} pages` : ''})`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${spineInfo.fontSize} writing-mode-vertical-rl rotate-180 whitespace-nowrap overflow-hidden text-ellipsis max-h-full px-1 ${hasCustomColor ? '' : 'text-white'}`}>
            {book.title}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleRemove(book.id)
          }}
          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
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
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg">{hoveredBook.title}</h3>
                <p className="text-gray-600">{hoveredBook.author}</p>
              </div>
              <StatusSelector
                currentStatus={hoveredBook.status}
                onStatusChange={(status) => handleStatusChange(hoveredBook.id, status)}
              />
            </div>
            <div className="mt-2">
              <StatusBadge status={hoveredBook.status} className="mb-2" />
            </div>
            <p className="text-gray-500 text-sm mt-1">ISBN: {hoveredBook.isbn}</p>
            <p className="text-gray-500 text-sm">First Published: {hoveredBook.first_publish_year}</p>
            <p className="text-gray-500 text-sm">Publisher: {hoveredBook.publisher}</p>
            {hoveredBook.pageCount && (
              <p className="text-gray-500 text-sm">Pages: {hoveredBook.pageCount}</p>
            )}
          </div>
        </div>
      )}

      <BookDetailModal
        book={modalBook}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusChange={handleStatusChange}
        onShelfChange={handleShelfChange}
      />
    </div>
  )
}

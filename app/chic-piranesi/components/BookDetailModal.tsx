"use client"

import { useEffect } from "react"
import { X, ExternalLink } from "lucide-react"
import type { Book, ReadingStatus } from "@/types/book"
import StatusBadge from "./StatusBadge"
import StatusSelector from "./StatusSelector"
import ShelfMover from "./ShelfMover"

interface BookDetailModalProps {
  book: Book | null
  isOpen: boolean
  onClose: () => void
  onStatusChange: (bookId: string, status: ReadingStatus) => void
  onShelfChange: (bookId: string, shelfId: string) => void
}

export default function BookDetailModal({ book, isOpen, onClose, onStatusChange, onShelfChange }: BookDetailModalProps) {
  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !book) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden pointer-events-auto animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 id="modal-title" className="text-2xl font-bold text-gray-800">Book Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="p-6">
              <div className="flex gap-6">
                {/* Book Cover */}
                <div className="flex-shrink-0">
                  <img
                    src={book.cover || "/placeholder.svg"}
                    alt={book.title}
                    className="w-48 h-72 object-cover rounded-lg shadow-lg"
                  />
                </div>

                {/* Book Info */}
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h3>
                  <p className="text-xl text-gray-600 mb-4">{book.author}</p>

                  {/* Status Controls */}
                  <div className="mb-6 flex items-center gap-3 flex-wrap">
                    <StatusBadge status={book.status} />
                    <StatusSelector
                      currentStatus={book.status}
                      onStatusChange={(status) => onStatusChange(book.id, status)}
                    />
                    <ShelfMover
                      currentShelfId={book.shelfId}
                      onShelfChange={(shelfId) => onShelfChange(book.id, shelfId)}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="font-semibold text-gray-700 w-32">ISBN:</span>
                      <span className="text-gray-600">{book.isbn}</span>
                    </div>

                    <div className="flex items-start">
                      <span className="font-semibold text-gray-700 w-32">Published:</span>
                      <span className="text-gray-600">{book.first_publish_year}</span>
                    </div>

                    <div className="flex items-start">
                      <span className="font-semibold text-gray-700 w-32">Publisher:</span>
                      <span className="text-gray-600">{book.publisher}</span>
                    </div>

                    {book.pageCount && (
                      <div className="flex items-start">
                        <span className="font-semibold text-gray-700 w-32">Pages:</span>
                        <span className="text-gray-600">{book.pageCount}</span>
                      </div>
                    )}

                    <div className="flex items-start">
                      <span className="font-semibold text-gray-700 w-32">Date Added:</span>
                      <span className="text-gray-600">
                        {new Date(book.dateAdded).toLocaleDateString()}
                      </span>
                    </div>

                    {book.dateCompleted && (
                      <div className="flex items-start">
                        <span className="font-semibold text-gray-700 w-32">Completed:</span>
                        <span className="text-gray-600">
                          {new Date(book.dateCompleted).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex gap-3">
                      <a
                        href={`https://openlibrary.org/search?q=${encodeURIComponent(book.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                      >
                        View on OpenLibrary
                        <ExternalLink size={14} />
                      </a>
                      {book.isbn && book.isbn !== 'N/A' && (
                        <a
                          href={`https://www.google.com/search?q=isbn+${book.isbn}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Search ISBN
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

"use client"

import { X } from "lucide-react"
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
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Book Details</h2>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

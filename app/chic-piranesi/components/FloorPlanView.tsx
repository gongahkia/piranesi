"use client"

import { useQuery } from "@tanstack/react-query"
import type { Book } from "@/types/book"
import type { Shelf } from "@/types/shelf"
import { STATUS_CONFIG } from "@/types/book"

const fetchBooks = async (): Promise<Book[]> => {
  const response = await fetch("/api/books")
  if (!response.ok) throw new Error("Failed to fetch books")
  return response.json()
}

const fetchShelves = async (): Promise<Shelf[]> => {
  const response = await fetch("/api/shelves")
  if (!response.ok) throw new Error("Failed to fetch shelves")
  return response.json()
}

interface FloorPlanViewProps {
  onShelfClick: (shelfId: string) => void
  selectedShelfId: string
}

export default function FloorPlanView({ onShelfClick, selectedShelfId }: FloorPlanViewProps) {
  const { data: books = [] } = useQuery({
    queryKey: ["books"],
    queryFn: fetchBooks,
  })

  const { data: shelves = [] } = useQuery({
    queryKey: ["shelves"],
    queryFn: fetchShelves,
  })

  // Calculate book count per shelf
  const shelfBookCounts = shelves.reduce((acc, shelf) => {
    acc[shelf.id] = books.filter(b => b.shelfId === shelf.id).length
    return acc
  }, {} as Record<string, number>)

  // Calculate room dimensions based on book count (more books = larger room)
  const getRoomSize = (bookCount: number) => {
    const minSize = 60
    const maxSize = 150
    const size = minSize + (bookCount * 3)
    return Math.min(size, maxSize)
  }

  // Layout shelves in a grid pattern
  const getShelfPosition = (index: number, totalShelves: number) => {
    const cols = Math.ceil(Math.sqrt(totalShelves))
    const row = Math.floor(index / cols)
    const col = index % cols

    return {
      x: col * 200 + 50,
      y: row * 200 + 50
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📐 Architectural Floor Plan</h2>
        <p className="text-sm text-gray-600">
          A top-down view of your library. Room size indicates book count.
        </p>
      </div>

      <div className="border-2 border-gray-300 rounded-lg bg-gray-50 overflow-auto" style={{ maxHeight: '600px' }}>
        <svg
          width="100%"
          height="600"
          viewBox="0 0 800 600"
          className="min-w-full"
        >
          {/* Grid background */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="800" height="600" fill="url(#grid)" />

          {/* Render each shelf as a room */}
          {shelves.map((shelf, index) => {
            const bookCount = shelfBookCounts[shelf.id] || 0
            const roomSize = getRoomSize(bookCount)
            const position = getShelfPosition(index, shelves.length)
            const isSelected = shelf.id === selectedShelfId

            return (
              <g
                key={shelf.id}
                onClick={() => onShelfClick(shelf.id)}
                className="cursor-pointer transition-all"
                style={{ transformOrigin: `${position.x + roomSize / 2}px ${position.y + roomSize / 2}px` }}
              >
                {/* Room rectangle */}
                <rect
                  x={position.x}
                  y={position.y}
                  width={roomSize}
                  height={roomSize}
                  fill={isSelected ? "#3b82f6" : "#f3f4f6"}
                  stroke={isSelected ? "#2563eb" : "#9ca3af"}
                  strokeWidth={isSelected ? 3 : 2}
                  rx="4"
                  className="transition-all hover:fill-blue-100"
                />

                {/* Shelf icon/emoji */}
                <text
                  x={position.x + roomSize / 2}
                  y={position.y + roomSize / 2 - 15}
                  textAnchor="middle"
                  fontSize="24"
                >
                  {shelf.icon}
                </text>

                {/* Shelf name */}
                <text
                  x={position.x + roomSize / 2}
                  y={position.y + roomSize / 2 + 5}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill={isSelected ? "white" : "#1f2937"}
                >
                  {shelf.name}
                </text>

                {/* Book count */}
                <text
                  x={position.x + roomSize / 2}
                  y={position.y + roomSize / 2 + 20}
                  textAnchor="middle"
                  fontSize="10"
                  fill={isSelected ? "#e5e7eb" : "#6b7280"}
                >
                  {bookCount} {bookCount === 1 ? 'book' : 'books'}
                </text>
              </g>
            )
          })}

          {/* Legend */}
          <g transform="translate(600, 20)">
            <rect x="0" y="0" width="180" height="100" fill="white" stroke="#9ca3af" strokeWidth="1" rx="4" />
            <text x="10" y="20" fontSize="12" fontWeight="bold" fill="#1f2937">Legend:</text>
            <text x="10" y="40" fontSize="10" fill="#6b7280">Room size = Book count</text>
            <rect x="10" y="50" width="20" height="20" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1" rx="2" />
            <text x="35" y="65" fontSize="10" fill="#6b7280">Shelf</text>
            <rect x="10" y="75" width="20" height="20" fill="#3b82f6" stroke="#2563eb" strokeWidth="2" rx="2" />
            <text x="35" y="90" fontSize="10" fill="#6b7280">Selected</text>
          </g>
        </svg>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{shelves.length}</div>
          <div className="text-xs text-gray-600">Total Shelves</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{books.length}</div>
          <div className="text-xs text-gray-600">Total Books</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">
            {books.length > 0 ? Math.round(books.length / shelves.length) : 0}
          </div>
          <div className="text-xs text-gray-600">Avg per Shelf</div>
        </div>
      </div>
    </div>
  )
}

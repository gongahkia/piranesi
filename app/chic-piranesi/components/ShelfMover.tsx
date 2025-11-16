"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { MoveHorizontal, ChevronDown } from "lucide-react"
import type { Shelf } from "@/types/shelf"

const fetchShelves = async (): Promise<Shelf[]> => {
  const response = await fetch("/api/shelves")
  if (!response.ok) throw new Error("Failed to fetch shelves")
  return response.json()
}

interface ShelfMoverProps {
  currentShelfId: string
  onShelfChange: (shelfId: string) => void
}

export default function ShelfMover({ currentShelfId, onShelfChange }: ShelfMoverProps) {
  const [isOpen, setIsOpen] = useState(false)

  const { data: shelves = [] } = useQuery({
    queryKey: ["shelves"],
    queryFn: fetchShelves,
  })

  const currentShelf = shelves.find(s => s.id === currentShelfId)

  const handleShelfSelect = (shelfId: string) => {
    onShelfChange(shelfId)
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
      >
        <MoveHorizontal size={14} />
        {currentShelf?.icon} {currentShelf?.name || 'Unknown Shelf'}
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-2 bg-gray-50 border-b border-gray-200">
              <span className="text-xs font-semibold text-gray-600">Move to Shelf:</span>
            </div>
            {shelves.map((shelf) => (
              <button
                key={shelf.id}
                onClick={() => handleShelfSelect(shelf.id)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  shelf.id === currentShelfId ? 'bg-blue-50 font-semibold text-blue-700' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{shelf.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{shelf.name}</div>
                    <div className="text-xs text-gray-500">{shelf.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2, Edit2, BookOpen } from "lucide-react"
import type { Shelf } from "@/types/shelf"
import type { Book } from "@/types/book"

const fetchShelves = async (): Promise<Shelf[]> => {
  const response = await fetch("/api/shelves")
  if (!response.ok) throw new Error("Failed to fetch shelves")
  return response.json()
}

const fetchBooks = async (): Promise<Book[]> => {
  const response = await fetch("/api/books")
  if (!response.ok) throw new Error("Failed to fetch books")
  return response.json()
}

const createShelf = async (shelfData: { name: string; description: string; icon: string }) => {
  const response = await fetch("/api/shelves", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(shelfData),
  })
  if (!response.ok) throw new Error("Failed to create shelf")
  return response.json()
}

const deleteShelf = async (id: string) => {
  const response = await fetch(`/api/shelves?id=${id}`, { method: "DELETE" })
  if (!response.ok) throw new Error("Failed to delete shelf")
}

interface ShelfNavProps {
  selectedShelfId: string
  onShelfSelect: (shelfId: string) => void
}

export default function ShelfNav({ selectedShelfId, onShelfSelect }: ShelfNavProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newShelfName, setNewShelfName] = useState("")
  const [newShelfDesc, setNewShelfDesc] = useState("")
  const [newShelfIcon, setNewShelfIcon] = useState("📚")

  const queryClient = useQueryClient()

  const { data: shelves = [] } = useQuery({
    queryKey: ["shelves"],
    queryFn: fetchShelves,
  })

  const { data: books = [] } = useQuery({
    queryKey: ["books"],
    queryFn: fetchBooks,
  })

  const createMutation = useMutation({
    mutationFn: createShelf,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shelves"] })
      setIsCreating(false)
      setNewShelfName("")
      setNewShelfDesc("")
      setNewShelfIcon("📚")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteShelf,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shelves"] })
    },
  })

  const handleCreate = () => {
    if (newShelfName.trim()) {
      createMutation.mutate({
        name: newShelfName,
        description: newShelfDesc,
        icon: newShelfIcon,
      })
    }
  }

  const getBookCountForShelf = (shelfId: string) => {
    return books.filter(book => book.shelfId === shelfId).length
  }

  return (
    <div className="w-64 bg-white rounded-lg shadow-md p-4 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Library Wings</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Create new shelf"
        >
          <Plus size={18} className="text-gray-600" />
        </button>
      </div>

      {isCreating && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="text"
            value={newShelfIcon}
            onChange={(e) => setNewShelfIcon(e.target.value)}
            placeholder="📚"
            className="w-full px-2 py-1 text-2xl text-center mb-2 border border-gray-300 rounded"
            maxLength={2}
          />
          <input
            type="text"
            value={newShelfName}
            onChange={(e) => setNewShelfName(e.target.value)}
            placeholder="Shelf name"
            className="w-full px-3 py-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="text"
            value={newShelfDesc}
            onChange={(e) => setNewShelfDesc(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-3 py-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button
            onClick={handleCreate}
            className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 transition-colors"
          >
            Create Shelf
          </button>
        </div>
      )}

      <div className="space-y-1">
        {shelves.map((shelf) => {
          const bookCount = getBookCountForShelf(shelf.id)
          const isSelected = selectedShelfId === shelf.id

          return (
            <div
              key={shelf.id}
              className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'bg-gray-800 text-white shadow-md'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={() => onShelfSelect(shelf.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xl">{shelf.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{shelf.name}</div>
                    <div className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                      {bookCount} {bookCount === 1 ? 'book' : 'books'}
                    </div>
                  </div>
                </div>
                {!shelf.isDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm(`Delete "${shelf.name}"?`)) {
                        deleteMutation.mutate(shelf.id)
                      }
                    }}
                    className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity ${
                      isSelected ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                    }`}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {shelves.length === 0 && (
        <div className="text-center text-gray-500 text-sm py-4">
          No shelves yet. Create one!
        </div>
      )}
    </div>
  )
}

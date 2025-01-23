"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface SearchResult {
  id: string
  title: string
  author_name: string[]
  cover_i?: number
}

const searchBooks = async (query: string): Promise<SearchResult[]> => {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
  if (!response.ok) {
    throw new Error("Failed to search books")
  }
  return response.json()
}

const addBook = async (book: SearchResult) => {
  const response = await fetch("/api/books", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(book),
  })
  if (!response.ok) {
    throw new Error("Failed to add book")
  }
  return response.json()
}

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const queryClient = useQueryClient()

  const searchMutation = useMutation({
    mutationFn: searchBooks,
    onSuccess: (data) => setResults(data),
  })

  const addBookMutation = useMutation({
    mutationFn: addBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] })
      setResults([])
      setQuery("")
    },
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchMutation.mutate(query)
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a book"
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Search
        </button>
      </form>
      {results.length > 0 && (
        <ul className="space-y-2">
          {results.map((book) => (
            <li key={book.id} className="flex items-center">
              <span>
                {book.title} by {book.author_name?.[0]}
              </span>
              <button
                onClick={() => addBookMutation.mutate(book)}
                className="ml-2 bg-green-500 text-white p-1 rounded text-sm"
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

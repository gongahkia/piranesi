"use client"

import { useState, useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Search, Plus, Shuffle } from "lucide-react"

interface SearchResult {
  id: string
  title: string
  author_name: string[]
  cover_i?: number
  isbn: string
  first_publish_year: number | string
  publisher: string
  number_of_pages_median?: number
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

const getRandomWord = async (): Promise<string> => {
  const response = await fetch("/api/random-word")
  if (!response.ok) {
    throw new Error("Failed to get random word")
  }
  const data = await response.json()
  return data.word
}

interface SearchBarProps {
  selectedShelfId: string
}

export default function SearchBar({ selectedShelfId }: SearchBarProps) {
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

  const randomBookMutation = useMutation({
    mutationFn: async () => {
      const word = await getRandomWord()
      const searchResults = await searchBooks(word)
      if (searchResults.length > 0) {
        const randomBook = searchResults[Math.floor(Math.random() * searchResults.length)]
        await addBook(randomBook)
        return randomBook
      }
      throw new Error("No books found for the random word")
    },
    onSuccess: (book) => {
      queryClient.invalidateQueries({ queryKey: ["books"] })
      setResults([])
      setQuery("")
      alert(`Added "${book.title}" to your library!`)
    },
    onError: (error) => {
      alert(`Failed to add random book: ${error}`)
    },
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchMutation.mutate(query)
  }

  const handleRandomBook = useCallback(() => {
    randomBookMutation.mutate()
  }, [randomBookMutation])

  return (
    <div className="mb-8">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a book"
            className="w-full p-3 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <button type="submit" className="bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-700 transition-colors">
          Search
        </button>
        <button
          type="button"
          onClick={handleRandomBook}
          className="bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-700 transition-colors"
          aria-label="Add random book"
        >
          <Shuffle size={24} />
        </button>
      </form>
      {results.length > 0 && (
        <ul className="mt-4 bg-white p-4 rounded-lg shadow-md">
          {results.map((book) => (
            <li key={book.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div>
                <span className="text-gray-800 font-semibold">{book.title}</span>
                <p className="text-sm text-gray-600">by {book.author_name?.[0]}</p>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>ISBN: {book.isbn}</span>
                  {book.number_of_pages_median && (
                    <span className="font-semibold text-purple-600">
                      📖 {book.number_of_pages_median} pages
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => addBookMutation.mutate({ ...book, shelfId: selectedShelfId })}
                className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-label={`Add ${book.title} to bookshelf`}
              >
                <Plus size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

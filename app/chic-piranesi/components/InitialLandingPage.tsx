"use client"

import type React from "react"
import { useState, useEffect } from "react"
import BookCover from "./BookCover"

const colors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-red-300",
  "bg-blue-300",
  "bg-green-300",
  "bg-yellow-300",
  "bg-purple-300",
  "bg-pink-300",
  "bg-indigo-300",
  "bg-red-700",
  "bg-blue-700",
  "bg-green-700",
  "bg-yellow-700",
  "bg-purple-700",
  "bg-pink-700",
  "bg-indigo-700",
  "bg-gray-300",
  "bg-gray-400",
  "bg-gray-500",
  "bg-gray-600",
  "bg-gray-700",
  "bg-orange-300",
  "bg-orange-400",
  "bg-orange-500",
  "bg-orange-600",
  "bg-orange-700",
  "bg-teal-300",
  "bg-teal-400",
  "bg-teal-500",
  "bg-teal-600",
  "bg-teal-700",
]

const patterns = [
  "bg-stripe-pattern",
  "bg-dot-pattern",
  "bg-cross-pattern",
  "bg-gradient-to-r",
  "bg-gradient-to-l",
  "bg-gradient-to-t",
  "bg-gradient-to-b",
  "bg-gradient-to-tr",
  "bg-gradient-to-tl",
  "bg-gradient-to-br",
  "bg-gradient-to-bl",
  "bg-zigzag-pattern",
  "bg-wave-pattern",
  "bg-diamond-pattern",
  "bg-chevron-pattern",
]

interface InitialLandingPageProps {
  onStart: () => void
}

const InitialLandingPage: React.FC<InitialLandingPageProps> = ({ onStart }) => {
  const [books, setBooks] = useState<{ color: string; pattern: string; accent: string }[][]>([])

  useEffect(() => {
    const generateBooks = () => {
      const newBooks = Array(7)
        .fill(null)
        .map(() =>
          Array(15)
            .fill(null)
            .map(() => ({
              color: colors[Math.floor(Math.random() * colors.length)],
              pattern: patterns[Math.floor(Math.random() * patterns.length)],
              accent: colors[Math.floor(Math.random() * colors.length)],
            })),
        )
      setBooks(newBooks)
    }

    generateBooks()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
      {books.map((row, i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? "animate-conveyor-left" : "animate-conveyor-right"} absolute`}
          style={{ top: `${i * 14}%` }}
        >
          {row.map((book, j) => (
            <div key={j} className="mx-2">
              <BookCover color={book.color} pattern={book.pattern} accent={book.accent} />
            </div>
          ))}
        </div>
      ))}
      <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
        <h1 className="text-6xl font-bold text-white mb-4">Piranesi</h1>
        <p className="text-2xl text-white mb-8">Towards a universal library</p>
        <button
          onClick={onStart}
          className="px-6 py-3 bg-white text-gray-900 rounded-lg text-xl font-semibold hover:bg-gray-200 transition-colors"
        >
          Click to start
        </button>
      </div>
    </div>
  )
}

export default InitialLandingPage

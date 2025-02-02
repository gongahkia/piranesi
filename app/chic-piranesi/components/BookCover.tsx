import type React from "react"

interface BookCoverProps {
  color: string
  pattern: string
  accent: string
}

const BookCover: React.FC<BookCoverProps> = ({ color, pattern, accent }) => {
  return (
    <div
      className={`w-24 h-36 ${color} ${pattern} rounded shadow-md flex items-center justify-center relative overflow-hidden`}
    >
      <div className={`w-4 h-16 ${accent} opacity-30 transform -rotate-12 absolute`}></div>
      <div className={`w-16 h-4 ${accent} opacity-30 transform rotate-45 absolute`}></div>
    </div>
  )
}

export default BookCover

"use client"

import { useState } from "react"
import { Download, FileText, Table } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import type { Book } from "@/types/book"
import type { Shelf } from "@/types/shelf"
import { exportToCSV, exportToPDF } from "@/lib/catalogExport"

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

export default function ExportMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const { data: books = [] } = useQuery({
    queryKey: ["books"],
    queryFn: fetchBooks,
  })

  const { data: shelves = [] } = useQuery({
    queryKey: ["shelves"],
    queryFn: fetchShelves,
  })

  const handleExportCSV = () => {
    exportToCSV(books, shelves, {
      includeStatus: true,
      includeShelf: true,
      includePageCount: true,
    })
    setIsOpen(false)
  }

  const handleExportPDF = () => {
    exportToPDF(books, shelves, {
      includeStatus: true,
      includeShelf: true,
      groupByShelf: true,
    })
    setIsOpen(false)
  }

  if (books.length === 0) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
        title="Export catalog"
      >
        <Download size={16} />
        Export Catalog
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <span className="text-xs font-semibold text-gray-600 uppercase">Export Format</span>
            </div>

            <button
              onClick={handleExportPDF}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-start gap-3"
            >
              <FileText size={20} className="text-red-500 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">PDF Catalog</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Formatted catalog grouped by shelves
                </div>
              </div>
            </button>

            <button
              onClick={handleExportCSV}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3"
            >
              <Table size={20} className="text-green-500 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">CSV Spreadsheet</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Data export for Excel or Google Sheets
                </div>
              </div>
            </button>

            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Exporting {books.length} {books.length === 1 ? 'book' : 'books'}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

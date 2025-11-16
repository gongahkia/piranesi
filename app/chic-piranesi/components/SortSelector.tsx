"use client"

import { useState } from "react"
import { ArrowUpDown, ChevronDown } from "lucide-react"
import { SORT_OPTIONS, type SortMode } from "@/lib/bookSorting"

interface SortSelectorProps {
  currentSort: SortMode
  onSortChange: (mode: SortMode) => void
}

export default function SortSelector({ currentSort, onSortChange }: SortSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentOption = SORT_OPTIONS.find(opt => opt.value === currentSort)

  const handleSelect = (mode: SortMode) => {
    onSortChange(mode)
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <ArrowUpDown size={16} className="text-gray-600" />
        <span className="text-gray-700">Sort: {currentOption?.label}</span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-2 bg-gray-50 border-b border-gray-200">
              <span className="text-xs font-semibold text-gray-600 uppercase">Sort Books By:</span>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value as SortMode)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    option.value === currentSort ? 'bg-blue-50 font-semibold text-blue-700' : ''
                  }`}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

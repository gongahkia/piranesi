"use client"

import { useState } from "react"
import { STATUS_CONFIG, type ReadingStatus } from "@/types/book"
import { ChevronDown } from "lucide-react"

interface StatusSelectorProps {
  currentStatus: ReadingStatus
  onStatusChange: (status: ReadingStatus) => void
}

export default function StatusSelector({ currentStatus, onStatusChange }: StatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleStatusSelect = (status: ReadingStatus) => {
    onStatusChange(status)
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${STATUS_CONFIG[currentStatus].badgeColor} hover:opacity-80`}
      >
        {STATUS_CONFIG[currentStatus].label}
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {(Object.keys(STATUS_CONFIG) as ReadingStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusSelect(status)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  status === currentStatus ? 'bg-gray-100 font-semibold' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{STATUS_CONFIG[status].label}</span>
                  <span className={`w-3 h-3 rounded-full ${STATUS_CONFIG[status].color}`} />
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {STATUS_CONFIG[status].description}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

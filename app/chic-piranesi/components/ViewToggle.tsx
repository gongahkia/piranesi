"use client"

import { useState } from "react"
import { LayoutGrid, Map, Image } from "lucide-react"

export type ViewMode = 'shelf' | 'floorplan' | 'etching'

interface ViewToggleProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
  etchingMode: boolean
  onEtchingToggle: () => void
}

export default function ViewToggle({ currentView, onViewChange, etchingMode, onEtchingToggle }: ViewToggleProps) {
  return (
    <div className="flex gap-2">
      <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
        <button
          onClick={() => onViewChange('shelf')}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentView === 'shelf'
              ? 'bg-gray-800 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Shelf View"
        >
          <LayoutGrid size={18} />
        </button>
        <button
          onClick={() => onViewChange('floorplan')}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentView === 'floorplan'
              ? 'bg-gray-800 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Floor Plan"
        >
          <Map size={18} />
        </button>
      </div>

      <button
        onClick={onEtchingToggle}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
          etchingMode
            ? 'bg-gray-800 text-white border-gray-800'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
        title="Toggle Piranesi Etching Mode"
      >
        <div className="flex items-center gap-2">
          <Image size={18} />
          <span>{etchingMode ? 'Carceri Mode' : 'Modern'}</span>
        </div>
      </button>
    </div>
  )
}

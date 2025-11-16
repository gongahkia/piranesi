import type { Book } from "@/types/book"
import { rgbToHex, hexToRgb } from "./colorExtraction"

export type SortMode =
  | 'date-added'
  | 'title'
  | 'author'
  | 'status'
  | 'page-count'
  | 'rainbow'
  | 'height'

export const SORT_OPTIONS = [
  { value: 'date-added', label: 'Date Added', description: 'Recently added first' },
  { value: 'title', label: 'Title (A-Z)', description: 'Alphabetical by title' },
  { value: 'author', label: 'Author (A-Z)', description: 'Alphabetical by author' },
  { value: 'status', label: 'Reading Status', description: 'Group by imprisoned/exploring/escaped' },
  { value: 'page-count', label: 'Page Count', description: 'Tallest to shortest' },
  { value: 'rainbow', label: 'Rainbow', description: 'Sort by spine color (ROY G BIV)' },
  { value: 'height', label: 'Height (Tallest First)', description: 'Sort by page count descending' },
] as const

// Convert hex color to hue value for rainbow sorting
function getColorHue(hexColor: string): number {
  const rgb = hexToRgb(hexColor)
  if (!rgb) return 0

  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  if (delta === 0) return 0

  let hue: number

  if (max === r) {
    hue = 60 * (((g - b) / delta) % 6)
  } else if (max === g) {
    hue = 60 * ((b - r) / delta + 2)
  } else {
    hue = 60 * ((r - g) / delta + 4)
  }

  return hue < 0 ? hue + 360 : hue
}

export function sortBooks(books: Book[], mode: SortMode, bookColors: Record<string, string> = {}): Book[] {
  const sorted = [...books]

  switch (mode) {
    case 'date-added':
      return sorted.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())

    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))

    case 'author':
      return sorted.sort((a, b) => a.author.localeCompare(b.author))

    case 'status':
      const statusOrder = { 'exploring': 0, 'imprisoned': 1, 'escaped': 2, 'abandoned': 3 }
      return sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status])

    case 'page-count':
    case 'height':
      return sorted.sort((a, b) => (b.pageCount || 0) - (a.pageCount || 0))

    case 'rainbow':
      return sorted.sort((a, b) => {
        const colorA = a.spineColor || bookColors[a.id] || '#808080'
        const colorB = b.spineColor || bookColors[b.id] || '#808080'
        return getColorHue(colorA) - getColorHue(colorB)
      })

    default:
      return sorted
  }
}

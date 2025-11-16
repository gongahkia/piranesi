// Spine width calculation based on page count
// Simulates realistic book spine thickness

// Constants for spine calculation
const MIN_SPINE_WIDTH = 8 // Minimum width in pixels (thin pamphlet)
const MAX_SPINE_WIDTH = 48 // Maximum width in pixels (thick tome)
const PAGES_PER_PIXEL = 30 // Approximate pages per pixel of spine width

// Book spine width categories
export type SpineWidthCategory = 'thin' | 'normal' | 'thick' | 'very-thick'

export interface SpineWidthInfo {
  width: number // Width in pixels
  category: SpineWidthCategory
  description: string
}

/**
 * Calculate spine width from page count
 * Based on real book spine formula: width ≈ pages / 30 for paperbacks
 */
export function calculateSpineWidth(pageCount?: number): SpineWidthInfo {
  if (!pageCount || pageCount <= 0) {
    return {
      width: MIN_SPINE_WIDTH,
      category: 'thin',
      description: 'Unknown page count'
    }
  }

  // Calculate raw width
  const rawWidth = pageCount / PAGES_PER_PIXEL

  // Clamp to min/max
  const width = Math.max(MIN_SPINE_WIDTH, Math.min(MAX_SPINE_WIDTH, Math.round(rawWidth)))

  // Determine category
  let category: SpineWidthCategory
  let description: string

  if (pageCount < 100) {
    category = 'thin'
    description = 'Short read'
  } else if (pageCount < 300) {
    category = 'normal'
    description = 'Standard book'
  } else if (pageCount < 600) {
    category = 'thick'
    description = 'Substantial tome'
  } else {
    category = 'very-thick'
    description = 'Epic volume'
  }

  return { width, category, description }
}

/**
 * Get Tailwind width class for spine
 * Falls back to custom width if outside predefined classes
 */
export function getSpineWidthClass(pageCount?: number): string {
  const { width } = calculateSpineWidth(pageCount)

  // Map to Tailwind classes where possible
  const widthClasses: Record<number, string> = {
    8: 'w-8',
    10: 'w-10',
    12: 'w-12',
    16: 'w-16',
    20: 'w-20',
    24: 'w-24',
    32: 'w-32',
    40: 'w-40',
    48: 'w-48',
  }

  return widthClasses[width] || `w-${width}`
}

/**
 * Get inline style for precise width control
 */
export function getSpineWidthStyle(pageCount?: number): { width: string } {
  const { width } = calculateSpineWidth(pageCount)
  return { width: `${width}px` }
}

/**
 * Get font size adjustment based on spine width
 * Thicker spines can display larger text
 */
export function getSpineFontSize(pageCount?: number): string {
  const { width } = calculateSpineWidth(pageCount)

  if (width <= 10) return 'text-xs'
  if (width <= 16) return 'text-sm'
  if (width <= 24) return 'text-base'
  if (width <= 32) return 'text-lg'
  return 'text-xl'
}

/**
 * Check if spine is wide enough for horizontal text
 * Very thick books might benefit from horizontal spine text
 */
export function isWideSpine(pageCount?: number): boolean {
  const { width } = calculateSpineWidth(pageCount)
  return width >= 32
}

/**
 * Get all spine styling information
 */
export function getSpineStyles(pageCount?: number) {
  const info = calculateSpineWidth(pageCount)
  const fontSize = getSpineFontSize(pageCount)
  const widthStyle = getSpineWidthStyle(pageCount)
  const isWide = isWideSpine(pageCount)

  return {
    ...info,
    fontSize,
    widthStyle,
    isWide
  }
}

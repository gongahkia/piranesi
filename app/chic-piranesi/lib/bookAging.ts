// Book aging effects based on read count and dates

import type { Book } from "@/types/book"

export type AgingLevel = 'pristine' | 'lightly-worn' | 'well-read' | 'beloved'

export interface AgingEffects {
  level: AgingLevel
  opacity: number
  borderStyle: string
  filterEffect: string
  description: string
}

export function calculateAgingLevel(book: Book): AgingLevel {
  // Calculate based on time since added and status
  const daysSinceAdded = Math.floor(
    (Date.now() - new Date(book.dateAdded).getTime()) / (1000 * 60 * 60 * 24)
  )

  if (book.status === 'escaped' && daysSinceAdded > 180) return 'beloved'
  if (book.status === 'escaped' && daysSinceAdded > 90) return 'well-read'
  if (book.status === 'exploring' || daysSinceAdded > 30) return 'lightly-worn'
  return 'pristine'
}

export function getAgingEffects(book: Book): AgingEffects {
  const level = calculateAgingLevel(book)

  switch (level) {
    case 'pristine':
      return {
        level,
        opacity: 1,
        borderStyle: 'sharp',
        filterEffect: 'none',
        description: 'Newly added, pristine condition'
      }
    case 'lightly-worn':
      return {
        level,
        opacity: 0.95,
        borderStyle: 'slightly-rounded',
        filterEffect: 'brightness(0.98)',
        description: 'Lightly handled'
      }
    case 'well-read':
      return {
        level,
        opacity: 0.9,
        borderStyle: 'rounded',
        filterEffect: 'brightness(0.95) saturate(0.9)',
        description: 'Well-loved and read'
      }
    case 'beloved':
      return {
        level,
        opacity: 0.85,
        borderStyle: 'very-rounded',
        filterEffect: 'brightness(0.9) saturate(0.8) sepia(0.1)',
        description: 'Treasured classic'
      }
  }
}

export function getAgingStyles(book: Book) {
  const effects = getAgingEffects(book)

  return {
    opacity: effects.opacity,
    filter: effects.filterEffect,
    borderRadius: effects.borderStyle === 'very-rounded' ? '6px' :
                  effects.borderStyle === 'rounded' ? '4px' :
                  effects.borderStyle === 'slightly-rounded' ? '2px' : '0px'
  }
}

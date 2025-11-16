// Shelf type definitions with Piranesi's architectural theme
export interface Shelf {
  id: string
  name: string
  description: string
  isDefault: boolean
  icon: string
  createdAt: string
}

// Default shelves using Piranesi's prison/architecture metaphor
export const DEFAULT_SHELVES: Shelf[] = [
  {
    id: 'cell-a',
    name: 'Cell A',
    description: 'The primary holding cell for your collection',
    isDefault: true,
    icon: '🏛️',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'grand-gallery',
    name: 'Grand Gallery',
    description: 'The magnificent central gallery',
    isDefault: true,
    icon: '🖼️',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'carceri',
    name: 'The Carceri',
    description: 'Inspired by Piranesi\'s Imaginary Prisons',
    isDefault: true,
    icon: '⛓️',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'architects-study',
    name: 'Architect\'s Study',
    description: 'Your personal architectural library',
    isDefault: true,
    icon: '📐',
    createdAt: new Date().toISOString(),
  },
]

// Extend book type to include shelf assignment
export interface BookShelfAssignment {
  bookId: string
  shelfId: string
  position: number
  addedAt: string
}

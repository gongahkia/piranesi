// Reading status using Piranesi's prison metaphor
export type ReadingStatus = 'imprisoned' | 'exploring' | 'escaped' | 'abandoned'

// Status display configuration
export const STATUS_CONFIG = {
  imprisoned: {
    label: 'Want to Read',
    color: 'bg-gray-600',
    textColor: 'text-gray-600',
    badgeColor: 'bg-gray-100 text-gray-700',
    description: 'Awaiting exploration in your collection'
  },
  exploring: {
    label: 'Currently Reading',
    color: 'bg-yellow-600',
    textColor: 'text-yellow-600',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    description: 'Actively navigating through pages'
  },
  escaped: {
    label: 'Read',
    color: 'bg-green-600',
    textColor: 'text-green-600',
    badgeColor: 'bg-green-100 text-green-700',
    description: 'Successfully completed'
  },
  abandoned: {
    label: 'Did Not Finish',
    color: 'bg-red-600',
    textColor: 'text-red-600',
    badgeColor: 'bg-red-100 text-red-700',
    description: 'Left unexplored'
  }
} as const

export interface Book {
  id: string
  title: string
  author: string
  cover: string
  isbn: string
  first_publish_year: number | string
  publisher: string
  status: ReadingStatus
  dateAdded: string
  dateCompleted?: string
  pageCount?: number
  shelfId: string // Which shelf this book belongs to
}

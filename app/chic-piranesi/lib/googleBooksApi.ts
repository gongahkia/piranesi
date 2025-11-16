// Google Books API client

export interface GoogleBook {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    publisher?: string
    publishedDate?: string
    description?: string
    pageCount?: number
    categories?: string[]
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
    industryIdentifiers?: Array<{
      type: string
      identifier: string
    }>
  }
}

export interface GoogleBooksResponse {
  items?: GoogleBook[]
  totalItems: number
}

export async function searchGoogleBooks(query: string, maxResults: number = 10): Promise<GoogleBook[]> {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}`

    const response = await fetch(url)
    if (!response.ok) {
      console.warn('Google Books API error:', response.statusText)
      return []
    }

    const data: GoogleBooksResponse = await response.json()
    return data.items || []
  } catch (error) {
    console.error('Failed to fetch from Google Books:', error)
    return []
  }
}

export function extractISBN(book: GoogleBook): string {
  const identifiers = book.volumeInfo.industryIdentifiers || []

  // Prefer ISBN_13, fall back to ISBN_10
  const isbn13 = identifiers.find(id => id.type === 'ISBN_13')
  if (isbn13) return isbn13.identifier

  const isbn10 = identifiers.find(id => id.type === 'ISBN_10')
  if (isbn10) return isbn10.identifier

  return 'N/A'
}

export function extractPublishYear(publishedDate?: string): number | string {
  if (!publishedDate) return 'N/A'

  const year = parseInt(publishedDate.split('-')[0], 10)
  return isNaN(year) ? 'N/A' : year
}

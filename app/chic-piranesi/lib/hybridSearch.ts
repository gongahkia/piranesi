// Hybrid search combining Google Books and OpenLibrary

import { searchGoogleBooks, extractISBN, extractPublishYear, type GoogleBook } from './googleBooksApi'

export interface UnifiedBook {
  id: string
  title: string
  author_name: string[]
  cover_i?: number
  isbn: string
  first_publish_year: number | string
  publisher: string
  number_of_pages_median?: number
  source: 'google' | 'openlibrary' | 'hybrid'
  description?: string
  categories?: string[]
  coverUrl?: string
}

export async function hybridSearch(query: string): Promise<UnifiedBook[]> {
  // Execute both searches in parallel
  const [googleResults, openLibraryResults] = await Promise.allSettled([
    searchGoogleBooks(query, 5),
    searchOpenLibrary(query)
  ])

  const googleBooks = googleResults.status === 'fulfilled' ? googleResults.value : []
  const openLibBooks = openLibraryResults.status === 'fulfilled' ? openLibraryResults.value : []

  // Convert Google Books to unified format
  const googleUnified: UnifiedBook[] = googleBooks.map(book => ({
    id: `google-${book.id}`,
    title: book.volumeInfo.title,
    author_name: book.volumeInfo.authors || ['Unknown'],
    isbn: extractISBN(book),
    first_publish_year: extractPublishYear(book.volumeInfo.publishedDate),
    publisher: book.volumeInfo.publisher || 'N/A',
    number_of_pages_median: book.volumeInfo.pageCount,
    source: 'google' as const,
    description: book.volumeInfo.description,
    categories: book.volumeInfo.categories,
    coverUrl: book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
  }))

  // Convert OpenLibrary books to unified format
  const openLibUnified: UnifiedBook[] = openLibBooks.map(book => ({
    id: `openlibrary-${book.id}`,
    title: book.title,
    author_name: book.author_name || ['Unknown'],
    cover_i: book.cover_i,
    isbn: book.isbn,
    first_publish_year: book.first_publish_year,
    publisher: book.publisher,
    number_of_pages_median: book.number_of_pages_median,
    source: 'openlibrary' as const,
  }))

  // Merge and deduplicate
  const merged = deduplicateBooks([...googleUnified, ...openLibUnified])

  return merged.slice(0, 10) // Return top 10
}

async function searchOpenLibrary(query: string) {
  const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`)
  const data = await response.json()

  return data.docs.slice(0, 5).map((book: any) => ({
    id: book.key,
    title: book.title,
    author_name: book.author_name,
    cover_i: book.cover_i,
    isbn: book.isbn ? book.isbn[0] : "N/A",
    first_publish_year: book.first_publish_year || "N/A",
    publisher: book.publisher ? book.publisher[0] : "N/A",
    number_of_pages_median: book.number_of_pages_median,
  }))
}

function deduplicateBooks(books: UnifiedBook[]): UnifiedBook[] {
  const seen = new Map<string, UnifiedBook>()

  for (const book of books) {
    const normalizedTitle = book.title.toLowerCase().replace(/[^a-z0-9]/g, '')

    // Check if we've seen this book
    if (!seen.has(normalizedTitle)) {
      seen.set(normalizedTitle, book)
    } else {
      // Merge data if both sources have the same book
      const existing = seen.get(normalizedTitle)!

      // Prefer book with more data
      const merged: UnifiedBook = {
        ...existing,
        isbn: existing.isbn !== 'N/A' ? existing.isbn : book.isbn,
        number_of_pages_median: existing.number_of_pages_median || book.number_of_pages_median,
        description: existing.description || book.description,
        categories: existing.categories || book.categories,
        coverUrl: existing.coverUrl || book.coverUrl,
        publisher: existing.publisher !== 'N/A' ? existing.publisher : book.publisher,
        source: 'hybrid' as const,
      }

      seen.set(normalizedTitle, merged)
    }
  }

  return Array.from(seen.values())
}

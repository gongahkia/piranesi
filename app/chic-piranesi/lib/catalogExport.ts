import type { Book } from "@/types/book"
import type { Shelf } from "@/types/shelf"
import { jsPDF } from "jspdf"
import Papa from "papaparse"
import { STATUS_CONFIG } from "@/types/book"

export interface ExportOptions {
  includeStatus?: boolean
  includeShelf?: boolean
  includePageCount?: boolean
  groupByShelf?: boolean
}

// Export books to CSV format
export function exportToCSV(
  books: Book[],
  shelves: Shelf[],
  options: ExportOptions = {}
): void {
  const {
    includeStatus = true,
    includeShelf = true,
    includePageCount = true,
  } = options

  // Prepare CSV data
  const csvData = books.map(book => {
    const shelf = shelves.find(s => s.id === book.shelfId)
    const row: any = {
      Title: book.title,
      Author: book.author,
      ISBN: book.isbn,
      'Published Year': book.first_publish_year,
      Publisher: book.publisher,
    }

    if (includePageCount && book.pageCount) {
      row['Page Count'] = book.pageCount
    }

    if (includeStatus) {
      row['Reading Status'] = STATUS_CONFIG[book.status].label
    }

    if (includeShelf && shelf) {
      row['Shelf'] = shelf.name
    }

    row['Date Added'] = new Date(book.dateAdded).toLocaleDateString()

    if (book.dateCompleted) {
      row['Date Completed'] = new Date(book.dateCompleted).toLocaleDateString()
    }

    return row
  })

  // Convert to CSV string
  const csv = Papa.unparse(csvData)

  // Download file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `piranesi-catalog-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Export books to PDF format
export function exportToPDF(
  books: Book[],
  shelves: Shelf[],
  options: ExportOptions = {}
): void {
  const {
    includeStatus = true,
    includeShelf = true,
    groupByShelf = true,
  } = options

  const doc = new jsPDF()
  let yPosition = 20

  // Title
  doc.setFontSize(20)
  doc.text('Piranesi Library Catalog', 20, yPosition)
  yPosition += 10

  // Subtitle
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, yPosition)
  doc.text(`Total Books: ${books.length}`, 20, yPosition + 5)
  yPosition += 15
  doc.setTextColor(0)

  if (groupByShelf) {
    // Group books by shelf
    const booksByShelf = shelves.reduce((acc, shelf) => {
      acc[shelf.id] = books.filter(b => b.shelfId === shelf.id)
      return acc
    }, {} as Record<string, Book[]>)

    // Render each shelf
    shelves.forEach(shelf => {
      const shelfBooks = booksByShelf[shelf.id]
      if (!shelfBooks || shelfBooks.length === 0) return

      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
      }

      // Shelf header
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(`${shelf.icon} ${shelf.name}`, 20, yPosition)
      yPosition += 5

      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(100)
      doc.text(shelf.description, 20, yPosition)
      doc.text(`(${shelfBooks.length} books)`, 20, yPosition + 4)
      yPosition += 10
      doc.setTextColor(0)

      // Render books in shelf
      shelfBooks.forEach((book, index) => {
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)

        // Book number and title
        doc.text(`${index + 1}. ${book.title}`, 25, yPosition)
        yPosition += 5

        // Author
        doc.setFontSize(9)
        doc.setTextColor(80)
        doc.text(`   by ${book.author}`, 25, yPosition)
        yPosition += 4

        // Metadata
        const metadata: string[] = []
        if (book.isbn && book.isbn !== 'N/A') metadata.push(`ISBN: ${book.isbn}`)
        if (book.pageCount) metadata.push(`${book.pageCount} pages`)
        if (includeStatus) metadata.push(STATUS_CONFIG[book.status].label)

        if (metadata.length > 0) {
          doc.text(`   ${metadata.join(' • ')}`, 25, yPosition)
          yPosition += 4
        }

        doc.setTextColor(0)
        yPosition += 2
      })

      yPosition += 5
    })
  } else {
    // Simple list without grouping
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('All Books', 20, yPosition)
    yPosition += 10

    books.forEach((book, index) => {
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(`${index + 1}. ${book.title}`, 20, yPosition)
      yPosition += 5

      doc.setFontSize(9)
      doc.setTextColor(80)
      doc.text(`   by ${book.author}`, 20, yPosition)
      yPosition += 6
      doc.setTextColor(0)
    })
  }

  // Save PDF
  doc.save(`piranesi-catalog-${new Date().toISOString().split('T')[0]}.pdf`)
}

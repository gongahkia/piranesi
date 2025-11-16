// Color extraction utilities for book spine colors

// Convert RGB array to hex color
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }).join('')
}

// Calculate relative luminance for WCAG contrast
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

// Darken color for better spine appearance
export function darkenColor(hex: string, amount: number = 0.3): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const darkened = {
    r: Math.round(rgb.r * (1 - amount)),
    g: Math.round(rgb.g * (1 - amount)),
    b: Math.round(rgb.b * (1 - amount))
  }

  return rgbToHex(darkened.r, darkened.g, darkened.b)
}

// Convert hex to RGB object
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// Get contrasting text color (white or black) for background
export function getContrastColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor)
  if (!rgb) return '#ffffff'

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b)
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

// Extract color from image URL using colorthief
export async function extractColorFromCover(imageUrl: string): Promise<string> {
  try {
    // For server-side or when colorthief isn't available, return status-based color
    // This will be overridden by client-side extraction
    return '#6b7280' // gray-500 as fallback
  } catch (error) {
    console.error('Color extraction failed:', error)
    return '#6b7280'
  }
}

// Client-side color extraction using canvas
export function extractColorClient(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          resolve('#6b7280')
          return
        }

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        // Sample center region of the cover
        const centerX = Math.floor(img.width / 2)
        const centerY = Math.floor(img.height / 2)
        const sampleSize = 50

        const imageData = ctx.getImageData(
          Math.max(0, centerX - sampleSize / 2),
          Math.max(0, centerY - sampleSize / 2),
          Math.min(sampleSize, img.width),
          Math.min(sampleSize, img.height)
        )

        // Calculate average color
        let r = 0, g = 0, b = 0, count = 0

        for (let i = 0; i < imageData.data.length; i += 4) {
          r += imageData.data[i]
          g += imageData.data[i + 1]
          b += imageData.data[i + 2]
          count++
        }

        r = Math.round(r / count)
        g = Math.round(g / count)
        b = Math.round(b / count)

        const hex = rgbToHex(r, g, b)
        const darkened = darkenColor(hex, 0.2)
        resolve(darkened)
      } catch (error) {
        console.error('Canvas color extraction failed:', error)
        resolve('#6b7280')
      }
    }

    img.onerror = () => {
      resolve('#6b7280')
    }

    img.src = imageUrl
  })
}

// Generate Tailwind-safe inline style for spine color
export function getSpineColorStyle(color: string): { backgroundColor: string; color: string } {
  return {
    backgroundColor: color,
    color: getContrastColor(color)
  }
}

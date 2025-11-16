import { NextResponse } from "next/server"
import type { Shelf } from "@/types/shelf"
import { DEFAULT_SHELVES } from "@/types/shelf"

let shelves: Shelf[] = [...DEFAULT_SHELVES]

export async function GET() {
  return NextResponse.json(shelves)
}

export async function POST(request: Request) {
  const shelfData = await request.json()

  const newShelf: Shelf = {
    id: `custom-${Date.now()}`,
    name: shelfData.name,
    description: shelfData.description || '',
    isDefault: false,
    icon: shelfData.icon || '📚',
    createdAt: new Date().toISOString(),
  }

  shelves.push(newShelf)
  return NextResponse.json(newShelf)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Shelf ID is required" }, { status: 400 })
  }

  const shelf = shelves.find(s => s.id === id)

  if (shelf?.isDefault) {
    return NextResponse.json({ error: "Cannot delete default shelves" }, { status: 400 })
  }

  const initialLength = shelves.length
  shelves = shelves.filter((shelf) => shelf.id !== id)

  if (shelves.length === initialLength) {
    return NextResponse.json({ error: "Shelf not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request) {
  const { id, name, description, icon } = await request.json()

  if (!id) {
    return NextResponse.json({ error: "Shelf ID is required" }, { status: 400 })
  }

  const shelfIndex = shelves.findIndex((shelf) => shelf.id === id)

  if (shelfIndex === -1) {
    return NextResponse.json({ error: "Shelf not found" }, { status: 404 })
  }

  shelves[shelfIndex] = {
    ...shelves[shelfIndex],
    name: name !== undefined ? name : shelves[shelfIndex].name,
    description: description !== undefined ? description : shelves[shelfIndex].description,
    icon: icon !== undefined ? icon : shelves[shelfIndex].icon,
  }

  return NextResponse.json(shelves[shelfIndex])
}

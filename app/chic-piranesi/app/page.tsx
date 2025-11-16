"use client"

import { useState } from "react"
import Bookshelf from "@/components/Bookshelf"
import SearchBar from "@/components/SearchBar"
import ShelfNav from "@/components/ShelfNav"
import LandingPage from "@/components/LandingPage"
import InitialLandingPage from "@/components/InitialLandingPage"

export default function Home() {
  const [stage, setStage] = useState<"initial" | "disclaimer" | "main">("initial")
  const [selectedShelfId, setSelectedShelfId] = useState<string>("cell-a")

  if (stage === "initial") {
    return <InitialLandingPage onStart={() => setStage("disclaimer")} />
  }

  if (stage === "disclaimer") {
    return <LandingPage onAgree={() => setStage("main")} />
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-2 text-center text-gray-800 font-serif">Piranesi</h1>
        <p className="text-center text-gray-600 mb-8">
          Made by{" "}
          <a
            href="https://github.com/gongahkia"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            @gongahkia
          </a>
        </p>
        <SearchBar selectedShelfId={selectedShelfId} />
        <div className="flex gap-6 mt-8">
          <ShelfNav selectedShelfId={selectedShelfId} onShelfSelect={setSelectedShelfId} />
          <div className="flex-1">
            <Bookshelf selectedShelfId={selectedShelfId} />
          </div>
        </div>
      </div>
    </main>
  )
}

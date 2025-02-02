"use client"

import { useState } from "react"
import Bookshelf from "@/components/Bookshelf"
import SearchBar from "@/components/SearchBar"
import LandingPage from "@/components/LandingPage"
import InitialLandingPage from "@/components/InitialLandingPage"

export default function Home() {
  const [stage, setStage] = useState<"initial" | "disclaimer" | "main">("initial")

  if (stage === "initial") {
    return <InitialLandingPage onStart={() => setStage("disclaimer")} />
  }

  if (stage === "disclaimer") {
    return <LandingPage onAgree={() => setStage("main")} />
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
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
        <SearchBar />
        <Bookshelf />
      </div>
    </main>
  )
}

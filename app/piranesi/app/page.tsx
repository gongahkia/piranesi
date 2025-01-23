import Bookshelf from "@/components/Bookshelf"
import SearchBar from "@/components/SearchBar"

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Piranesi</h1>
      <SearchBar />
      <Bookshelf />
    </main>
  )
}

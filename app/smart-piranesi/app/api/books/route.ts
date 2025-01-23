import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);
const dbName = "bookstore";
const collectionName = "books";

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db(dbName).collection(collectionName);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

export async function GET() {
  const collection = await connectToDatabase();
  const books = await collection.find({}).toArray();
  return NextResponse.json(books);
}

export async function POST(request: Request) {
  const collection = await connectToDatabase();
  const book = await request.json();
  const newBook = {
    title: book.title,
    author: book.author_name?.[0] || "Unknown",
    cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : "/placeholder.svg",
  };
  const result = await collection.insertOne(newBook);
  return NextResponse.json({ ...newBook, _id: result.insertedId });
}

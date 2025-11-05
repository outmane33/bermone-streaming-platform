// lib/mongodb.js
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  minPoolSize: 0, // critical for serverless
  serverSelectionTimeoutMS: 5000, // fail faster
  socketTimeoutMS: 45000,
  retryWrites: true,
  w: "majority",
};

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  // Reuse in development
  if (process.env.NODE_ENV === "development") {
    if (!cachedClient) {
      const client = new MongoClient(uri, options);
      await client.connect();
      cachedClient = client;
      cachedDb = client.db();
    }
    return { client: cachedClient, db: cachedDb };
  }

  // In production: always create new client per cold start
  // (don't rely on global cache across invocations)
  const client = new MongoClient(uri, options);
  await client.connect();
  return { client, db: client.db() };
}

export default connectToDatabase;

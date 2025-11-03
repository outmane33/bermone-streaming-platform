// lib/mongodb.js
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

const uri = process.env.MONGODB_URI;

// Optional: validate TLS (for extra safety)
if (process.env.NODE_ENV === "production" && !uri.includes("tls=true")) {
  console.warn("⚠️ Production MongoDB URI should include tls=true");
}

const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  retryWrites: true,
  w: "majority",
  // useUnifiedTopology: true, // not needed in driver v4+
};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Optional: log connection errors
clientPromise.catch((err) => {
  console.error("MongoDB connection error:", err);
});

export default clientPromise;

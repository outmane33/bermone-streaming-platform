// lib/mongodb.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
};

let client;
let clientPromise;
if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
  // في الـ development، استخدم متغير global لمنع إنشاء اتصالات كثيرة
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // في الـ production، أحسن نستخدم اتصال عادي
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

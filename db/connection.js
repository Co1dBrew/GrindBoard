import { MongoClient } from "mongodb";

let db;

export async function connectDB(uri) {
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db();
    console.log("Connected to MongoDB:", db.databaseName);
    return db;
}

export function getDB() {
    if (!db) {
        throw new Error("Database not initialized — call connectDB first");
    }
    return db;
}

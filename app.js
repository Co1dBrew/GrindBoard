import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db/connection.js";
import questionRoutes from "./routes/questionRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/questions", questionRoutes);
app.use("/api/sessions", sessionRoutes);

// Serve index.html for all non-API routes (client-side routing)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server after DB connection
async function start() {
    try {
        const uri =
            process.env.MONGO_URI || "mongodb://localhost:27017/grindboard";
        await connectDB(uri);
        app.listen(PORT, () => {
            console.log(`GrindBoard running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start:", err);
        process.exit(1);
    }
}

start();

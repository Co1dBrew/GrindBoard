import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/connection.js";

const router = Router();

// GET /api/questions — list all, with optional filters
router.get("/", async (req, res) => {
    try {
        const db = getDB();
        const { company, topic, difficulty } = req.query;
        const filter = {};

        if (company) {
            filter.company = {
                $in: company.split(",").map((c) => c.trim()),
            };
        }
        if (topic) {
            filter.topic = {
                $in: topic.split(",").map((t) => t.trim()),
            };
        }
        if (difficulty) {
            filter.difficulty = difficulty;
        }

        const questions = await db
            .collection("questions")
            .find(filter)
            .sort({ createdAt: -1 })
            .toArray();

        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/questions/:id — single question
router.get("/:id", async (req, res) => {
    try {
        const db = getDB();
        const question = await db
            .collection("questions")
            .findOne({ _id: new ObjectId(req.params.id) });

        if (!question) {
            return res.status(404).json({ error: "Question not found" });
        }
        res.json(question);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/questions — create
router.post("/", async (req, res) => {
    try {
        const db = getDB();
        const { title, link, company, topic, difficulty } = req.body;

        const doc = {
            title: title.trim(),
            link: link.trim(),
            company: company
                ? company
                    .split(",")
                    .map((c) => c.trim())
                    .filter(Boolean)
                : [],
            topic: topic
                ? topic
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                : [],
            difficulty: difficulty || "Med",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection("questions").insertOne(doc);
        doc._id = result.insertedId;
        res.status(201).json(doc);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT /api/questions/:id — update
router.put("/:id", async (req, res) => {
    try {
        const db = getDB();
        const { title, link, company, topic, difficulty } = req.body;

        const updates = {
            title: title.trim(),
            link: link.trim(),
            company: company
                ? company
                    .split(",")
                    .map((c) => c.trim())
                    .filter(Boolean)
                : [],
            topic: topic
                ? topic
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                : [],
            difficulty: difficulty || "Med",
            updatedAt: new Date(),
        };

        const result = await db
            .collection("questions")
            .findOneAndUpdate(
                { _id: new ObjectId(req.params.id) },
                { $set: updates },
                { returnDocument: "after" },
            );

        if (!result) {
            return res.status(404).json({ error: "Question not found" });
        }
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /api/questions/:id — delete
router.delete("/:id", async (req, res) => {
    try {
        const db = getDB();
        const result = await db
            .collection("questions")
            .deleteOne({ _id: new ObjectId(req.params.id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Question not found" });
        }

        // also remove related sessions
        await db
            .collection("practice_sessions")
            .deleteMany({ questionId: req.params.id });

        res.json({ message: "Question deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

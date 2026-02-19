import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/connection.js";

const router = Router();

// GET /api/sessions — list all, optional filter by questionId
router.get("/", async (req, res) => {
    try {
        const db = getDB();
        const { questionId } = req.query;
        const filter = {};
        if (questionId) filter.questionId = questionId;

        // Optimize: Sort and limit could be applied here if pagination was implemented
        // For now, we fetch all sessions but optimize the join
        const sessions = await db
            .collection("practice_sessions")
            .find(filter)
            .sort({ date: -1 })
            .toArray();

        // Optimize: Bulk fetch questions for efficient joining
        const qIds = [
            ...new Set(
                sessions
                    .map((s) => s.questionId)
                    .filter((id) => ObjectId.isValid(id)),
            ),
        ];

        const questions = await db
            .collection("questions")
            .find({
                _id: { $in: qIds.map((id) => new ObjectId(id)) },
            })
            .toArray();

        const qMap = {};
        questions.forEach((q) => {
            qMap[q._id.toString()] = q;
        });

        const enriched = sessions.map((s) => ({
            ...s,
            question: qMap[s.questionId] || null,
        }));

        res.json(enriched);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/sessions/stats — summary stats
router.get("/stats", async (req, res) => {
    try {
        const db = getDB();
        const sessions = await db
            .collection("practice_sessions")
            .find()
            .toArray();

        const totalSessions = sessions.length;
        const solved = sessions.filter((s) => s.result === "Solved").length;
        const unsolved = sessions.filter((s) => s.result === "Unsolved").length;
        const partial = sessions.filter((s) => s.result === "Partial").length;

        const avgTime =
            totalSessions > 0
                ? (
                    sessions.reduce((sum, s) => sum + s.timeSpent, 0) /
                      totalSessions
                ).toFixed(1)
                : 0;

        // per-topic breakdown
        const topicMap = {};

        // Optimize: Fetch all relevant questions in one query
        const qIds = [...new Set(sessions.map((s) => s.questionId))].filter((id) =>
            ObjectId.isValid(id),
        );
        const questions = await db
            .collection("questions")
            .find({
                _id: { $in: qIds.map((id) => new ObjectId(id)) },
            })
            .toArray();

        const qMap = {};
        questions.forEach((q) => (qMap[q._id.toString()] = q));

        for (const s of sessions) {
            const q = qMap[s.questionId];
            if (!q) continue;
            for (const t of q.topic || []) {
                if (!topicMap[t])
                    topicMap[t] = { total: 0, solved: 0, time: 0 };
                topicMap[t].total++;
                if (s.result === "Solved") topicMap[t].solved++;
                topicMap[t].time += s.timeSpent;
            }
        }

        const byTopic = Object.entries(topicMap).map(([topic, data]) => ({
            topic,
            total: data.total,
            solved: data.solved,
            solveRate: ((data.solved / data.total) * 100).toFixed(0),
            avgTime: (data.time / data.total).toFixed(1),
        }));

        res.json({
            totalSessions,
            solved,
            unsolved,
            partial,
            avgTime,
            byTopic,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/sessions/question/:questionId — history for one question
router.get("/question/:questionId", async (req, res) => {
    try {
        const db = getDB();
        const question = await db.collection("questions").findOne({
            _id: new ObjectId(req.params.questionId),
        });

        if (!question) {
            return res.status(404).json({ error: "Question not found" });
        }

        const sessions = await db
            .collection("practice_sessions")
            .find({ questionId: req.params.questionId })
            .sort({ date: -1 })
            .toArray();

        const stats = {
            totalAttempts: sessions.length,
            solved: sessions.filter((s) => s.result === "Solved").length,
            unsolved: sessions.filter((s) => s.result === "Unsolved").length,
            avgTime:
                sessions.length > 0
                    ? (
                        sessions.reduce((sum, s) => sum + s.timeSpent, 0) /
                          sessions.length
                    ).toFixed(1)
                    : 0,
        };

        res.json({ question, sessions, stats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/sessions/:id — single session
router.get("/:id", async (req, res) => {
    try {
        const db = getDB();
        const session = await db
            .collection("practice_sessions")
            .findOne({ _id: new ObjectId(req.params.id) });

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }
        res.json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/sessions — create
router.post("/", async (req, res) => {
    try {
        const db = getDB();
        const { questionId, timeSpent, result, notes } = req.body;

        const doc = {
            questionId,
            timeSpent: parseInt(timeSpent, 10),
            result,
            notes: notes ? notes.trim() : "",
            date: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const inserted = await db
            .collection("practice_sessions")
            .insertOne(doc);
        doc._id = inserted.insertedId;
        res.status(201).json(doc);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT /api/sessions/:id — update
router.put("/:id", async (req, res) => {
    try {
        const db = getDB();
        const { timeSpent, result, notes } = req.body;

        const updates = {
            timeSpent: parseInt(timeSpent, 10),
            result,
            notes: notes ? notes.trim() : "",
            updatedAt: new Date(),
        };

        const updated = await db
            .collection("practice_sessions")
            .findOneAndUpdate(
                { _id: new ObjectId(req.params.id) },
                { $set: updates },
                { returnDocument: "after" },
            );

        if (!updated) {
            return res.status(404).json({ error: "Session not found" });
        }
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /api/sessions/:id — delete
router.delete("/:id", async (req, res) => {
    try {
        const db = getDB();
        const result = await db
            .collection("practice_sessions")
            .deleteOne({ _id: new ObjectId(req.params.id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Session not found" });
        }
        res.json({ message: "Session deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

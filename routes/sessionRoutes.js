import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/connection.js";

const router = Router();

// GET /api/sessions — list all, optional filter by questionId
router.get("/", async (req, res) => {
    try {
        const db = getDB();
        const { questionId, page: pageQuery, limit: limitQuery } = req.query;
        const filter = {};
        if (questionId) filter.questionId = questionId;

        const page = parseInt(pageQuery) || 1;
        const limit = parseInt(limitQuery) || 50;
        const skip = (page - 1) * limit;

        const total = await db
            .collection("practice_sessions")
            .countDocuments(filter);

        const sessions = await db
            .collection("practice_sessions")
            .find(filter)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
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

        res.json({
            data: enriched,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/sessions/stats — summary stats
router.get("/stats", async (req, res) => {
    try {
        const db = getDB();

        // Aggregation to get overall stats and per-topic stats in one go
        const pipeline = [
            {
                $facet: {
                    overall: [
                        {
                            $group: {
                                _id: null,
                                totalSessions: { $sum: 1 },
                                solved: {
                                    $sum: {
                                        $cond: [{ $eq: ["$result", "Solved"] }, 1, 0],
                                    },
                                },
                                unsolved: {
                                    $sum: {
                                        $cond: [{ $eq: ["$result", "Unsolved"] }, 1, 0],
                                    },
                                },
                                partial: {
                                    $sum: {
                                        $cond: [{ $eq: ["$result", "Partial"] }, 1, 0],
                                    },
                                },
                                totalTime: { $sum: "$timeSpent" },
                            },
                        },
                    ],
                    byTopic: [
                        {
                            $addFields: {
                                questionObjectId: { $toObjectId: "$questionId" },
                            },
                        },
                        {
                            $lookup: {
                                from: "questions",
                                localField: "questionObjectId",
                                foreignField: "_id",
                                as: "question",
                            },
                        },
                        { $unwind: "$question" },
                        { $unwind: "$question.topic" },
                        {
                            $group: {
                                _id: "$question.topic",
                                total: { $sum: 1 },
                                solved: {
                                    $sum: {
                                        $cond: [{ $eq: ["$result", "Solved"] }, 1, 0],
                                    },
                                },
                                totalTime: { $sum: "$timeSpent" },
                            },
                        },
                    ],
                },
            },
        ];

        const [result] = await db
            .collection("practice_sessions")
            .aggregate(pipeline)
            .toArray();

        const overall = result.overall[0] || {
            totalSessions: 0,
            solved: 0,
            unsolved: 0,
            partial: 0,
            totalTime: 0,
        };

        const avgTime =
            overall.totalSessions > 0
                ? (overall.totalTime / overall.totalSessions).toFixed(1)
                : 0;

        const byTopic = result.byTopic.map((t) => ({
            topic: t._id,
            total: t.total,
            solved: t.solved,
            solveRate: ((t.solved / t.total) * 100).toFixed(0),
            avgTime: (t.totalTime / t.total).toFixed(1),
        }));

        res.json({
            totalSessions: overall.totalSessions,
            solved: overall.solved,
            unsolved: overall.unsolved,
            partial: overall.partial,
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

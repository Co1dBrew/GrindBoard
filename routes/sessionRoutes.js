const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Question = require('../models/Question');

// GET /sessions - View all practice sessions (history)
router.get('/', async (req, res) => {
  try {
    const { questionId } = req.query;
    let query = {};
    if (questionId) query.questionId = questionId;
    
    const sessions = await Session.find(query)
      .populate('questionId', 'title difficulty')
      .sort({ date: -1 });
    
    res.render('sessions/index', { sessions, questionId });
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

// GET /sessions/new - Form to log a new practice attempt
router.get('/new', async (req, res) => {
  try {
    const questions = await Question.find().sort({ title: 1 });
    res.render('sessions/new', { questions, session: null });
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

// GET /sessions/new/:questionId - Form to log attempt for specific question
router.get('/new/:questionId', async (req, res) => {
  try {
    const questions = await Question.find().sort({ title: 1 });
    const selectedQuestion = await Question.findById(req.params.questionId);
    res.render('sessions/new', { questions, selectedQuestion, session: null });
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

// POST /sessions - Create new practice session
router.post('/', async (req, res) => {
  try {
    const { questionId, timeSpent, result, notes } = req.body;
    const session = new Session({
      questionId,
      timeSpent: parseInt(timeSpent),
      result,
      notes
    });
    await session.save();
    res.redirect('/sessions');
  } catch (err) {
    const questions = await Question.find().sort({ title: 1 });
    res.status(400).render('sessions/new', { questions, session: req.body, error: err.message });
  }
});

// GET /sessions/question/:questionId - View history for a specific question
router.get('/question/:questionId', async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).render('error', { message: 'Question not found' });
    
    const sessions = await Session.find({ questionId: req.params.questionId })
      .sort({ date: -1 });
    
    // Calculate stats
    const stats = {
      totalAttempts: sessions.length,
      solved: sessions.filter(s => s.result === 'Solved').length,
      unsolved: sessions.filter(s => s.result === 'Unsolved').length,
      avgTime: sessions.length > 0 
        ? (sessions.reduce((sum, s) => sum + s.timeSpent, 0) / sessions.length).toFixed(1)
        : 0
    };
    
    res.render('sessions/question-history', { question, sessions, stats });
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

// DELETE /sessions/:id - Delete a session
router.delete('/:id', async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).render('error', { message: 'Session not found' });
    res.redirect('/sessions');
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

module.exports = router;

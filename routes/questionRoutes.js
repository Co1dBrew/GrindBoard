const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// GET /questions - Index (List all questions with filter)
router.get('/', async (req, res) => {
  try {
    const { company, topic, difficulty } = req.query;
    let query = {};
    
    if (company) query.company = { $in: company.split(',').map(c => c.trim()) };
    if (topic) query.topic = { $in: topic.split(',').map(t => t.trim()) };
    if (difficulty) query.difficulty = difficulty;
    
    const questions = await Question.find(query).sort({ createdAt: -1 });
    res.render('questions/index', { questions, query: req.query });
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

// GET /questions/new - New question form
router.get('/new', (req, res) => {
  res.render('questions/new', { question: null });
});

// POST /questions - Create new question
router.post('/', async (req, res) => {
  try {
    const { title, link, company, topic, difficulty } = req.body;
    const question = new Question({
      title,
      link,
      company: company ? company.split(',').map(c => c.trim()) : [],
      topic: topic ? topic.split(',').map(t => t.trim()) : [],
      difficulty
    });
    await question.save();
    res.redirect('/questions');
  } catch (err) {
    res.status(400).render('questions/new', { question: req.body, error: err.message });
  }
});

// GET /questions/:id/edit - Edit question form
router.get('/:id/edit', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).render('error', { message: 'Question not found' });
    res.render('questions/edit', { question });
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

// PUT /questions/:id - Update question
router.put('/:id', async (req, res) => {
  try {
    const { title, link, company, topic, difficulty } = req.body;
    const question = await Question.findByIdAndUpdate(req.params.id, {
      title,
      link,
      company: company ? company.split(',').map(c => c.trim()) : [],
      topic: topic ? topic.split(',').map(t => t.trim()) : [],
      difficulty
    }, { new: true, runValidators: true });
    
    if (!question) return res.status(404).render('error', { message: 'Question not found' });
    res.redirect('/questions');
  } catch (err) {
    res.status(400).render('questions/edit', { question: { ...req.body, _id: req.params.id }, error: err.message });
  }
});

// DELETE /questions/:id - Delete question
router.delete('/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).render('error', { message: 'Question not found' });
    res.redirect('/questions');
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

module.exports = router;

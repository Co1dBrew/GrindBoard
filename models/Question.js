const mongoose = require('mongoose');

// Question Schema - Qingdong's Domain
// Technical interview question bank
const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  link: {
    type: String,
    required: true,
    trim: true
  },
  company: [{
    type: String,
    trim: true
  }],
  topic: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['Easy', 'Med', 'Hard'],
    default: 'Med'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);

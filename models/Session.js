const mongoose = require('mongoose');

// Session Schema - Alexander's Domain
// Practice session tracking for attempts
const sessionSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  timeSpent: {
    type: Number, // in minutes
    required: true,
    min: 0
  },
  result: {
    type: String,
    enum: ['Solved', 'Unsolved'],
    required: true
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);

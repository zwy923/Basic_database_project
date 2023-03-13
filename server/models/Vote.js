const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  objectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  isvoted: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;


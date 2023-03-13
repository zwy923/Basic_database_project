const mongoose = require('mongoose');
const Vote = require('./Vote')

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  codeSnippet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodeSnippet',
    required: true
  },
  vote:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vote',
  }
}, { timestamps: true });

commentSchema.pre('findOneAndDelete', async function (next) {
  try {

    // Remove all associated votes
    await Vote.deleteMany({ objectId: this._conditions._id });

    next();
  } catch (err) {
    next(err);
  }
});

commentSchema.pre('deleteMany', async function (next) {
  try {

    // Remove all associated votes
    await Vote.deleteMany({ objectId: this._conditions._id });

    next();
  } catch (err) {
    next(err);
  }
})

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;

const mongoose = require('mongoose');
const Comment = require('./Comment');
const Vote = require('./Vote')

const codeSnippetSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vote',
  }
}, { timestamps: true });

codeSnippetSchema.pre('findOneAndDelete', async function (next) {
  try {

    // Remove all associated comments
    await Comment.deleteMany({ codeSnippet: this._conditions._id });
    console.log("111")
    // Remove all associated votes
    await Vote.deleteMany({ objectId: this._conditions._id });

    next();
  } catch (err) {
    console.log(err)
    next(err);
  }
});

const CodeSnippet = mongoose.model('CodeSnippet', codeSnippetSchema);

module.exports = CodeSnippet;


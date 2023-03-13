var express = require('express');
var router = express.Router();
const mongoose = require("mongoose")
const User = require('../models/User')
const Comment = require('../models/Comment');
const CodeSnippet = require('../models/CodeSnippet');
const Vote = require('../models/Vote')

const passport = require('passport')
const jwt = require("jsonwebtoken");
const validateToken = require("../auth/validateToken.js")
const { check, validationResult } = require('express-validator')
process.env.SECRET = 'mysecretkey';


router.get('/private', validateToken, (req, res) => {
  res.json({ email: req.user.email });
});

router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

// Handle user login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  // Find user with the specified email
  User.findOne({ email }, (err, user) => {
    if (err) return res.status(500).json({ error: 'something went wrong' });
    // If user not found, return error
    if (!user) return res.status(404).json({ error: 'user not found' });
    // Compare the provided password with the user's stored password
    user.comparePassword(password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'something went wrong' });
      // If passwords don't match, return error
      if (!isMatch) return res.status(401).json({ error: 'email or password is incorrect' });
      // If passwords match, create a JSON Web Token (JWT) for the user
      const payload = { _id:user._id, email: user.email, name:user.name, role:user.role};
      const token = jwt.sign(payload, process.env.SECRET,{
        expiresIn: 7200 // Token expires in 7200 seconds (2 hours)
      });
      // Return success message and token
      res.json({ "success":"true", "token":token});
    });
  });
});


// Handle getting a user's name by their user ID
router.post('/getusername',(req, res)=>{
  const id  = req.body.userid
  // Find user with the specified ID
  User.findOne({_id:id},(err,user)=>{
    if (err) return res.status(500).json({ error: 'something went wrong' });
    // If user not found, return error
    if (!user) return res.status(404).json({ error: 'user not found' });
    // Return user's name
    res.json({name:user.name})
  })
})

// Handle logout
router.post('/logout', (req, res) => {
  res.clearCookie('jwt'); // Clear the JWT token stored in the cookie
  res.json({ success: true });
});



// Handle user registration
router.post('/register', [
  // Validate email and password using express-validator
  check('email').isEmail().withMessage('Invalid email format'),
  check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\~\`\!\@\#\$\%\^\&\*\(\)\-\_\+\=\{\}\[\]\|\\\;\:\"\<\>\,\.\/\?]).*$/)
    .withMessage("Password must include at least one lowercase letter, one uppercase letter, and one number")
],(req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Get email, password, name, and role code from request body
  const { email, password, name, rolecode} = req.body;
  // Set profile message for new user
  const profile = "This user is very lazy and hasn't left a profile :)"
  // Set user role based on role code
  if(rolecode === 'zhangwenyue923'){
    role = 'admin'
  }else{
    role = 'normal'
  }
  const user = new User({ email, password, name ,role, profile});
  user.save((err) => {
    if (err) {
        if(err.code === 11000) return res.status(403).json({error: 'email already exists'});
        return res.status(500).json({error: 'something went wrong'});
    }
    res.json({ message: 'User created successfully' });
  });
});


// Create a new code snippet
router.post('/codeSnippets', validateToken, (req, res) => {
  // Extract the required fields from the request body
  const { title, code, tags, description} = req.body;
  // Get the authenticated user from the request
  const user = req.user;

  // Create a new code snippet instance
  const codeSnippet = new CodeSnippet({
    title,
    code,
    tags,
    description,
    user: user._id
  });

  // Save the new code snippet instance to the database
  codeSnippet.save((err, codeSnippet) => {
    if (err) {
      // If there's an error, log it and return an error response
      console.log(err)
      res.status(500).json({ error: 'Something went wrong' });
    } else {
      // If the code snippet was successfully saved, return it as a response
      res.json(codeSnippet);
    }
  });
});


// Get an existing code snippet
router.get('/codeSnippets/:id', validateToken, (req, res) => {
  // Extract the id of the code snippet from the request parameters
  const codeSnippetId = req.params.id;
  // Look up the code snippet with the given id
  CodeSnippet.findOne({ _id: codeSnippetId}, (err, codeSnippet) => {
    // If there was an error, respond with a 500 error status and an error message
    if (err) {
      res.status(500).json({ error: 'Something went wrong' });
    // If no code snippet was found, respond with a 404 error status and an error message
    } else if (!codeSnippet) {
      res.status(404).json({ error: 'Code snippet not found or unauthorized to edit' });
    // If the code snippet was found, respond with the code snippet as a JSON object
    } else {
      res.json(codeSnippet);
    }
  });
});


// Edit an existing code snippet
router.put('/codeSnippets/:id', validateToken, (req, res) => {
  // Extract the code snippet ID and user ID from the request
  const codeSnippetId = req.params.id;
  const userId = req.user._id;

  // Extract the updated title, code, tags, and description from the request body
  const { title, code, tags, description} = req.body;

  // Update the code snippet with the specified ID and user ID
  CodeSnippet.findOneAndUpdate({ _id: codeSnippetId, user: userId }, { title, code, description, tags, updatedAt: Date.now() }, { new: true }, (err, codeSnippet) => {
    if (err) {
      // Handle any errors that occur during the update
      res.status(500).json({ error: 'Something went wrong' });
    } else if (!codeSnippet) {
      // Handle the case where the code snippet is not found or the user is not authorized to edit it
      res.status(404).json({ error: 'Code snippet not found or unauthorized to edit' });
    } else {
      // Return the updated code snippet
      res.json(codeSnippet);
    }
  });
});


// Delete an existing code snippet
router.delete('/codeSnippets/:id', validateToken, (req, res) => {
  // Get the code snippet ID and user ID from the request parameters and user object
  const codeSnippetId = req.params.id;
  const userId = req.user._id;

  // Find the code snippet with the given ID that belongs to the user and delete it
  CodeSnippet.findOneAndDelete({ _id: codeSnippetId, user: userId }, (err, codeSnippet) => {
    // If there is an error, return a 500 status code and an error message
    if (err) {
      res.status(500).json({ error: 'Something went wrong' });
    }
    // If the code snippet doesn't exist or doesn't belong to the user, return a 404 status code and an error message
    else if (!codeSnippet) {
      res.status(404).json({ error: 'Code snippet not found or unauthorized to delete' });
    }
    // If the code snippet is successfully deleted, return a success message
    else {
      res.json({ message: 'Code snippet deleted successfully' });
    }
  });
});


// Get all code snippets
router.get('/codesnippets', async (req, res) => {
  try {
    // Retrieve all code snippets from the database
    const snippets = await CodeSnippet.find();

    // Return the snippets as a JSON response
    res.json(snippets);
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Get all comments for a specific code snippet
router.get('/comments/:snippetId', async (req, res) => {
  const snippetId = req.params.snippetId;

  try {
    // Query the Comment model for all comments related to the snippet id and populate the user field with name only
    const comments = await Comment.find({ codeSnippet: snippetId })
      .populate('user', 'name')
      .sort({ createdAt: -1 }); // Sort comments by creation date in descending order
    res.json({ comments });
  } catch (err) {
    // Log error to console and send 500 status code with a message
    console.log(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// Handle POST request for adding a comment
router.post('/comments', validateToken, (req, res) => {

  // Extract the comment text and associated code snippet ID from the request body
  const text = req.body.text;
  const codeSnippetId = req.body.codeSnippetId;
  // Create a new Comment object with the extracted data, including the ID of the authenticated user
  const comment = new Comment({
    text: text,
    user: req.user._id,
    codeSnippet: codeSnippetId,
  });

  // Save the new comment to the database
  comment.save((err, comment) => {
    if (err) {
      // If there was an error saving the comment, return a 500 error with an error message
      res.status(500).json({ error: 'Something went wrong' });
    } else {
      // If the comment was saved successfully, return the comment object in the response
      res.json(comment);
    }
  });
});



// Edit an existing comment
router.put('/comments/:id', validateToken, (req, res) => {
  // Extract the comment ID and text from the request
  const commentId = req.params.id;
  const text = req.body.text;

  // Use Mongoose's findOneAndUpdate method to update the comment with the given ID
  Comment.findOneAndUpdate(
    { _id: commentId},  // Find the comment with the given ID
    { text },  // Update the comment's text field
    { new: true },  // Return the updated comment in the response
    (err, comment) => {  // Callback function to handle the result of the update
      if (err) {
        // If there was an error, return a 500 status code and an error message
        res.status(500).json({ error: 'Something went wrong' });
      } else if (!comment) {
        // If no comment was found, return a 404 status code and an error message
        res.status(404).json({ error: 'Comment not found or unauthorized to edit' });
      } else {
        // If the comment was successfully updated, return it in the response
        res.json(comment);
      }
    }
  );
});


// Delete an existing comment
router.delete('/comments/:id', validateToken, (req, res) => {
  const commentId = req.params.id; // Get the comment ID from the request parameters
  const userId = req.user._id; // Get the user ID from the authenticated user's information in the request

  Comment.findOneAndDelete({ _id: commentId, user: userId }, (err, comment) => { // Find the comment to delete by ID and the authenticated user ID
    if (err) { // If there is an error, return a 500 error with a message
      res.status(500).json({ error: 'Something went wrong' });
    } else if (!comment) { // If the comment doesn't exist or the authenticated user is unauthorized to delete, return a 404 error with a message
      res.status(404).json({ error: 'Comment not found or unauthorized to delete' });
    } else { // If the comment is successfully deleted, return a success message
      res.json({ message: 'Comment deleted successfully' });
    }
  });
});


// Upvote or cancel vote a post or comment
router.post('/votes', validateToken, async (req, res) => {
  const objectId = req.body.id; // Get the ID of the post or comment being voted on from the request body
  const userId = req.user._id; // Get the ID of the user who is making the vote from the request's authenticated user object
  try {
    const existingVote = await Vote.findOne({ user: userId, objectId: objectId }); // Check if the user has already voted on the post or comment by searching for a matching vote object in the database
    if (existingVote) {
      await Vote.deleteOne(existingVote) // If the user has already voted, delete their existing vote from the database to "unvote" the post or comment
      res.status(200).json({ isvoted: false }); // Respond to the request with a status of 200 and a JSON object indicating that the post or comment is no longer voted by the user
    } else {
      const newVote = new Vote({ user: userId, objectId: objectId, isvoted: true }); // If the user has not yet voted, create a new vote object in the database with the user ID, object ID, and "isvoted" flag set to true
      await newVote.save(); // Save the new vote object to the database
      res.status(201).json({ isvoted: true }); // Respond to the request with a status of 201 and a JSON object indicating that the post or comment is now voted by the user
    }
  } catch (err) {
    console.log(err); // If there's an error, log it to the console
    res.status(500).json({ message: 'Internal server error.' }); // Respond to the request with a status of 500 and a JSON object indicating that there was an internal server error
  }
});

// Get the isvoted status of a post or comment
router.get('/votes/:id', validateToken, async (req, res) => {
  // Extract the ID of the post or comment from the URL parameters
  const objectId = req.params.id;
  // Extract the ID of the user from the 'req' object, which contains information about the request being made
  const userId = req.user._id;
  try {
    // Check if the user has already voted on the post or comment using a query to the 'Vote' collection
    const vote = await Vote.findOne({ user: userId, objectId: objectId });
    // If the user has voted, return a JSON response with 'isvoted' set to true
    if (vote) {
      res.status(200).json({ isvoted: true });
    // If the user has not voted, return a JSON response with 'isvoted' set to false
    } else {
      res.status(200).json({ isvoted: false });
    }
  } catch (err) {
    // If an error occurs, log it to the console and return a JSON response with a 500 status code
    console.log(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// Get count of votes in specific post
router.get('/votes/count/:id', async (req, res) => {
  console.log(req.params.id)
  const Id = req.params.id;
  const voteCount = await Vote.countDocuments({ objectId: Id, isvoted: true });
  res.status(200).json({ count: voteCount });
});



module.exports = router;
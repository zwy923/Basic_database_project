var express = require('express');
var router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const passport = require('passport')
const jwt = require("jsonwebtoken");
const validateToken = require("../auth/validateToken.js")
const { check, validationResult } = require('express-validator')
process.env.SECRET = 'mysecretkey';


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'testdb',
  password: '0923',
  port: 5432,
});

// Create a multer storage object to specify where to save uploaded files
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/private', validateToken, (req, res) => {
  res.json({ email: req.user.email });
});

router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

// Handle user login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user with the specified email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'user not found' });
    }
    const user = result.rows[0];
    // Compare the provided password with the user's stored password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'email or password is incorrect' });
    }
    // If passwords match, create a JSON Web Token (JWT) for the user
    const payload = { _id: user.id, email: user.email, name: user.name, role: user.role };
    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: 7200 }); // Token expires in 7200 seconds (2 hours)
    // Return success message and token
    res.json({ "success": "true", "token": token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'something went wrong' });
  }
});


// Handle getting a user's name by their user ID
router.post('/getusername', async (req, res) => {
  const id = req.body.userid;
  try {
    // Find user with the specified ID
    const result = await pool.query('SELECT name FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'user not found' });
    }
    // Return user's name
    res.json({ name: result.rows[0].name });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'something went wrong' });
  }
});


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
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Get email, password, name, and role code from request body
  const { email, password, name, rolecode } = req.body;
  // Set profile message for new user
  // Set user role based on role code
  const role = rolecode === 'zhangwenyue923' ? 'admin' : 'normal';
  try {
    // Check if email already exists
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      return res.status(403).json({ error: 'email already exists' });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert the new user into the database
    const newUser = await pool.query('INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role', [email, hashedPassword, name, role]);
    if(role === 'admin'){
      const { id } = newUser.rows[0];
      const insertedAdminUser = await pool.query('INSERT INTO admin_users (email, name, password) VALUES ($1, $2, $3) RETURNING \"id\"', [email, name, hashedPassword]);
      const adminUserId = insertedAdminUser.rows[0].id;
      await pool.query('UPDATE users SET admin_user_id = $1 WHERE id = $2', [adminUserId, id]);
    }
    res.json({ message: 'User created successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'something went wrong' });
  }
  
});


// Create a new code snippet
router.post('/codeSnippets', validateToken, async (req, res) => {
  // Extract the required fields from the request body
  const { title, code, tags, description } = req.body;
  // Get the authenticated user from the request
  const user = req.user;

  try {
    // Insert a new row into the code_snippets table
    const result = await pool.query('INSERT INTO code_snippets (title, code, tags, description, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *', [title, code, tags, description, user._id]);
    // Return the new code snippet as a response
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


// Get an existing code snippet
router.get('/codeSnippets/:id', validateToken, async (req, res) => {
  // Extract the id of the code snippet from the request parameters
  const codeSnippetId = req.params.id;
  // Get the authenticated user from the request
  const user = req.user;
  try {
    // Select the code snippet with the specified ID from the code_snippets table
    const result = await pool.query('SELECT * FROM code_snippets WHERE id = $1', [codeSnippetId]);
    const codeSnippet = result.rows[0];

    // If no code snippet was found or the authenticated user is not the creator of the code snippet, respond with a 404 error status and an error message
    if(user.role === 'admin'){
      res.json(codeSnippet);
    }
    else{
      if (!codeSnippet || codeSnippet.user_id !== user._id) {
        res.status(404).json({ error: 'Code snippet not found or unauthorized to edit' });
      // If the code snippet was found, respond with the code snippet as a JSON object
      } else {
        res.json(codeSnippet);
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


// Edit an existing code snippet
router.put('/codeSnippets/:id', validateToken, (req, res) => {
  // Extract the code snippet ID and user ID from the request
  const codeSnippetId = req.params.id;
  const userId = req.user._id;

  // Extract the updated title, code, tags, and description from the request body
  const { title, code, tags, description} = req.body;
  console.log(req.body)
  // Update the code snippet with the specified ID and user ID
  pool.query('UPDATE code_snippets SET title=$1, code=$2, description=$3, tags=$4, updated_at=$5 WHERE id=$6 RETURNING *', [title, code, description, tags, new Date(), codeSnippetId], (err, result) => {
    if (err) {
      // Handle any errors that occur during the update
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    } else if (result.rowCount === 0) {
      // Handle the case where the code snippet is not found or the user is not authorized to edit it
      res.status(404).json({ error: 'Code snippet not found or unauthorized to edit' });
    } else {
      // Return the updated code snippet
      res.json(result.rows[0]);
    }
  });
});


// Delete an existing code snippet
router.delete('/codeSnippets/:id', validateToken, (req, res) => {
  // Get the code snippet ID and user ID from the request parameters and user object
  const codeSnippetId = req.params.id;
  const userId = req.user._id;
  console.log(req.user)
  if(req.user.role === "admin"){
    pool.query('DELETE FROM code_snippets WHERE id = $1', [codeSnippetId], (err, result) => {
      if (err) {
        // If there is an error, return a 500 status code and an error message
        res.status(500).json({ error: 'Something went wrong' });
      } else if (result.rowCount === 0) {
        // If the code snippet doesn't exist or doesn't belong to the user, return a 404 status code and an error message
        res.status(404).json({ error: 'Code snippet not found or unauthorized to delete' });
      } else {
        // If the code snippet is successfully deleted, return a success message
        res.json({ message: 'Code snippet deleted successfully' });
      }
    });

  }
  else{
    // Use the pool to execute a DELETE query (isn't admin)
    pool.query('DELETE FROM code_snippets WHERE id = $1 AND user_id = $2', [codeSnippetId, userId], (err, result) => {
      if (err) {
        // If there is an error, return a 500 status code and an error message
        res.status(500).json({ error: 'Something went wrong' });
      } else if (result.rowCount === 0) {
        // If the code snippet doesn't exist or doesn't belong to the user, return a 404 status code and an error message
        res.status(404).json({ error: 'Code snippet not found or unauthorized to delete' });
      } else {
        // If the code snippet is successfully deleted, return a success message
        res.json({ message: 'Code snippet deleted successfully' });
      }
    });
  }


});


// Get all code snippets
router.get('/codesnippets', async (req, res) => {
  try {
    // Retrieve all code snippets from the database, including the user's name
    const snippets = await pool.query(`
      SELECT code_snippets.*, users.name AS user_name
      FROM code_snippets
      JOIN users ON code_snippets.user_id = users.id
    `);

    // Return the snippets as a JSON response
    res.json(snippets.rows);
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
    // Execute the SQL query to retrieve comments related to the specified code snippet
    const result = await pool.query(`
      SELECT comments.*, users.name 
      FROM comments 
      JOIN users ON comments.user_id = users.id 
      WHERE comments.code_snippet_id = $1
      ORDER BY comments.created_at DESC
    `, [snippetId]);

    // Extract the rows from the result object and send them as a JSON response
    const comments = result.rows;
    res.json({ comments });
  } catch (err) {
    // Log error to console and send 500 status code with a message
    console.log(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Handle POST request for adding a comment
router.post('/comments', validateToken, async (req, res) => {
  // Extract the comment text and associated code snippet ID from the request body
  const text = req.body.text;
  const codeSnippetId = req.body.codeSnippetId;
  // Create a new Comment object with the extracted data, including the ID of the authenticated user
  const userId = req.user._id;
  const queryText = 'INSERT INTO comments (text, user_id, code_snippet_id) VALUES ($1, $2, $3) RETURNING *';
  const queryValues = [text, userId, codeSnippetId];

  try {
    // Save the new comment to the database
    const result = await pool.query(queryText, queryValues);
    // Return the newly created comment object in the response
    res.json(result.rows[0]);
  } catch (error) {
    // If there was an error saving the comment, return a 500 error with an error message
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});



// Edit an existing comment
router.put('/comments/:id', validateToken, async (req, res) => {
  // Extract the comment ID and text from the request
  const commentId = req.params.id;
  const text = req.body.text;

  try {
    // Update the comment with the given ID
    const result = await pool.query(
      'UPDATE comments SET text = $1 WHERE id = $2 RETURNING *',
      [text, commentId]
    );

    // If no comment was found, return a 404 status code and an error message
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Comment not found or unauthorized to edit' });
    } else {
      // If the comment was successfully updated, return it in the response
      const comment = result.rows[0];
      res.json(comment);
    }
  } catch (err) {
    // If there was an error, return a 500 status code and an error message
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


// Delete an existing comment
router.delete('/comments/:id', validateToken, async (req, res) => {
  const commentId = req.params.id;
  const userId = req.user._id;
  if(req.user.role === admin){
    try {
      // Begin a transaction
      await pool.query('BEGIN');
      // Check if the comment belongs to the authenticated user
      const commentResult = await pool.query('SELECT * FROM comments WHERE id=$1', [commentId]);
      if (commentResult.rows.length === 0) {
        res.status(404).json({ error: 'Comment not found or unauthorized to delete' });
        return;
      }
      // Delete the comment
      await pool.query('DELETE FROM comments WHERE id=$1', [commentId]);
      // Commit the transaction
      await pool.query('COMMIT');
      // Send a success message
      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      // Rollback the transaction in case of error
      await pool.query('ROLLBACK'); 
      // Log error to console and send 500 status code with a message
      console.error(error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
  else{
    try {
      // Begin a transaction
      await pool.query('BEGIN');
      // Check if the comment belongs to the authenticated user
      const commentResult = await pool.query('SELECT * FROM comments WHERE id=$1 AND user_id=$2', [commentId, userId]);
      if (commentResult.rows.length === 0) {
        res.status(404).json({ error: 'Comment not found or unauthorized to delete' });
        return;
      }
      // Delete the comment
      await pool.query('DELETE FROM comments WHERE id=$1', [commentId]);
      // Commit the transaction
      await pool.query('COMMIT');
      // Send a success message
      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      // Rollback the transaction in case of error
      await pool.query('ROLLBACK'); 
      // Log error to console and send 500 status code with a message
      console.error(error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
});


// Upvote or cancel vote a post or comment
router.post('/votes', validateToken, async (req, res) => {
  const objectId = req.body.id;
  const userId = req.user._id;

  try {
    const existingVoteResult = await pool.query('SELECT * FROM votes WHERE user_id = $1 AND object_id = $2', [userId, objectId]);
    const existingVote = existingVoteResult.rows[0];
    if (existingVote) {
      await pool.query('DELETE FROM votes WHERE id = $1', [existingVote.id]);
      res.status(200).json({ isvoted: false });
    } else {
      await pool.query('INSERT INTO votes (user_id, object_id, is_voted) VALUES ($1, $2, $3)', [userId, objectId, true]);
      res.status(201).json({ isvoted: true });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Get the isvoted status of a post or comment
router.get('/votes/:id', validateToken, async (req, res) => {
  // Extract the ID of the post or comment from the URL parameters
  const objectId = req.params.id;
  // Extract the ID of the user from the 'req' object, which contains information about the request being made
  const userId = req.user._id;

  try {
    // Check if the user has already voted on the post or comment using a query to the 'votes' table
    const result = await pool.query('SELECT * FROM votes WHERE user_id = $1 AND object_id = $2', [userId, objectId]);
    // If the user has voted, return a JSON response with 'isvoted' set to true
    if (result.rowCount > 0) {
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
  const Id = req.params.id;
  console.log(Id)
  try {
    const { rows } = await pool.query(`SELECT COUNT(*) FROM votes WHERE object_id = $1 AND is_voted = true`, [Id]);
    const voteCount = rows[0].count;
    res.status(200).json({ count: voteCount });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET route to fetch user profile by user ID
router.get('/user-profile/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    // Query user profile from the user_profile table using the user_id
    const result = await pool.query(
      'SELECT * FROM user_profile WHERE user_id = $1',
      [user_id]
    );

    if (result.rows.length > 0) {
      // User profile exists, return the profile data
      res.status(200).json(result.rows[0]);
    } else {
      // User profile not found, create a default profile and return it
      const defaultProfile = {
        gender: 'Not specified',
        address: 'Not specified',
        major: 'Not specified',
      };

      const insertResult = await pool.query(
        'INSERT INTO user_profile (user_id, gender, address, major) VALUES ($1, $2, $3, $4) RETURNING *',
        [user_id, defaultProfile.gender, defaultProfile.address, defaultProfile.major]
      );

      res.status(200).json(insertResult.rows[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// PUT route to handle updating or creating user profile
router.put('/user-profile', async (req, res) => {
  try {
    const { user_id, gender, address, major } = req.body;

    // Check if user profile already exists
    const existingProfile = await pool.query(
      'SELECT * FROM user_profile WHERE user_id = $1',
      [user_id]
    );

    if (existingProfile.rows.length > 0) {
      // User profile exists, update the existing row
      const result = await pool.query(
        'UPDATE user_profile SET gender = $1, address = $2, major = $3 WHERE user_id = $4 RETURNING *',
        [gender, address, major, user_id]
      );
      res.status(200).json(result.rows[0]);
    } else {
      // User profile does not exist, create a new row
      const result = await pool.query(
        'INSERT INTO user_profile (user_id, gender, address, major) VALUES ($1, $2, $3, $4) RETURNING *',
        [user_id, gender, address, major]
      );
      res.status(201).json(result.rows[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
  const userId = req.body.user_id; 
  const image = req.file; 


  if (!image) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {

    const result = await pool.query(
      'INSERT INTO avatar (user_id, image_data, image_type) VALUES ($1, $2, $3) RETURNING *',
      [userId, image.buffer, image.mimetype]
    );

    return res.status(201).json({ message: 'Avatar uploaded successfully', avatar: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET route to fetch user avatar by user ID
router.get('/user-avatar/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    // Query user avatar from the avatar table using the user_id
    const result = await pool.query(
      'SELECT image_data, image_type FROM avatar WHERE user_id = $1',
      [user_id]
    );

    if (result.rows.length > 0) {
      // User avatar exists, return the avatar data as an image
      const avatar = result.rows[0];
      res.setHeader('Content-Type', avatar.image_type);
      res.status(200).send(avatar.image_data);
    } else {
      // User avatar not found
      res.status(404).json({ message: 'User avatar not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
var express = require('express');
var router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'testdb',
    password: '0923',
    port: 5432,
  });


router.get('/', function(req, res, next) {
    res.send('There are some useful api.');
});


router.get('/search', async (req, res, next) => {
    const content = req.query.content;
    try {
      const searchUsers = `SELECT name, email, role FROM users WHERE name ILIKE '%${content}%' OR email ILIKE '%${content}%'`;
      const searchSnippets = `SELECT * FROM code_snippets WHERE title ILIKE '%${content}%' OR description ILIKE '%${content}%' OR tags::text ILIKE '%${content}%'`;
  
      const usersResult = await pool.query(searchUsers);
      const snippetsResult = await pool.query(searchSnippets);
  
      const results = {
        users: usersResult.rows,
        snippets: snippetsResult.rows
      };
  
      res.json(results);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = router;
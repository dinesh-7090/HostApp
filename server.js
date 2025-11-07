const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔹 Replace these with your actual Azure PostgreSQL details
const pool = new Pool({
  user: 'welcome',
  host: 'cycle.postgres.database.azure.com',
  database: 'postgres',
  password: 'velcome123@',
  port: 5432,
  //ssl: true, // Azure requires SSL
  ssl: {
    rejectUnauthorized: false, // required for Azure SSL
  },
});

// Test database connection
pool.connect()
  .then(() => console.log('✅ Connected to Azure PostgreSQL'))
  .catch(err => console.error('❌ DB connection error:', err));

// Handle form submissions
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const query = 'INSERT INTO contact_form (name, email, message) VALUES ($1, $2, $3)';
    await pool.query(query, [name, email, message]);
    res.status(200).send('Form submitted successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving data');
  }
});

// Server.js

// Import necessary modules
const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();

// Middleware for parsing the request body (used in POST requests)
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB model for User (example)
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  password: String
}));

// Signup Route (handles POST requests to /signup)
app.post('/signup', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Validate passwords match
  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match');
  }

  try {
    // Hash the password before storing in DB
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)';
    await pool.query(query, [username, email, hashedPassword]);

    res.status(201).send('User registered successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registering user');
  }
});

// Login Route (handles POST requests to /login)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query to find user by email
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(400).send('Invalid credentials');
    }

    const user = result.rows[0];

    // Compare the hashed password with the one in the DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    // Generate a JWT token for the user
    const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token: token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error logging in');
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

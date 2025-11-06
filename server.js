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

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

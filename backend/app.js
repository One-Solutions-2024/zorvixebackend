// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable SSL always if connecting to an external database like Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Initialize the database: create tables if they don't exist already
const initializeDatabase = async () => {
  try {
    // Create contacts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        subject TEXT,
        message TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create newsletters table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS newsletters (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error.message);
  }
};

initializeDatabase();

// Submit a contact
app.post('/submit-contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  try {
    const query = `
      INSERT INTO contacts (name, email, subject, message, timestamp)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;
    const result = await pool.query(query, [name, email, subject, message]);
    res.json({ success: true, contact: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit a newsletter subscription
app.post('/submit-newsletter', async (req, res) => {
  const { email } = req.body;
  try {
    const query = `
      INSERT INTO newsletters (email, timestamp)
      VALUES ($1, NOW())
      RETURNING *;
    `;
    const result = await pool.query(query, [email]);
    res.json({ success: true, subscription: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Retrieve all data
app.get('/get-data', async (req, res) => {
  try {
    const contactsResult = await pool.query('SELECT * FROM contacts ORDER BY timestamp DESC;');
    const newslettersResult = await pool.query('SELECT * FROM newsletters ORDER BY timestamp DESC;');
    res.json({
      contacts: contactsResult.rows,
      newsletters: newslettersResult.rows,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

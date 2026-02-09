const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

let db;

/* ---------------- DB CONNECTION ---------------- */
const connectWithRetry = async (retries = 10, delay = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10
      });

      await pool.query('SELECT 1');
      console.log(`✅ MySQL connected (Attempt ${attempt})`);
      return pool;

    } catch (err) {
      console.error(`❌ DB connection failed (${attempt}/${retries}): ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, delay));
    }
  }
};

/* ---------------- ENSURE TABLES ---------------- */
const ensureTables = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS student (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      roll_number VARCHAR(100),
      class VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS teacher (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      subject VARCHAR(255),
      class VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Tables ensured');
};

/* ---------------- HEALTH CHECK ---------------- */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'backend',
    uptime: process.uptime()
  });
});

/* ---------------- STUDENT ROUTES ---------------- */
app.get('/api/student', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM student');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

app.post('/api/addstudent', async (req, res) => {
  try {
    const { name, rollNo, class: className } = req.body;

    await db.query(
      'INSERT INTO student (name, roll_number, class) VALUES (?, ?, ?)',
      [name, rollNo, className]
    );

    res.json({ message: 'Student added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add student' });
  }
});

app.delete('/api/student/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM student WHERE id = ?', [req.params.id]);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

/* ---------------- TEACHER ROUTES ---------------- */
app.get('/api/teacher', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM teacher');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

app.post('/api/addteacher', async (req, res) => {
  try {
    const { name, subject, class: className } = req.body;

    await db.query(
      'INSERT INTO teacher (name, subject, class) VALUES (?, ?, ?)',
      [name, subject, className]
    );

    res.json({ message: 'Teacher added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add teacher' });
  }
});

app.delete('/api/teacher/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM teacher WHERE id = ?', [req.params.id]);
    res.json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
});

/* ---------------- START SERVER ---------------- */
(async () => {
  try {
    db = await connectWithRetry();
    await ensureTables();

    app.listen(3500, '0.0.0.0', () => {
      console.log('🚀 Backend running on port 3500');
    });

    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down...');
      await db.end();
      process.exit(0);
    });

  } catch (err) {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
  }
})();

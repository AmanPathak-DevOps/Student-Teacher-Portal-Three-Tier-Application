const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

let db;

// 🔁 MySQL Connection with Retry Logic
const connectWithRetry = async (retries = 10, delay = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const pool = await mysql.createPool({
        host: process.env.host,
        user: process.env.user,
        password: process.env.password,
        database: process.env.database,
        connectionLimit: 10,
        ssl: { rejectUnauthorized: false }
      });
      console.log(`✅ Connected to MySQL (Attempt ${attempt})`);
      return pool;
    } catch (error) {
      console.error(`❌ MySQL connection failed (Attempt ${attempt}/${retries}):`, error.message);
      if (attempt === retries) throw error;
      console.log(`Retrying in ${delay / 1000}s...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

// 🧱 Ensure Required Tables Exist
const ensureTables = async (db) => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS student (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        roll_number VARCHAR(255),
        class VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS teacher (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        subject VARCHAR(255),
        class VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Tables ensured successfully (student, teacher)");
  } catch (error) {
    console.error("❌ Error ensuring tables:", error);
    throw error;
  }
};

// 🌐 Initialize Database Connection Before Starting Server
(async () => {
  try {
    db = await connectWithRetry();
    await ensureTables(db);

    // 💥 Global unhandled promise rejection handler
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log("\n🛑 Closing MySQL pool...");
      await db.end();
      process.exit(0);
    });

    // ---- Utility Functions ----
    const getLastStudentID = async () => {
      const [result] = await db.query('SELECT MAX(id) AS lastID FROM student');
      return result[0].lastID || 0;
    };

    const getLastTeacherID = async () => {
      const [result] = await db.query('SELECT MAX(id) AS lastID FROM teacher');
      return result[0].lastID || 0;
    };

    // ---- Health Check Routes ----

    // Basic health (for ALB target group)
    app.get('/health', (req, res) => {
      return res.status(200).json({
        status: 'ok',
        service: 'backend',
        uptime: process.uptime()
      });
    });

    // DB health (for debugging only)
    app.get('/health/db', async (req, res) => {
      try {
        const [rows] = await db.query('SELECT 1 as db_up');

        return res.status(200).json({
          status: 'ok',
          database: 'connected',
          host: process.env.host,
          database_name: process.env.database,
          result: rows[0]
        });

      } catch (error) {
        console.error('DB health check failed:', error.message);

        return res.status(500).json({
          status: 'error',
          database: 'down',
          error: error.message
        });
      }
    });

    // ---- Routes ----
    app.get('/', async (req, res) => {
      try {
        const [data] = await db.query("SELECT * FROM student");
        return res.json({ message: "From Backend!!!", studentData: data });
      } catch (error) {
        console.error('Error fetching student data:', error);
        return res.status(500).json({ error: 'Error fetching student data' });
      }
    });

    app.get('/student', async (req, res) => {
      try {
        const [data] = await db.query("SELECT * FROM student");
        return res.json(data);
      } catch (error) {
        console.error('Error fetching students:', error);
        return res.status(500).json({ error: 'Failed to fetch students' });
      }
    });

    app.get('/teacher', async (req, res) => {
      try {
        const [data] = await db.query("SELECT * FROM teacher");
        return res.json(data);
      } catch (error) {
        console.error('Error fetching teachers:', error);
        return res.status(500).json({ error: 'Failed to fetch teachers' });
      }
    });

    app.post('/addstudent', async (req, res) => {
      try {
        const lastStudentID = await getLastStudentID();
        const nextStudentID = lastStudentID + 1;
        const { name, rollNo, class: className } = req.body;

        await db.query(
          `INSERT INTO student (id, name, roll_number, class) VALUES (?, ?, ?, ?)`,
          [nextStudentID, name, rollNo, className]
        );
        return res.json({ message: 'Student added successfully' });
      } catch (error) {
        console.error('Error adding student:', error);
        return res.status(500).json({ error: 'Error inserting student data' });
      }
    });

    app.post('/addteacher', async (req, res) => {
      try {
        const lastTeacherID = await getLastTeacherID();
        const nextTeacherID = lastTeacherID + 1;
        const { name, subject, class: className } = req.body;

        await db.query(
          `INSERT INTO teacher (id, name, subject, class) VALUES (?, ?, ?, ?)`,
          [nextTeacherID, name, subject, className]
        );
        return res.json({ message: 'Teacher added successfully' });
      } catch (error) {
        console.error('Error adding teacher:', error);
        return res.status(500).json({ error: 'Error inserting teacher data' });
      }
    });

    app.delete('/student/:id', async (req, res) => {
      const studentId = req.params.id;
      try {
        await db.query('DELETE FROM student WHERE id = ?', [studentId]);
        const [rows] = await db.query('SELECT id FROM student ORDER BY id');
        await Promise.all(
          rows.map((row, index) =>
            db.query('UPDATE student SET id = ? WHERE id = ?', [index + 1, row.id])
          )
        );
        return res.json({ message: 'Student deleted successfully' });
      } catch (error) {
        console.error('Error deleting student:', error);
        return res.status(500).json({ error: 'Error deleting student' });
      }
    });

    app.delete('/teacher/:id', async (req, res) => {
      const teacherId = req.params.id;
      try {
        await db.query('DELETE FROM teacher WHERE id = ?', [teacherId]);
        const [rows] = await db.query('SELECT id FROM teacher ORDER BY id');
        await Promise.all(
          rows.map((row, index) =>
            db.query('UPDATE teacher SET id = ? WHERE id = ?', [index + 1, row.id])
          )
        );
        return res.json({ message: 'Teacher deleted successfully' });
      } catch (error) {
        console.error('Error deleting teacher:', error);
        return res.status(500).json({ error: 'Error deleting teacher' });
      }
    });

    // ---- Start Server After DB Ready ----
    app.listen(3500, () => {
      console.log("🚀 Server running on port 3500");
    });

  } catch (error) {
    console.error("❌ Fatal: Could not start server. DB connection failed.", error);
    process.exit(1);
  }
})();


import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Database connection pool (lazy initialized)
let pool: mysql.Pool | null = null;

function getDb() {
  if (!pool) {
    const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;
    if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
      throw new Error("Missing MySQL configuration. Please set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in Secrets/Environment Variables.");
    }
    
    if (DB_HOST === 'localhost' || DB_HOST === '127.0.0.1') {
      throw new Error(
        "DB_HOST cannot be 'localhost' because the app is running on AI Studio. " +
        "To connect to HostGator, you must use your HostGator Server IP or Domain (e.g., br123.hostgator.com.br), " +
        "and you MUST enable 'Remote MySQL' in your HostGator cPanel by adding '%' as an allowed host."
      );
    }

    pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: parseInt(DB_PORT || "3306"),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

// Ensure tables exist
async function initDb() {
  const db = getDb();
  await db.query(`
    CREATE TABLE IF NOT EXISTS books (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      genre VARCHAR(100),
      publication_year INT,
      condition_status VARCHAR(50),
      tags JSON,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS book_stages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      book_id INT NOT NULL,
      stage_name VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'Pendente',
      start_date DATE,
      end_date DATE,
      responsible VARCHAR(100),
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    INSERT IGNORE INTO users (username, password) VALUES ('admin', 'admin123')
  `);
}

// API Routes

app.get("/api/health", async (req, res) => {
  try {
    const { DB_HOST, DB_NAME } = process.env;
    if (!DB_HOST || !DB_NAME) {
      return res.status(500).json({ status: "error", message: "Database configuration missing" });
    }
    const db = getDb();
    await db.query("SELECT 1"); // Test connection
    res.json({ status: "ok", message: "Connected to MySQL" });
  } catch (error: any) {
    console.error("Health check error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Initialize database explicitly (can be called from frontend)
app.post("/api/init-db", async (req, res) => {
  try {
    await initDb();
    res.json({ success: true, message: "Database tables initialized." });
  } catch (error: any) {
    console.error("Error initializing DB:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const db = getDb();
    const { username, password } = req.body;
    const [users] = await db.query<mysql.RowDataPacket[]>("SELECT * FROM users WHERE username = ? AND password = ?", [username, password]);
    if (users.length > 0) {
      res.json({ success: true, user: { id: users[0].id, username: users[0].username } });
    } else {
      res.status(401).json({ error: "Credenciais inválidas" });
    }
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes("doesn't exist")) {
      res.status(500).json({ error: "O banco de dados ainda não possui as tabelas necessárias: " + error.message, needsInit: true });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.get("/api/books", async (req, res) => {
  try {
    const db = getDb();
    const [rows] = await db.query("SELECT * FROM books ORDER BY created_at DESC");
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/books", async (req, res) => {
  try {
    const db = getDb();
    const { title, author, genre, publication_year, condition_status, tags, notes } = req.body;
    
    // Convert tags to JSON string if it's an array for proper insertion, though mysql2 handles objects for JSON columns generally
    const tagsJson = JSON.stringify(tags || []);

    const [result] = await db.query<mysql.ResultSetHeader>(
      `INSERT INTO books (title, author, genre, publication_year, condition_status, tags, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, author, genre, publication_year, condition_status, tagsJson, notes]
    );

    // Initialize default stages for the new book
    const defaultStages = [
      "Manuscrito", "Layout", "Projeto Gráfico", "Ilustrações", 
      "Diagramação", "Revisão", "Análise Técnica", "Impressão", "Manual do professor"
    ];

    for (const stage of defaultStages) {
      await db.query(
        "INSERT INTO book_stages (book_id, stage_name, status) VALUES (?, ?, ?)",
        [result.insertId, stage, "Pendente"]
      );
    }

    res.json({ id: result.insertId, ...req.body });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/books/:id", async (req, res) => {
  try {
    const db = getDb();
    const [books] = await db.query<mysql.RowDataPacket[]>("SELECT * FROM books WHERE id = ?", [req.params.id]);
    if (books.length === 0) return res.status(404).json({ error: "Book not found" });
    
    const [stages] = await db.query("SELECT * FROM book_stages WHERE book_id = ? ORDER BY id ASC", [req.params.id]);
    
    res.json({ ...books[0], stages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/books/:id", async (req, res) => {
  try {
    const db = getDb();
    const { title, author, genre, publication_year, condition_status, tags, notes } = req.body;
    const tagsJson = JSON.stringify(tags || []);

    await db.query(
      `UPDATE books 
       SET title = ?, author = ?, genre = ?, publication_year = ?, condition_status = ?, tags = ?, notes = ? 
       WHERE id = ?`,
      [title, author, genre, publication_year, condition_status, tagsJson, notes, req.params.id]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/books/:id", async (req, res) => {
  try {
    const db = getDb();
    await db.query("DELETE FROM books WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/stages/:id", async (req, res) => {
  try {
    const db = getDb();
    const { status, start_date, end_date, responsible } = req.body;

    await db.query(
      `UPDATE book_stages 
       SET status = ?, start_date = ?, end_date = ?, responsible = ? 
       WHERE id = ?`,
      [status, start_date || null, end_date || null, responsible, req.params.id]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();

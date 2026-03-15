const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "cloudtasks",
  user: process.env.DB_USER || "clouduser",
  password: process.env.DB_PASSWORD || "cloudpass"
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'todo',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const result = await pool.query("SELECT COUNT(*) FROM tasks");
  if (Number(result.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO tasks (title, status)
      VALUES
      ('Prepare Docker images', 'done'),
      ('Deploy services on Kubernetes', 'in-progress'),
      ('Finalize report screenshots', 'todo')
    `);
  }
}

module.exports = { pool, initDb };

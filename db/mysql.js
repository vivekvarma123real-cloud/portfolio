const mysql = require("mysql2/promise");
const seedData = require("./seedData");

let pool;

async function connect() {
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "riya_portfolio",
    waitForConnections: true,
    connectionLimit: 10
  });
}

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      image VARCHAR(500) DEFAULT '',
      skills JSON NOT NULL,
      github_url VARCHAR(500) DEFAULT '#',
      live_url VARCHAR(500) DEFAULT '#',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [rows] = await pool.query("SELECT COUNT(*) AS count FROM projects");
  if (rows[0].count === 0) {
    for (const project of seedData) {
      await pool.query(
        `INSERT INTO projects (title, description, image, skills, github_url, live_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          project.title,
          project.description,
          project.image,
          JSON.stringify(project.skills),
          project.githubUrl,
          project.liveUrl
        ]
      );
    }
  }
}

function mapRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image: row.image,
    skills: typeof row.skills === "string" ? JSON.parse(row.skills) : row.skills,
    githubUrl: row.github_url,
    liveUrl: row.live_url
  };
}

async function getProjects() {
  const [rows] = await pool.query("SELECT * FROM projects ORDER BY id ASC");
  return rows.map(mapRow);
}

async function createProject(data) {
  const [result] = await pool.query(
    `INSERT INTO projects (title, description, image, skills, github_url, live_url)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.title,
      data.description,
      data.image || "",
      JSON.stringify(data.skills || []),
      data.githubUrl || "#",
      data.liveUrl || "#"
    ]
  );

  const [rows] = await pool.query("SELECT * FROM projects WHERE id = ?", [result.insertId]);
  return mapRow(rows[0]);
}

module.exports = { connect, init, getProjects, createProject };

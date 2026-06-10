const { Pool } = require("pg");
const seedData = require("./seedData");

let pool;

async function connect() {
  pool = new Pool({
    host: process.env.PG_HOST || "127.0.0.1",
    port: Number(process.env.PG_PORT) || 5432,
    user: process.env.PG_USER || "postgres",
    password: process.env.PG_PASSWORD || "",
    database: process.env.PG_DATABASE || "riya_portfolio"
  });
  await pool.query("SELECT 1");
}

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      image VARCHAR(500) DEFAULT '',
      skills JSONB NOT NULL DEFAULT '[]',
      github_url VARCHAR(500) DEFAULT '#',
      live_url VARCHAR(500) DEFAULT '#',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM projects");
  if (rows[0].count === 0) {
    for (const project of seedData) {
      await pool.query(
        `INSERT INTO projects (title, description, image, skills, github_url, live_url)
         VALUES ($1, $2, $3, $4, $5, $6)`,
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
    skills: row.skills,
    githubUrl: row.github_url,
    liveUrl: row.live_url
  };
}

async function getProjects() {
  const { rows } = await pool.query("SELECT * FROM projects ORDER BY id ASC");
  return rows.map(mapRow);
}

async function createProject(data) {
  const { rows } = await pool.query(
    `INSERT INTO projects (title, description, image, skills, github_url, live_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      data.title,
      data.description,
      data.image || "",
      JSON.stringify(data.skills || []),
      data.githubUrl || "#",
      data.liveUrl || "#"
    ]
  );
  return mapRow(rows[0]);
}

module.exports = { connect, init, getProjects, createProject };

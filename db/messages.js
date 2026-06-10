const fs = require("fs").promises;
const path = require("path");

const messagesFile = path.join(__dirname, "..", "data", "messages.json");

async function ensureFile() {
  try {
    await fs.access(messagesFile);
  } catch {
    await fs.mkdir(path.dirname(messagesFile), { recursive: true });
    await fs.writeFile(messagesFile, JSON.stringify([], null, 2));
  }
}

async function saveMessage({ name, email, message }) {
  await ensureFile();
  const data = await fs.readFile(messagesFile, "utf8");
  const messages = JSON.parse(data);

  const entry = {
    id: messages.length ? Math.max(...messages.map(m => m.id)) + 1 : 1,
    name,
    email,
    message,
    createdAt: new Date().toISOString()
  };

  messages.push(entry);
  await fs.writeFile(messagesFile, JSON.stringify(messages, null, 2));
  return entry;
}

module.exports = { saveMessage };

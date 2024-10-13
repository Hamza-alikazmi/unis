import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const app = express();
const adapter = new JSONFile('db.json');
const db = new Low(adapter, { links: [] });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize the database with default values if empty
async function initDb() {
  await db.read();
  if (!db.data || !db.data.links) {
    db.data = { links: [] };
    await db.write();
  }
}

// Route to handle form submission and save the link in db.json
app.post('/api/saveLink', async (req, res) => {
  await initDb(); // Ensure the DB is initialized
  const { linkName, linkUrl } = req.body;

  db.data.links.push({ name: linkName, url: linkUrl });
  await db.write();

  res.json({
    success: true,
    data: { name: linkName, url: linkUrl }
  });
});

// Route to fetch the stored links
app.get('/api/links', async (req, res) => {
  await initDb();

  if (db.data.links.length > 0) {
    res.json({
      success: true,
      data: db.data.links
    });
  } else {
    res.json({
      success: false,
      message: 'No links found'
    });
  }
});

// Route to handle removing a link from the database
app.delete('/api/removeLink', async (req, res) => {
  const { url } = req.body;
  await initDb();

  if (db.data.links) {
    db.data.links = db.data.links.filter(link => link.url !== url);
    await db.write();
    res.json({ success: true, message: 'Link removed successfully' });
  } else {
    res.status(400).json({ success: false, message: 'No links found' });
  }
});

// Route to clear all links
app.delete('/api/clearLinks', async (req, res) => {
  await initDb();
  db.data.links = [];
  await db.write();

  res.json({ success: true, message: 'All links deleted' });
});

// Export the Express app for Vercel to handle
export default app;

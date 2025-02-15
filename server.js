import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// Set up lowdb with JSONFile adapter
const adapter = new JSONFile(path.join(process.cwd(), 'db.json'));
const db = new Low(adapter, { links: [] }); // Default data with an empty array for links

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(process.cwd(), 'public')));

// Route to serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Initialize the database with default values if empty
async function initDb() {
  await db.read();
  if (!db.data || !db.data.links) {
    db.data = { links: [] }; // Initialize with an empty array for links
    await db.write(); // Write the initial structure to db.json
  }
}

// Route to handle form submission and save the link in db.json
app.post('/saveLink', async (req, res) => {
  const { linkName, linkUrl } = req.body;

  if (!linkName || !linkUrl) {
    return res.status(400).json({ success: false, message: 'Link name and URL are required' });
  }

  try {
    // Using `db.data.links` instead of `db.get('links')`
    db.data.links.push({ name: linkName, url: linkUrl });
    await db.write(); // Write to the database after adding the link
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving link:', error);
    res.status(500).json({ success: false, message: 'Error saving link' });
  }
});

// Route to fetch the stored links
app.get('/links', async (req, res) => {
  await db.read();
  if (db.data && db.data.links && db.data.links.length > 0) {
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
app.delete('/removeLink', async (req, res) => {
  const { url } = req.body;
  await db.read();
  if (db.data && db.data.links) {
    db.data.links = db.data.links.filter(link => link.url !== url);
    await db.write();
    res.json({ success: true, message: 'Link removed successfully' });
  } else {
    res.status(400).json({ success: false, message: 'No links found' });
  }
});

// Route to clear all links
app.delete('/clearLinks', async (req, res) => {
  await db.read();
  if (db.data && db.data.links) {
    db.data.links = [];
    await db.write();
    res.status(200).json({ success: true, message: 'All links deleted' });
  } else {
    res.status(400).json({ success: false, message: 'No links to clear' });
  }
});

// Start the server
app.listen(port, async () => {
  await initDb();
  console.log(`Server running at http://localhost:${port}`);
});

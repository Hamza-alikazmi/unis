import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';

const app = express();

// Set up lowdb with JSONFile adapter
const adapter = new JSONFile('db.json');  // This is where the data will be saved
const db = new Low(adapter, {}); // Pass an empty object as the default data

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Initialize the database with default values if empty
async function initDb() {
  try {
    await db.read();
    if (!adapter.fileExists) {
      db.data = { links: [] }; // Initialize with an empty array for links
      await db.write(); // Write the initial structure to the db.json
    } else if (!db.data) {
      db.data = { links: [] }; // Initialize with an empty array for links
      await db.write(); // Write the initial structure to the db.json
    } else if (!db.data.links) {
      db.data.links = []; // Initialize links array if it doesn't exist
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for other routes (if needed)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to handle form submission and save the link in db.json
app.post('/api/saveLink', async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  const { linkName, linkUrl } = req.body;

  await db.read();  // Read the latest data from db.json
  if (!adapter.fileExists) {
    db.data = { links: [] }; // Initialize with an empty array for links
  }
  if (!db.data) {
    db.data = { links: [] }; // Initialize with an empty array for links
  }
  if (!db.data.links) {
    db.data.links = []; // Initialize links array if it doesn't exist
  }
  db.data.links.push({ name: linkName, url: linkUrl });  // Add the new link to the array
  await db.write();  // Write the updated data back to db.json

  res.json({
    success: true,
    data: { name: linkName, url: linkUrl }
  });
});

// Route to fetch the stored links
app.get('/api/links', async (req, res) => {
  await db.read();  // Read the latest data from db.json

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

// Route to remove a link by its URL
app.delete('/api/removeLink', async (req, res) => {
  const { url } = req.body; // Get the URL from the request body

  await db.read(); // Read the latest data from db.json

  if (db.data && db.data.links) {
    // Filter out the link to be removed
    db.data.links = db.data.links.filter(link => link.url !== url);
    await db.write(); // Write the updated data back to db.json

    res.json({
      success: true,
      message: 'Link removed successfully'
    });
  } else {
    res.json({
      success: false,
      message: 'Link not found'
    });
  }
});

// Export the app as a Vercel function
export default app;

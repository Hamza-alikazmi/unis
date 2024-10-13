import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const app = express();
const port = process.env.PORT || 3000; // Use the Vercel port or default to 3000

// Set up lowdb with JSONFile adapter
const adapter = new JSONFile('db.json');  // This is where the data will be saved
const db = new Low(adapter, {}); // Pass an empty object as the default data

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Route to serve the main HTML page for the root URL
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`); // Make sure to adjust the path if needed
});


// Initialize the database with default values if empty
async function initDb() {
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
}

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Route to handle form submission and save the link in db.json
app.post('/api/saveLink', async (req, res) => { // Updated route
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
app.get('/api/links', async (req, res) => { // Updated route
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

// Start the server
app.listen(port, async () => {
  await initDb();  // Initialize the database
  console.log(`Server running at http://localhost:${port}`);
});

// Route to handle removing a link from the database
app.delete('/api/removeLink', async (req, res) => { // Updated route
  const { url } = req.body; // Extract the URL from the request body
  await db.read(); // Read the latest data from db.json

  if (db.data && db.data.links) {
    // Filter out the link to be removed
    db.data.links = db.data.links.filter(link => link.url !== url);
    await db.write(); // Write the updated data back to db.json
    res.json({ success: true, message: 'Link removed successfully' });
  } else {
    res.status(400).json({ success: false, message: 'No links found' });
  }
});

// Route to clear all links
app.delete('/api/clearLinks', async (req, res) => { // Updated route
  await db.read(); // Read the latest data from db.json
  if (db.data && db.data.links) {
    db.data.links = []; // Clear the links array
    await db.write(); // Write the updated data back to db.json
    res.status(200).json({ success: true, message: 'All links deleted' });
  } else {
    res.status(400).json({ success: false, message: 'No links to clear' });
  }
});

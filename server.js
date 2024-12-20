import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path'; // Import path for handling file paths

const app = express();
const port = process.env.PORT || 3000; // Use the Vercel port or default to 3000

// Set up lowdb with JSONFile adapter
const adapter = new JSONFile(path.join(process.cwd(), 'db.json')); // This is where the data will be saved
const db = new Low(adapter, {}); // Pass an empty object as the default data

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(process.cwd(), 'public'))); // Use path.join for static files

// Route to serve the main HTML page for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html')); // Use path.join for cross-platform compatibility
});

// Initialize the database with default values if empty
async function initDb() {
  await db.read();
  if (!db.data || !db.data.links) {
    db.data = { links: [] }; // Initialize with an empty array for links
    await db.write(); // Write the initial structure to the db.json
  }
}

// Route to handle form submission and save the link in db.json
app.post('/saveLink', async (req, res) => {
    const { linkName, linkUrl } = req.body;
    
    if (!linkName || !linkUrl) {
        return res.status(400).json({ success: false, message: 'Link name and URL are required' });
    }

    try {
        // Assuming lowdb is being used for storage
        const db = getDb(); // Function to get your database instance
        await db.get('links').push({ name: linkName, url: linkUrl }).write();

        res.json({ success: true });
    } catch (error) {
        console.error('Error saving link:', error);
        res.status(500).json({ success: false, message: 'Error saving link' });
    }
});

// Route to fetch the stored links
app.get('/links', async (req, res) => {
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

// Route to handle removing a link from the database
app.delete('/removeLink', async (req, res) => {
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
app.delete('/clearLinks', async (req, res) => {
  await db.read(); // Read the latest data from db.json
  if (db.data && db.data.links) {
    db.data.links = []; // Clear the links array
    await db.write(); // Write the updated data back to db.json
    res.status(200).json({ success: true, message: 'All links deleted' });
  } else {
    res.status(400).json({ success: false, message: 'No links to clear' });
  }
});

// Start the server
app.listen(port, async () => {
  await initDb();  // Initialize the database
  console.log(`Server running at http://localhost:${port}`);
});

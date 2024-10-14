@@ -3,6 +3,7 @@ import bodyParser from 'body-parser';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path'; // Import path for handling file paths

const app = express();
const port = process.env.PORT || 3000; // Use the Vercel port or default to 3000
@@ -16,6 +17,14 @@ app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));
// Route to serve the main HTML page for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Use path.join for cross-platform compatibility
});
// Initialize the database with default values if empty
async function initDb() {
  await db.read();
@@ -30,9 +39,6 @@ async function initDb() {
  }
}

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));
// Route to handle form submission and save the link in db.json
app.post('/saveLink', async (req, res) => {
  if (!req.body) {
@@ -41,15 +47,9 @@ app.post('/saveLink', async (req, res) => {
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

@@ -76,13 +76,6 @@ app.get('/links', async (req, res) => {
  }
});

// Start the server
app.listen(port, async () => {
  await initDb();  // Initialize the database
  console.log(`Server running at http://localhost:${port}`);
});
// Route to handle removing a link from the database
app.delete('/removeLink', async (req, res) => {
  const { url } = req.body; // Extract the URL from the request body
@@ -98,40 +91,20 @@ app.delete('/removeLink', async (req, res) => {
  }
});

// Route to remove a link by its URL
app.delete('/removeLink', async (req, res) => {
  const { url } = req.body; // Get the URL from the request body
// Route to clear all links
app.delete('/clearLinks', async (req, res) => {
  await db.read(); // Read the latest data from db.json
  if (db.data && db.data.links) {
    // Filter out the link to be removed
    db.data.links = db.data.links.filter(link => link.url !== url);
    db.data.links = []; // Clear the links array
    await db.write(); // Write the updated data back to db.json
    res.json({
      success: true,
      message: 'Link removed successfully'
    });
    res.status(200).json({ success: true, message: 'All links deleted' });
  } else {
    res.json({
      success: false,
      message: 'Link not found'
    });
    res.status(400).json({ success: false, message: 'No links to clear' });
  }
});

// Route to clear all links
// router.delete('/clearLinks', (req, res) => {
//   try {
//     db.get('links').remove().write(); // Clears the 'links' array in the database
//     res.status(200).json({ success: true, message: 'All links deleted' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Failed to delete links' });
//   }
// });
// module.exports = router;
// Start the server
app.listen(port, async () => {
  await initDb();  // Initialize the database
  console.log(`Server running at http://localhost:${port}`);
});
0 commit comments
Comments
0

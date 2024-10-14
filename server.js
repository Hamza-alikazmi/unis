import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://63kazmiedu:KU2JknuE0ZjJLlNV@cluster0.cqwyc.mongodb.net/';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define the Link schema
const linkSchema = new mongoose.Schema({
  name: String,
  url: String
});

// Create the Link model
const Link = mongoose.model('Link', linkSchema);

// Serve static files from the public directory
app.use(express.static('public'));

// Fallback to index.html for other routes (if needed)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to handle form submission and save the link in MongoDB
app.post('/saveLink', async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  const { linkName, linkUrl } = req.body;

  try {
    const newLink = new Link({ name: linkName, url: linkUrl });
    await newLink.save(); // Save to MongoDB

    res.json({
      success: true,
      data: { name: linkName, url: linkUrl }
    });
  } catch (error) {
    console.error('Error saving link:', error);
    res.status(500).json({ success: false, message: 'Failed to save link' });
  }
});

// Route to fetch the stored links from MongoDB
app.get('/links', async (req, res) => {
  try {
    const links = await Link.find(); // Fetch all links from MongoDB

    if (links.length > 0) {
      res.json({
        success: true,
        data: links
      });
    } else {
      res.json({
        success: false,
        message: 'No links found'
      });
    }
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({ success: false, message: 'Failed to load links' });
  }
});

// Route to remove a link by its URL from MongoDB
app.delete('/removeLink', async (req, res) => {
  const { url } = req.body;

  try {
    const result = await Link.deleteOne({ url: url });

    if (result.deletedCount > 0) {
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
  } catch (error) {
    console.error('Error removing link:', error);
    res.status(500).json({ success: false, message: 'Failed to remove link' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

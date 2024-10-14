import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function initDb() {
  await db.read();
  if (!adapter.fileExists) {
    db.data = { links: [] };
  }
  if (!db.data) {
    db.data = { links: [] };
  }
  if (!db.data.links) {
    db.data.links = [];
  }
}

app.post('/saveLink', async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ success: false, message: 'No request body' });
  }

  const { linkName, linkUrl } = req.body;

  await db.read();
  if (!adapter.fileExists) {
    db.data = { links: [] };
  }
  if (!db.data) {
    db.data = { links: [] };
  }
  if (!db.data.links) {
    db.data.links = [];
  }
  db.data.links.push({ name: linkName, url: linkUrl });
  await db.write();

  res.json({ success: true, message: 'Link saved successfully' });
});

app.get('/links', async (req, res) => {
  await db.read();
  if (db.data && db.data.links) {
    res.json(db.data.links);
  } else {
    res.status(404).json({ success: false, message: 'No links found' });
  }
});

app.delete('/removeLink', async (req, res) => {
  const { url } = req.body;

  await db.read();
  if (db.data && db.data.links) {
    db.data.links = db.data.links.filter(link => link.url !== url);
    await db.write();
    res.json({ success: true, message: 'Link removed successfully' });
  } else {
    res.status(404).json({ success: false, message: 'Link not found' });
  }
});

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

export default async function handler(req, res) {
  await initDb();
  app(req, res);
}

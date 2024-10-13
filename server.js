app.delete('/removeLink', async (req, res) => {
  try {
    const { url } = req.body; // Extract the URL from the request body
    await db.read(); // Read the latest data from db.json

    if (db.data && db.data.links) {
      db.data.links = db.data.links.filter(link => link.url !== url);
      await db.write(); // Write the updated data back to db.json
      res.json({ success: true, message: 'Link removed successfully' });
    } else {
      res.status(400).json({ success: false, message: 'No links found' });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

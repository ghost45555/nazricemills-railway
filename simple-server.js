const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const staticPath = path.join(__dirname, 'dist/ricemill/browser');

console.log('Static path:', staticPath);
console.log('Port:', port);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve static files
app.use(express.static(staticPath));

// All routes serve index.html
app.get('*', (req, res) => {
  console.log('Request:', req.url);
  res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
}); 
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(value => value.trim()) : true }));
app.use(express.json());

// Main API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'JobFlow AI Backend is running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`JobFlow AI backend running on port ${PORT}`);
  console.log(process.env.GROQ_API_KEY ? 'AI provider: Groq' : 'AI provider: NOT CONFIGURED (add GROQ_API_KEY)');
});

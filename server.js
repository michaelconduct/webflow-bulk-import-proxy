// Webflow CMS Bulk Import Backend Proxy
// Simple Express server to handle API requests without CORS issues
// Deploy to Heroku, Vercel, or any Node.js hosting

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Create CMS item endpoint
app.post('/api/create-item', async (req, res) => {
  try {
    const { apiToken, collectionId, itemData } = req.body;

    if (!apiToken || !collectionId || !itemData) {
      return res.status(400).json({ 
        error: 'Missing required fields: apiToken, collectionId, itemData' 
      });
    }

    const response = await fetch(
      `https://api.webflow.com/v1/collections/${collectionId}/items`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ fields: itemData }),
      }
    );

    const data = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Webflow API Error: ${data}` 
      });
    }

    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Package.json dependencies:
// {
//   "name": "webflow-bulk-import-proxy",
//   "version": "1.0.0",
//   "main": "server.js",
//   "dependencies": {
//     "express": "^4.18.2",
//     "cors": "^2.8.5",
//     "dotenv": "^16.0.3"
//   }
// }

// Deployment Instructions:

// ============ HEROKU DEPLOYMENT ============
// 1. Create account at heroku.com
// 2. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
// 3. Run in your project directory:
//    - heroku login
//    - heroku create your-app-name
//    - git push heroku main
//    - heroku open
// Your backend URL will be: https://your-app-name.herokuapp.com

// ============ VERCEL DEPLOYMENT ============
// Create api/server.js with the code above, add to vercel.json:
// {
//   "version": 2,
//   "builds": [
//     { "src": "api/server.js", "use": "@vercel/node" }
//   ],
//   "routes": [
//     { "src": "/(.*)", "dest": "api/server.js" }
//   ]
// }

// ============ LOCAL TESTING ============
// 1. npm install
// 2. node server.js
// 3. Backend runs on http://localhost:5000

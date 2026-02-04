/**
 * BeZhas Web3 Application
 * Main entry point for the application
 */

require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'BeZhas Web3 API',
    version: '1.0.0',
    status: 'running'
  });
});

// MongoDB connection test endpoint
app.get('/db-status', async (req, res) => {
  try {
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'MONGODB_URI not configured' 
      });
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    await client.db().admin().ping();
    await client.close();
    
    res.json({ 
      status: 'connected', 
      message: 'MongoDB connection successful' 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'MongoDB connection failed',
      error: error.message 
    });
  }
});

// Web3 info endpoint (basic)
app.get('/web3-info', (req, res) => {
  const web3Config = {
    provider: process.env.WEB3_PROVIDER_URL ? 'configured' : 'not configured',
    contract: process.env.CONTRACT_ADDRESS ? 'configured' : 'not configured',
    network: process.env.NODE_ENV || 'development'
  };
  
  res.json(web3Config);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BeZhas Web3 server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

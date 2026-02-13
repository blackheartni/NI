const { PROVIDERS } = require('../lib/providers');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }
  
  // Only accept POST
  if (req.method !== 'POST') {
    res.writeHead(405, corsHeaders);
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }
  
  try {
    const { provider, key, message } = req.body;
    
    // Validate
    if (!provider || !key || !message) {
      res.writeHead(400, corsHeaders);
      res.end(JSON.stringify({ error: 'Missing provider, key, or message' }));
      return;
    }
    
    if (!PROVIDERS[provider]) {
      res.writeHead(400, corsHeaders);
      res.end(JSON.stringify({ error: 'Unknown provider' }));
      return;
    }
    
    // Call AI provider (stateless - no storage)
    const startTime = Date.now();
    const response = await PROVIDERS[provider].makeRequest(key, message);
    const latency = Date.now() - startTime;
    
    // Return response (no logging, no storage)
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({
      success: true,
      response: response,
      provider: PROVIDERS[provider].name,
      latency: latency,
      timestamp: new Date().toISOString()
    }));
    
  } catch (error) {
    console.error('Proxy error:', error.message);
    
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }));
  }
};
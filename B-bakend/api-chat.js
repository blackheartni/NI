// NO require() - Vercel edge functions use direct code
// Place this file in /api/chat.js

const PROVIDERS = {
  gemini: {
    makeRequest: async (key, message) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `Gemini: ${res.status}`);
      }
      
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    }
  },
  
  openai: {
    makeRequest: async (key, message) => {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: message }],
          temperature: 0.7
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `OpenAI: ${res.status}`);
      }
      
      const data = await res.json();
      return data.choices?.[0]?.message?.content;
    }
  },
  
  groq: {
    makeRequest: async (key, message) => {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: message }],
          temperature: 0.7
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `Groq: ${res.status}`);
      }
      
      const data = await res.json();
      return data.choices?.[0]?.message?.content;
    }
  },
  
  anthropic: {
    makeRequest: async (key, message) => {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 2000,
          messages: [{ role: 'user', content: message }]
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `Claude: ${res.status}`);
      }
      
      const data = await res.json();
      return data.content?.[0]?.text;
    }
  },
  
  openrouter: {
    makeRequest: async (key, message) => {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'HTTP-Referer': 'https://farishta.app',
          'X-Title': 'Farishta',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [{ role: 'user', content: message }],
          temperature: 0.7
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `OpenRouter: ${res.status}`);
      }
      
      const data = await res.json();
      return data.choices?.[0]?.message?.content;
    }
  }
};

// Main handler - Vercel Edge Function format
export default async function handler(request) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  
  // Only POST
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Only POST allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }
  
  try {
    const body = await request.json();
    const { provider, key, message } = body;
    
    // Validate
    if (!provider || !key || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing provider/key/message' }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    if (!PROVIDERS[provider]) {
      return new Response(
        JSON.stringify({ error: 'Unknown provider' }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Call AI (stateless)
    const start = Date.now();
    const response = await PROVIDERS[provider].makeRequest(key, message);
    const latency = Date.now() - start;
    
    return new Response(
      JSON.stringify({
        success: true,
        response: response,
        provider: provider,
        latency: latency
      }),
      { status: 200, headers: corsHeaders }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// Vercel config
export const config = {
  runtime: 'edge'
};
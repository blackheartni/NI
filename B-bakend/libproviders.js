// AI Provider configurations - NO KEYS HERE, passed from frontend
const PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    makeRequest: async (key, message) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Gemini Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    }
  },
  
  openai: {
    name: 'OpenAI',
    makeRequest: async (key, message) => {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: message }],
          temperature: 0.7,
          max_tokens: 2000
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `OpenAI Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content;
    }
  },
  
  groq: {
    name: 'Groq',
    makeRequest: async (key, message) => {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: message }],
          temperature: 0.7,
          max_tokens: 2000
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Groq Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content;
    }
  },
  
  anthropic: {
    name: 'Anthropic Claude',
    makeRequest: async (key, message) => {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
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
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Claude Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.content?.[0]?.text;
    }
  },
  
  openrouter: {
    name: 'OpenRouter',
    makeRequest: async (key, message) => {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'HTTP-Referer': 'https://farishta-engine.vercel.app',
          'X-Title': 'Farishta Engine',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [{ role: 'user', content: message }],
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `OpenRouter Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content;
    }
  }
};

module.exports = { PROVIDERS };
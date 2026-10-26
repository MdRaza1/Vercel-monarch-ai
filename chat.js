const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 2000;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chatbot is not configured yet. Add GROQ_API_KEY in Vercel Environment Variables.' });
  }

  try {
    const body = req.body || {};
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return res.status(400).json({ error: 'Please send a message.' });
    }

    const messages = body.messages.slice(-MAX_MESSAGES);
    const validMessages = [];
    for (const message of messages) {
      if (!message || !['user', 'assistant'].includes(message.role) ||
          typeof message.content !== 'string' ||
          !message.content.trim() ||
          message.content.length > MAX_MESSAGE_CHARS) {
        return res.status(400).json({ error: 'Invalid message format or message is too long.' });
      }
      validMessages.push({ role: message.role, content: message.content.trim() });
    }
    if (validMessages[validMessages.length - 1].role !== 'user') {
      return res.status(400).json({ error: 'The last message must be from the user.' });
    }

    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are MONARCH AI, the helpful assistant for the MONARCH website, branded POWERED BY RAJA GOD. Be friendly, clear, and concise. Do not claim that colour-trading, gambling, or market outcomes can be predicted with certainty, and never promise profits or guaranteed wins. Do not request passwords, private keys, or API keys.'
          },
          ...validMessages
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error('Groq API error status:', upstream.status);
      if (upstream.status === 401 || upstream.status === 403) {
        return res.status(502).json({ error: 'Groq rejected the server API key. Check GROQ_API_KEY in Vercel.' });
      }
      if (upstream.status === 429) {
        return res.status(429).json({ error: 'AI is busy right now. Please wait a moment and try again.' });
      }
      return res.status(502).json({ error: 'The AI service could not respond right now. Please try again shortly.' });
    }

    const reply = data && data.choices && data.choices[0] &&
      data.choices[0].message && data.choices[0].message.content;
    if (typeof reply !== 'string' || !reply.trim()) {
      return res.status(502).json({ error: 'The AI returned an empty response. Please try again.' });
    }
    return res.status(200).json({ reply: reply.trim() });
  } catch (error) {
    console.error('Chat route error:', error && error.message ? error.message : 'Unknown error');
    return res.status(500).json({ error: 'Unexpected server error. Please try again.' });
  }
};

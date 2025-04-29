const { OpenAI } = require('openai');
const pool = require('../db');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.createPrompt = async (req, res) => {
  const { userId } = req.params;
  const { prompt } = req.body;

  if (req.user.userId !== parseInt(userId)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // 1. Send to OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = completion.choices[0].message.content;

    // 2. Store in DB
    const result = await pool.query(
      `INSERT INTO prompts (user_id, prompt, response)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, prompt, responseText]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('OpenAI Error:', err.message);
    res.status(500).json({ error: 'Failed to process prompt' });
  }
};

exports.getPromptsByUser = async (req, res) => {
  const { userId } = req.params;

  if (req.user.userId !== parseInt(userId)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM prompts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

import PublicMessage from '../models/PublicMessage.js';

// GET /public-messages
export async function getPublicMessages(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit || '100', 10), 500);
    const messages = await PublicMessage.find({}).sort({ timestamp: 1 }).limit(limit);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}




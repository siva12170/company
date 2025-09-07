import express from 'express';
import { postMessage, getMessages } from '../controllers/messageController.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import Message from '../models/Message.js';

const router = express.Router();

// Get all messages (for demo/testing)
router.get('/all', async (req, res) => {
	try {
		const messages = await Message.find({}).sort('-timestamp').limit(100);
		res.json(messages);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Send message
router.post('/', verifyJWT, postMessage);
// Fetch chat history
router.get('/:topicId', verifyJWT, getMessages);

export default router;

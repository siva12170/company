import express from 'express';
import { postTopic, getPendingTopics, acceptTopic, completeTopic } from '../controllers/topicController.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = express.Router();
// User posts topic
router.post('/', verifyJWT, postTopic);
// Creator fetches pending topics
router.get('/', verifyJWT, getPendingTopics);

// Creator accepts topic
router.patch('/:id/accept', verifyJWT, acceptTopic);
// Mark topic as completed/explained
router.patch('/:id/complete', verifyJWT, completeTopic);

export default router;

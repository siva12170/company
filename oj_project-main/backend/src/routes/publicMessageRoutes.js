import express from 'express';
import { getPublicMessages } from '../controllers/publicMessageController.js';

const router = express.Router();

// Public chat history (no auth)
router.get('/', getPublicMessages);

export default router;




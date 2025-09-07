import Message from '../models/Message.js';

// POST /messages
import Topic from '../models/Topic.js';
export async function postMessage(req, res) {
  try {
    const { topicId, message } = req.body;
    const senderId = req.user._id;
    const senderEmail = req.user.email;
    const senderUsername = req.user.username;
    // Find topic to determine receiver
    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    let receiverId, receiverEmail, receiverUsername;
    if (topic.userId.toString() === senderId.toString()) {
      // sender is the user, receiver is creator
      receiverId = topic.creatorId;
    } else {
      // sender is creator, receiver is user
      receiverId = topic.userId;
    }
    // Fetch receiver details if available
    let receiverUser = null;
    if (receiverId) {
      const User = (await import('../models/user.model.js')).default || (await import('../models/user.model.js'));
      receiverUser = await User.findById(receiverId);
    }
    receiverEmail = receiverUser?.email || '';
    receiverUsername = receiverUser?.username || '';
    const msg = await Message.create({ topicId, senderId, senderEmail, senderUsername, receiverId, receiverEmail, receiverUsername, message });
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /messages/:topicId
export async function getMessages(req, res) {
  try {
    const messages = await Message.find({ topicId: req.params.topicId }).sort('timestamp');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

import Topic from '../models/Topic.js';

// POST /topics
export async function postTopic(req, res) {
  try {
    const { title, description } = req.body;
    const userId = req.user._id; // assumes auth middleware sets req.user
    const topic = await Topic.create({ title, description, userId });
    res.status(201).json(topic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /topics
// - If ?user=me, return topics for logged-in user
// - If no query, return all pending and accepted topics for creators
export async function getPendingTopics(req, res) {
  try {
    if (req.query.user === 'me') {
      // User dashboard: show all their topics
      const topics = await Topic.find({ userId: req.user._id }).sort('-createdAt');
      return res.json(topics);
    }
    // Creator dashboard: show all pending and accepted topics
    const topics = await Topic.find({ status: { $in: ['pending', 'accepted'] } }).populate('userId', 'name email').sort('-createdAt');
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PATCH /topics/:id/accept
export async function acceptTopic(req, res) {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    // Prevent user from accepting their own topic
    if (topic.userId.toString() === req.user._id.toString()) {
      return res.status(403).json({ error: 'You cannot accept your own topic.' });
    }
    if (topic.status !== 'pending') {
      return res.status(400).json({ error: 'Topic is not pending.' });
    }
    topic.status = 'accepted';
    topic.creatorId = req.user._id;
    await topic.save();
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PATCH /topics/:id/complete
export async function completeTopic(req, res) {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    // Only creator or user can mark as completed/explained
    if (
      topic.creatorId?.toString() !== req.user._id.toString() &&
      topic.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: 'Not authorized to complete this topic.' });
    }
    topic.status = 'completed';
    await topic.save();
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

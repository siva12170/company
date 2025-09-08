import { Server } from 'socket.io';
import http from 'http';
import Message from './models/Message.js';
import Topic from './models/Topic.js';
import { setIO } from './socketInstance.js';

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || '*',
      credentials: true
    }
  });

  // expose io globally via getter
  setIO(io);

  io.on('connection', (socket) => {
    // contests: join room for specific contest leaderboard updates
    socket.on('contest:join', ({ contestId }) => {
      if (contestId) socket.join(`contest_${contestId}`);
    });

    socket.on('contest:leave', ({ contestId }) => {
      if (contestId) socket.leave(`contest_${contestId}`);
    });
    // Join chatroom for a topic (only poster and accepted creator allowed)
    socket.on('joinRoom', async ({ topicId, userId }) => {
      try {
        const topic = await Topic.findById(topicId);
        if (!topic) return;
        // Only allow poster or accepted creator
        if (
          topic.userId.toString() === userId?.toString() ||
          (topic.creatorId && topic.creatorId.toString() === userId?.toString())
        ) {
          socket.join(topicId);
        }
      } catch {}
    });

    // Real-time topic events
    socket.on('topicCreated', async (topic) => {
      socket.broadcast.emit('topicCreated', topic);
    });
    socket.on('topicUpdated', async (topic) => {
      socket.broadcast.emit('topicUpdated', topic);
    });
    socket.on('topicCompleted', async (topic) => {
      socket.broadcast.emit('topicCompleted', topic);
    });
    // Handle sending message (only poster and accepted creator allowed)
    socket.on('sendMessage', async ({ topicId, senderId, message }) => {
      // Find topic to determine if sender is allowed
      const topic = await Topic.findById(topicId);
      if (!topic) return;
      // Only allow poster or accepted creator
      if (
        topic.userId.toString() !== senderId?.toString() &&
        (!topic.creatorId || topic.creatorId.toString() !== senderId?.toString())
      ) {
        return; // Not allowed
      }
      // Fetch sender info
      let senderUser = null;
      let senderEmail = '', senderUsername = '';
      try {
        const User = (await import('./models/user.model.js')).default || (await import('./models/user.model.js'));
        senderUser = await User.findById(senderId);
        senderEmail = senderUser?.email || '';
        senderUsername = senderUser?.username || '';
      } catch {}

      // Find topic to determine receiver
      let receiverId, receiverEmail = '', receiverUsername = '';
      if (topic.userId.toString() === senderId?.toString()) {
        receiverId = topic.creatorId;
      } else {
        receiverId = topic.userId;
      }
      if (receiverId) {
        try {
          const User = (await import('./models/user.model.js')).default || (await import('./models/user.model.js'));
          const receiverUser = await User.findById(receiverId);
          receiverEmail = receiverUser?.email || '';
          receiverUsername = receiverUser?.username || '';
        } catch {}
      }
      const msg = await Message.create({ topicId, senderId, senderEmail, senderUsername, receiverId, receiverEmail, receiverUsername, message });
      io.to(topicId).emit('newMessage', msg);
    });

    // Optional: handle disconnect
    socket.on('disconnect', () => {});
  });
}

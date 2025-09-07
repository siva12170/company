import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderEmail: { type: String },
  senderUsername: { type: String },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverEmail: { type: String },
  receiverUsername: { type: String },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);
export default Message;

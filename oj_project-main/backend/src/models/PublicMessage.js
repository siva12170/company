import mongoose from 'mongoose';

const PublicMessageSchema = new mongoose.Schema({
  senderUsername: { type: String, default: 'Guest' },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const PublicMessage = mongoose.model('PublicMessage', PublicMessageSchema);
export default PublicMessage;




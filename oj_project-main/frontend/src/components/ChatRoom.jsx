import { useEffect, useState, useRef } from 'react';
import socket from '../utils/socket';
import axios from 'axios';

export default function ChatRoom({ topicId, userId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!topicId || !userId) return;
    socket.emit('joinRoom', { topicId, userId });
    axios.get(`/api/v1/messages/${topicId}`)
      .then(res => setMessages(res.data));
    socket.on('newMessage', msg => {
      if (msg.topicId === topicId) setMessages(m => [...m, msg]);
    });
    return () => {
      socket.off('newMessage');
    };
  }, [topicId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async e => {
    e.preventDefault();
    if (!input.trim()) return;
    socket.emit('sendMessage', { topicId, senderId: userId, message: input });
    setInput('');
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, height: 400, overflowY: 'auto' }}>
      <div style={{ height: 340, overflowY: 'auto' }}>
        {messages.map(msg => (
          <div key={msg._id} style={{ margin: 4, textAlign: msg.senderId === userId ? 'right' : 'left' }}>
            <b>{msg.senderId === userId ? 'You' : 'Them'}:</b> {msg.message}
            <div style={{ fontSize: 10 }}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex', marginTop: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} style={{ flex: 1 }} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

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
    <div className="border rounded-md p-3 sm:p-4 h-80 sm:h-96 md:h-[28rem] flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {messages.map(msg => (
          <div key={msg._id} className={msg.senderId === userId ? 'text-right' : 'text-left'}>
            <div className={msg.senderId === userId ? 'inline-block bg-blue-50 text-blue-900 px-3 py-2 rounded-md' : 'inline-block bg-gray-100 text-gray-900 px-3 py-2 rounded-md'}>
              <b>{msg.senderId === userId ? 'You' : 'Them'}:</b> {msg.message}
              <div className="text-[10px] text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="mt-2 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} className="flex-1 border rounded px-3 py-2 text-sm" placeholder="Type a message" />
        <button type="submit" className="shrink-0 bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Send</button>
      </form>
    </div>
  );
}

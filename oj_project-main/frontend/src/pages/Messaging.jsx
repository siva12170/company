import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import socket from '../utils/socket';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Messaging() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [topicId, setTopicId] = useState('');
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tid = params.get('topic');
    if (tid) setTopicId(tid);
  }, [location]);

  useEffect(() => {
    if (!topicId || !user?._id) return;
    setLoading(true);
    axios.get(`/api/v1/messages/${topicId}`)
      .then(res => setMessages(Array.isArray(res.data) ? res.data : res.data.data || []))
      .catch(() => setError('Failed to load messages'))
      .finally(() => setLoading(false));
    socket.emit('joinRoom', { topicId, userId: user._id });
    socket.on('newMessage', msg => {
      if (msg && msg.topicId === topicId) setMessages(m => [...m, msg]);
    });
    return () => {
      socket.off('newMessage');
    };
  }, [topicId, user?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !topicId || !user?._id) {
      setError('You must be logged in to send messages.');
      return;
    }
    socket.emit('sendMessage', { topicId, senderId: user._id, message: input });
    setInput('');
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Messaging</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="border rounded p-4 h-80 overflow-y-auto bg-gray-50 mb-4">
        {messages.filter(Boolean).map((msg, i) => (
          msg && msg.message ? (
            <div key={msg._id || i} className="mb-2">
              <span className="font-semibold">{msg.senderUsername || msg.senderEmail}:</span> {msg.message}
              <span className="text-xs text-gray-400 ml-2">{msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}</span>
            </div>
          ) : null
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} className="flex-1 border rounded px-3 py-2" placeholder="Type your message..." />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800" disabled={loading || !input.trim()}>Send</button>
      </form>
    </div>
  );
}

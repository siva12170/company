import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const topicSocket = io('http://localhost:4000', { withCredentials: true });
export default function AcceptTopics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/v1/topics')
      .then(res => setTopics(Array.isArray(res.data) ? res.data : res.data.data || []))
      .catch(() => setError('Failed to load topics'))
      .finally(() => setLoading(false));
    // Listen for topic events
    topicSocket.on('topicCreated', topic => {
      setTopics(prev => [topic, ...prev]);
    });
    topicSocket.on('topicUpdated', updated => {
      setTopics(prev => prev.map(t => t._id === updated._id ? updated : t));
    });
    topicSocket.on('topicCompleted', completed => {
      setTopics(prev => prev.map(t => t._id === completed._id ? completed : t));
    });
    return () => {
      topicSocket.off('topicCreated');
      topicSocket.off('topicUpdated');
      topicSocket.off('topicCompleted');
    };
  }, []);

  const handleAccept = async (topicId) => {
    try {
      const res = await axios.patch(`/api/v1/topics/${topicId}/accept`);
      setTopics(topics => topics.map(t => t._id === topicId ? { ...t, status: 'accepted' } : t));
      if (res.data && res.data._id) {
        topicSocket.emit('topicUpdated', res.data);
      }
    } catch {
      setError('Failed to accept topic');
    }
  };

  const handleComplete = async (topicId) => {
    try {
      const res = await axios.patch(`/api/v1/topics/${topicId}/complete`);
      setTopics(topics => topics.map(t => t._id === topicId ? { ...t, status: 'completed' } : t));
      if (res.data && res.data._id) {
        topicSocket.emit('topicCompleted', res.data);
      }
    } catch {
      setError('Failed to mark as completed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Accept or Complete Topics</h2>
      {loading ? <div>Loading...</div> : null}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <ul className="space-y-4">
        {topics.map(topic => (
          <li key={topic._id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold">{topic.title}</div>
              <div className="text-gray-600 text-sm mb-2">{topic.description}</div>
              <div className="text-xs text-gray-500">Status: {topic.status}</div>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              {topic.status === 'pending' && (
                <button onClick={() => handleAccept(topic._id)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Accept</button>
              )}
              {topic.status === 'accepted' && (
                <>
                  <button onClick={() => navigate(`/dashboard/messages?topic=${topic._id}`)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Chat</button>
                  <button onClick={() => handleComplete(topic._id)} className="bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-900">Mark Complete</button>
                </>
              )}
              {topic.status === 'completed' && (
                <span className="text-green-700 font-bold">Completed</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

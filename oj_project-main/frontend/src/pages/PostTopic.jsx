import React, { useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
const topicSocket = io('http://localhost:4000', { withCredentials: true });

export default function PostTopic() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
  const res = await axios.post('/api/v1/topics', { title, description }, { withCredentials: true });
      if (res.status === 201 && res.data && res.data._id) {
        setSuccess('Topic posted successfully!');
        setTitle('');
        setDescription('');
        topicSocket.emit('topicCreated', res.data); // Notify all clients
      } else {
        setError(res.data?.message || 'Failed to post topic');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post topic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Post a New Topic</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} required className="w-full border rounded px-3 py-2" />
        </div>
        <button type="submit" disabled={loading} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
          {loading ? 'Posting...' : 'Post Topic'}
        </button>
        {success && <div className="text-green-600 mt-2">{success}</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
}

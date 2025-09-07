import { useState, useEffect } from 'react';
import axios from 'axios';
import ChatRoom from '../components/ChatRoom';

export default function UserDashboard({ user }) {
  const [topics, setTopics] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activeTopic, setActiveTopic] = useState(null);

  useEffect(() => {
    axios.get('/api/v1/topics?user=me')
      .then(res => {
        if (Array.isArray(res.data)) {
          setTopics(res.data);
        } else {
          setTopics([]);
        }
      })
      .catch(() => setTopics([]));
  }, []);

  const postTopic = async e => {
    e.preventDefault();
    const res = await axios.post('/api/v1/topics', { title, description });
    setTopics([...topics, res.data]);
    setTitle(''); setDescription('');
  };

  const completeTopic = async id => {
    await axios.patch(`/api/v1/topics/${id}/complete`);
    setTopics(topics.map(t => t._id === id ? { ...t, status: 'completed' } : t));
  };

  return (
    <div>
      <h2>Post a Topic</h2>
      <form onSubmit={postTopic}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" required />
        <button type="submit">Post</button>
      </form>
      <h3>Your Topics</h3>
      <ul>
        {topics.map(t => (
          <li key={t._id}>
            <b>{t.title}</b> - {t.status}<br/>
            <span>Accepted by: {t.creatorId?.name || t.creatorId?.email || t.creatorId || 'N/A'}</span><br/>
            {t.status === 'accepted' && (
              <>
                <button onClick={() => setActiveTopic(t)}>Open Chat</button>
                <button onClick={() => completeTopic(t._id)} style={{marginLeft:8}}>Mark as Completed</button>
              </>
            )}
            {t.status === 'completed' && <span>Status: Completed</span>}
          </li>
        ))}
      </ul>
      {activeTopic && activeTopic.status === 'accepted' && <ChatRoom topicId={activeTopic._id} userId={user._id} />}
    </div>
  );
}

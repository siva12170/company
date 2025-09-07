import { useState, useEffect } from 'react';
import axios from 'axios';
import ChatRoom from '../components/ChatRoom';

export default function CreatorDashboard({ user }) {
  const [topics, setTopics] = useState([]);
  const [activeTopic, setActiveTopic] = useState(null);

  useEffect(() => {
    axios.get('/api/v1/topics')
      .then(res => {
        if (Array.isArray(res.data)) {
          setTopics(res.data);
        } else {
          setTopics([]);
        }
      })
      .catch(() => setTopics([]));
  }, []);

  const acceptTopic = async id => {
    const topic = topics.find(t => t._id === id);
    if (topic.userId === user._id || topic.userId?._id === user._id) {
      alert('You cannot accept your own topic.');
      return;
    }
    await axios.patch(`/api/v1/topics/${id}/accept`);
    setTopics(topics.map(t => t._id === id ? { ...t, status: 'accepted', creatorId: user._id } : t));
  };

  const completeTopic = async id => {
    await axios.patch(`/api/v1/topics/${id}/complete`);
    setTopics(topics.map(t => t._id === id ? { ...t, status: 'completed' } : t));
  };

  return (
    <div>
      <h2>Pending Topics</h2>
      <ul>
        {topics.filter(t => t.status === 'pending').map(t => (
          <li key={t._id}>
            <b>{t.title}</b> - {t.description}<br/>
            <span>Requested by: {t.userId?.name || t.userId?.email || t.userId}</span><br/>
            <button onClick={() => acceptTopic(t._id)}>Accept</button>
          </li>
        ))}
      </ul>
      <h3>Accepted Topics</h3>
      <ul>
        {topics.filter(t => t.status === 'accepted').map(t => (
          <li key={t._id}>
            <b>{t.title}</b><br/>
            <span>Requested by: {t.userId?.name || t.userId?.email || t.userId}</span><br/>
            <span>Accepted by: {t.creatorId?.name || t.creatorId?.email || t.creatorId}</span><br/>
            <button onClick={() => setActiveTopic(t)}>Open Chat</button>
            <button onClick={() => completeTopic(t._id)} style={{marginLeft:8}}>Mark as Completed</button>
          </li>
        ))}
      </ul>
      <h3>Completed Topics</h3>
      <ul>
        {topics.filter(t => t.status === 'completed').map(t => (
          <li key={t._id}>
            <b>{t.title}</b><br/>
            <span>Requested by: {t.userId?.name || t.userId?.email || t.userId}</span><br/>
            <span>Accepted by: {t.creatorId?.name || t.creatorId?.email || t.creatorId}</span><br/>
            <span>Status: Completed</span>
          </li>
        ))}
      </ul>
      {activeTopic && activeTopic.status === 'accepted' && <ChatRoom topicId={activeTopic._id} userId={user._id} />}
    </div>
  );
}

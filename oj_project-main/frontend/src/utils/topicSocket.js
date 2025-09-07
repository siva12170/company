import { io } from 'socket.io-client';

const topicSocket = io('http://localhost:4000/topic', { withCredentials: true });
export default topicSocket;

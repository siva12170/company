import dotenv from "dotenv"
dotenv.config() // Change from "../env" to "./.env
import app from './app.js';
import { createServer } from 'http';
import setupSocket from './socket.js';
const PORT = process.env.PORT || 4000;
import connectDB from './db/connectdb.js';

connectDB().then(() => {
    app.on('error', (error) => {
        console.error('Error: ', error);
        throw error;
    });
    const server = createServer(app);
    setupSocket(server);
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch((error) => {
    console.error('Error: ', error);
    process.exit(1);
});
import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import app from './app';
import connectDB from './db/connect';
import { initSocket } from './sockets';

const PORT = process.env.PORT || 4000;
const start = async () => {
  await connectDB(process.env.MONGO_URI!);
  console.log('Success connect to the DB');
  const server = http.createServer(app);
  initSocket(server);
  server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}...`);
  });
};

start().catch((e) => {
  console.error(e);
  process.exit(1);
});

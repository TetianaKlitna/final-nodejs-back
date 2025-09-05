import cors from 'cors';
import express from 'express';
import 'express-async-errors';
import http from 'http';
import connectDB from './db/connect';
import dotenv from 'dotenv';
dotenv.config();

import authRouter from './routes/auth';

import notFoundMiddleware from './middleware/not-found';
import errorHandlerMiddleware from './middleware/error-handler';

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());

// routes
app.use('/api/v1/auth', authRouter);

// middlewares
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 3000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI!);
    console.log('Success connect to the DB');
    server.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}...`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();

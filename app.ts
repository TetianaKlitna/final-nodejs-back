const cors = require("cors");
import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());

// routes
import authRouter from './routes/auth';
app.use('/api/v1/auth', authRouter);

// middlewares
import notFoundMiddleware from './middleware/not-found';
app.use(notFoundMiddleware);

import errorHandlerMiddleware from './middleware/error-handler';
app.use(errorHandlerMiddleware);

import connectDB from './db/connect';
import dotenv from 'dotenv';
dotenv.config();
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

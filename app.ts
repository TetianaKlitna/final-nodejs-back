import dotenv from 'dotenv';
dotenv.config();
import helmet from 'helmet';
import cors from 'cors';
import { xss } from 'express-xss-sanitizer';
import rateLimit from 'express-rate-limit';
import express from 'express';
import 'express-async-errors';
import cookieParser from 'cookie-parser';
import http from 'http';
import connectDB from './db/connect';
import session from 'express-session';
import passport from './config/passport';
import authRouter from './routes/auth';
import mainRouter from './routes/main';
import notFoundMiddleware from './middleware/not-found';
import errorHandlerMiddleware from './middleware/error-handler';

const app = express();
const server = http.createServer(app);

app.use(express.json());
// security
app.use(cors());
app.use(helmet());
app.use(xss());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
});
app.use(limiter);
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1', mainRouter);
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

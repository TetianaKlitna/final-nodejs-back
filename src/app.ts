import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import { xss } from 'express-xss-sanitizer';
import rateLimit from 'express-rate-limit';
import express from 'express';
import 'express-async-errors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import authRouter from './routes/auth';
import taskRouter from './routes/tasks';
import notFoundMiddleware from './middleware/not-found';
import errorHandlerMiddleware from './middleware/error-handler';
import passport from './config/passport';

const app = express();

const corsOptions: CorsOptions = {
  origin: [process.env.CLIENT_URL || ''],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(express.json());
// security
app.use(cors(corsOptions));
app.use(helmet());
app.use(xss());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 100 requests per window
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

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tasks', taskRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;

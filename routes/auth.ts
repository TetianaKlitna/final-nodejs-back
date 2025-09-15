import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  activate,
  refresh,
  googleAuth,
  googleCallback,
} from '../controllers/auth';

const authRouter = express.Router();

authRouter.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        'Password must be at least 8 chars and include uppercase, lowercase, number, and symbol.'
      ),
  ],
  register
);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/activate/:link', activate);
authRouter.get('/refresh', refresh);
authRouter.get('/google', googleAuth);
authRouter.get('/google/callback', googleCallback);

export default authRouter;

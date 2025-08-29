import express from 'express';
import { signUp, signIn } from '../controllers/auth';

const authRouter = express.Router();

authRouter.route('/signup').post(signUp);
authRouter.route('/signin').get(signIn);

export default authRouter;

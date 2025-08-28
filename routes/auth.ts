import express from 'express';
import { signUp } from '../controllers/auth';

const authRouter = express.Router();

authRouter.route('/signup').get(signUp);

export default authRouter;

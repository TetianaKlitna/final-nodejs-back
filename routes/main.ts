import express from 'express';
import requireAuth from '../middleware/require-auth';
import { getAllUsers } from '../controllers/main';

const mainRouter = express.Router();

mainRouter.get('/dashboard', requireAuth, getAllUsers);

export default mainRouter;

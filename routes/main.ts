import express from 'express';
import requireAuth from '../middleware/require-auth';
import { getAllUsers } from '../controllers/main';

const mainRouter = express.Router();

mainRouter.route('/dashboard').get(requireAuth, getAllUsers);

export default mainRouter;

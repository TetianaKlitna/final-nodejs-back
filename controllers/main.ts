import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const getAllUsers = async (req: Request, res: Response) => {
  return res.status(StatusCodes.OK).json({ success: true, msg: 'All users' });
};

export { getAllUsers };

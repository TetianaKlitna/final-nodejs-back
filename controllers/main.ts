import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  return res.status(StatusCodes.OK).json({ success: true, msg: 'All users' });
};

export { getAllUsers };

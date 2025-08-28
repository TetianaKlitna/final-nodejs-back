import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError } from '../errors';

const signUp = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if(!name || !email || !password){
    throw new BadRequestError('Please provide name, email and password');
  }
  return res.status(StatusCodes.OK).json({ success: true, msg: 'User created' });
};

export { signUp };

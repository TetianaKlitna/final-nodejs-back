import jwt, {
  JwtPayload,
  TokenExpiredError,
  JsonWebTokenError,
} from 'jsonwebtoken';
import { UnauthenticatedError } from '../errors';
import { Request, Response, NextFunction } from 'express';

type AuthRequest = Request & {
  user?: { id: string; username?: string };
};

type AuthJwtPayload = JwtPayload & {
  id: string;
  username?: string;
};

const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authData = req.headers.authorization;
  if (!authData || !authData.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Please provide Authorization Data');
  }

  const token = authData.split(' ')[1];
  if (!token) {
    throw new UnauthenticatedError('Please provide Token');
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
    const { id, username } = decodedToken as AuthJwtPayload;
    if (!id) {
      throw new UnauthenticatedError('Invalid Token Payload');
    }
    req.user = { id, username };
    next();
  } catch (error) {
    console.error(error);
    if (error instanceof TokenExpiredError) {
      throw new UnauthenticatedError('Token expired');
    }
    if (error instanceof JsonWebTokenError) {
      throw new UnauthenticatedError('Invalid Token');
    }
    throw new UnauthenticatedError('Authentication failed');
  }
};

export default requireAuth;

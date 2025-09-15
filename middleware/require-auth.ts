import tokenService from '../service/token-service';
import { UnauthenticatedError } from '../errors';
import { Request, Response, NextFunction } from 'express';

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authData = req.headers.authorization;
  if (!authData || !authData.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Please provide Authorization Data');
  }

  const accessToken = authData.split(' ')[1];
  if (!accessToken) {
    throw new UnauthenticatedError('Please provide Authorization token');
  }

  try {
    const userData = tokenService.validateAccessToken(accessToken);
    if (!userData) {
      throw new UnauthenticatedError('Invalid authentication token');
    }
    req.user = userData;
    next();
  } catch (error) {
    console.error(error);
    throw new UnauthenticatedError('Authentication failed');
  }
};

export default requireAuth;

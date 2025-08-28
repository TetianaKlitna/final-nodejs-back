import CustomAPIError from './CustomAPIError';
import { StatusCodes } from 'http-status-codes';

class UnauthenticatedError extends CustomAPIError {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

export default UnauthenticatedError;

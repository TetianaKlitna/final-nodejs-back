import CustomAPIError from './CustomAPIError';
import { StatusCodes } from 'http-status-codes';

class ForbiddenError extends CustomAPIError {
  constructor(message: string) {
    super(message, StatusCodes.FORBIDDEN);
  }
}

export default ForbiddenError;

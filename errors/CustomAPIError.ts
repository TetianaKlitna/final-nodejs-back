import { StatusCodes } from 'http-status-codes';

class CustomAPIError extends Error {
  statusCode: StatusCodes;

  constructor(message: string, statusCode = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default CustomAPIError;

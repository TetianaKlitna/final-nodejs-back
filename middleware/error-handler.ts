import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CustomAPIError } from '../errors';

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  if (err instanceof CustomAPIError) {
    return res
      .status(err.statusCode)
      .json({ success: false, error: err.message });
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: err.message,
  });
};

export default errorHandler;

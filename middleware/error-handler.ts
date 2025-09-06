import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CustomAPIError } from '../errors';
import mongoose from 'mongoose';
import { MongoServerError } from 'mongodb';

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
      .json({ success: false, msg: err.message });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      msg: `${Object.values(err.errors)
        .map((item) => item.message)
        .join(', ')}`,
    });
  }

  if (err instanceof MongoServerError && err.code === 11000) {
    const fields = err.keyValue
      ? Object.keys(err.keyValue).join(', ')
      : 'field';
    return res.status(StatusCodes.CONFLICT).json({
      success: false,
      msg: `Duplicate value for ${fields}`,
    });
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    msg: 'Internal Server Error',
  });
};

export default errorHandler;

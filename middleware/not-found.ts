import { Request, Response } from 'express';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';

const notFound = (req: Request, res: Response) => {
  return res
    .status(StatusCodes.NOT_FOUND)
    .json({ success: false, msg: ReasonPhrases.NOT_FOUND });
};

export default notFound;

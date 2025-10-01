import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import userService from '../service/user-service';
import { validationResult } from 'express-validator';

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: errors
          .array()
          .map((err) => err.msg)
          .join(', '),
      });
    }
    const { name, email, password } = req.body;
    await userService.registration(name, email, password);

    res.status(StatusCodes.CREATED).json({ success: true });
  }

  async login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;
    const userData = await userService.login(email, password);
    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: 2 * 24 * 60 * 60 * 1000 /* 2d */,
      httpOnly: true,
    });
    res.status(StatusCodes.OK).json({ ...userData });
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    const { refreshToken } = req.cookies;
    await userService.logout(refreshToken);
    res.clearCookie('refreshToken');
    return res.status(StatusCodes.OK).json({ success: true });
  }

  async activate(req: Request, res: Response, next: NextFunction) {
    const activationLink = req.params.link;
    await userService.activate(activationLink);
    return res.redirect(`${process.env.CLIENT_URL}/login` as string);
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    const { refreshToken } = req.cookies;
    const userData = await userService.refresh(refreshToken);
    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: 2 * 24 * 60 * 60 * 1000 /* 2d */,
      httpOnly: true,
    });
    res.status(StatusCodes.OK).json({ ...userData });
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {}

  async resetPassword(req: Request, res: Response, next: NextFunction) {}
}

export default new AuthController();

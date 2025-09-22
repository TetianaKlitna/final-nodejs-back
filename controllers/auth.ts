import passport from 'passport';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UnauthenticatedError } from '../errors';
import userService from '../service/user-service';
import { validationResult } from 'express-validator';

const register = async (req: Request, res: Response, next: NextFunction) => {
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
  const userData = await userService.registration(name, email, password);
  res.cookie('refreshToken', userData.refreshToken, {
    maxAge: 2 * 24 * 60 * 60 * 1000 /* 2d */,
    httpOnly: true,
  });
  res.status(StatusCodes.CREATED).json({ ...userData });
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const userData = await userService.login(email, password);
  res.cookie('refreshToken', userData.refreshToken, {
    maxAge: 2 * 24 * 60 * 60 * 1000 /* 2d */,
    httpOnly: true,
  });
  res.status(StatusCodes.OK).json({ ...userData });
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;
  await userService.logout(refreshToken);
  res.clearCookie('refreshToken');
  return res.status(StatusCodes.OK).json({ success: true });
};

const activate = async (req: Request, res: Response, next: NextFunction) => {
  const activationLink = req.params.link;
  await userService.activate(activationLink);
  return res.redirect(process.env.CLIENT_URL as string);
};

const refresh = async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;
  const userData = await userService.refresh(refreshToken);
  res.cookie('refreshToken', userData.refreshToken, {
    maxAge: 2 * 24 * 60 * 60 * 1000 /* 2d */,
    httpOnly: true,
  });
  res.status(StatusCodes.OK).json({ ...userData });
};

const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

const googleCallback = [
  passport.authenticate('google', { failureRedirect: '/', session: false }),
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new UnauthenticatedError('Google Authentication error');
    }
    // const user = req.user as any;
    // return res.status(StatusCodes.OK).json({
    //   user: { name: user.name },
    //   token,
    // });
  },
];

export {
  register,
  login,
  logout,
  activate,
  refresh,
  googleAuth,
  googleCallback,
};

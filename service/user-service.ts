import UserModel from '../model/User';
import uuid from 'uuid';
import mailService from './mail-service';
import tokenService from './token-service';
import type { ResetTokenJwtPayload } from './token-service';
import {
  BadRequestError,
  UnauthenticatedError,
  ForbiddenError,
} from '../errors';
import UserDTO from '../dto/user-dto';
import bcrypt from 'bcryptjs';
import ms, { StringValue } from 'ms';
class UserService {
  async registration(name: string, email: string, password: string) {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw new BadRequestError('An account with this email already exists.');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const activationLink = uuid.v4();
    await UserModel.create({
      name,
      email,
      password: hashedPassword,
      activationLink,
    });
    await mailService.sendActivationLink(
      email,
      `${process.env.API_URL}/api/v1/auth/activate/${activationLink}`
    );
  }

  async activate(activationLink: string) {
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw new BadRequestError('Invalid or expired activation link');
    }
    user.isActivated = true;
    await user.save();
  }

  async login(email: string, password: string) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new BadRequestError('User with this email was not found');
    }
    const isPassSame = await bcrypt.compare(password, user.password || '');
    if (!isPassSame) {
      throw new BadRequestError('Incorrect password');
    }
    if (!user.isActivated) {
      throw new ForbiddenError('Please verify your email before logging in');
    }
    const userdto = new UserDTO(user);
    const tokens = tokenService.generateTokens(userdto.userId, userdto.name);
    await tokenService.saveToken(userdto.userId, tokens.refreshToken);
    return {
      ...tokens,
      user: userdto,
    };
  }

  async logout(refreshToken: string) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthenticatedError('Invalid or missing authentication token');
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDB = tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDB) {
      throw new UnauthenticatedError('Invalid or missing authentication token');
    }
    const user = await UserModel.findById(userData.userId);
    if (!user) {
      throw new UnauthenticatedError('Invalid token: user does not exist.');
    }
    const userdto = new UserDTO(user);
    const tokens = tokenService.generateTokens(userdto.userId, userdto.name);
    await tokenService.saveToken(userdto.userId, tokens.refreshToken);
    return {
      ...tokens,
      user: userdto,
    };
  }

  async forgotPassword(email: string) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new BadRequestError('No account found with this email address.');
    }
    if (!user.isActivated) {
      throw new ForbiddenError('Please verify your email before logging in');
    }

    const jti = uuid.v4();
    const expiresIn = process.env.JWT_RESET_EXPIRES || '15m';
    user.resetPasswordJti = jti;
    user.resetPasswordExpires = new Date(
      Date.now() + ms(expiresIn as StringValue)
    );
    await user.save();

    const userId = user._id.toString();
    const resetToken = tokenService.generateResetToken(userId, jti);
    await mailService.sendResetPasswordLink(
      email,
      `${process.env.CLIENT_URL}/resetPassword?token=${resetToken}&email=${encodeURIComponent(email)}`
    );
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    const userData = tokenService.validateResetToken(
      token
    ) as ResetTokenJwtPayload | null;
    if (!userData) {
      throw new UnauthenticatedError('Invalid or missing reset token');
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userByEmail = await UserModel.findOne({ email: normalizedEmail });
    if (!userByEmail) {
      throw new BadRequestError('No account found with this email address.');
    }

    const user = await UserModel.findById(userData.userId);
    if (!user) {
      throw new BadRequestError('This reset link is invalid or has expired.');
    }

    if (!user.isActivated) {
      throw new ForbiddenError('Please verify your email before logging in.');
    }
    if (userByEmail._id.toString() !== user._id.toString()) {
      throw new UnauthenticatedError('Email does not match the reset token.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updated = await UserModel.findOneAndUpdate(
      {
        _id: user._id,
        resetPasswordJti: userData.jti,
        resetPasswordExpires: { $gt: new Date() },
        isActivated: true,
      },
      {
        $set: {
          password: hashedPassword,
        },
        $unset: {
          resetPasswordJti: '',
          resetPasswordExpires: '',
        },
      },
      { new: true }
    );

    if (!updated) {
      throw new ForbiddenError('This password reset link is no longer valid.');
    }
  }
}

export default new UserService();

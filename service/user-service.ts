import UserModel from '../model/User';
import uuid from 'uuid';
import mailService from './mail-service';
import tokenService from './token-service';
import { BadRequestError, UnauthenticatedError } from '../errors';
import UserDTO from '../dto/user-dto';
import bcrypt from 'bcryptjs';

class UserService {
  async registration(name: string, email: string, password: string) {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw new BadRequestError('An account with this email already exists.');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const activationLink = uuid.v4();
    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      activationLink,
    });
    await mailService.sendActivationLink(
      email,
      `${process.env.API_URL}/api/v1/auth/activate/${activationLink}`
    );
    const userdto = new UserDTO(user);
    const tokens = tokenService.generateTokens(userdto.userId, userdto.name);
    await tokenService.saveToken(userdto.userId, tokens.refreshToken);
    return {
      ...tokens,
      user: userdto,
    };
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
}

export default new UserService();

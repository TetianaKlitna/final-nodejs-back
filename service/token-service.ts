import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import TokenModel from '../model/Token';

export interface TokenJwtPayload extends JwtPayload {
  userId: string;
  name: string;
}

class TokenService {
  generateTokens(
    userId: string,
    name: string
  ): { accessToken: string; refreshToken: string } {
    const accessSecret = process.env.JWT_ACCESS_SECRET!;
    const accessExpiresIn = process.env
      .JWT_ACCESS_LIFETIME! as SignOptions['expiresIn'];
    const accessToken = jwt.sign({ userId, name }, accessSecret, {
      expiresIn: accessExpiresIn,
    });
    const refreshSecret = process.env.JWT_REFRESH_SECRET!;
    const refreshExpiresIn = process.env
      .JWT_REFRESH_LIFETIME! as SignOptions['expiresIn'];
    const refreshToken = jwt.sign({ userId, name }, refreshSecret, {
      expiresIn: refreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async saveToken(userId: string, refreshToken: string) {
    const tokenData = await TokenModel.findOne({ user: userId });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }
    const token = await TokenModel.create({ user: userId, refreshToken });
    return token;
  }

  async removeToken(refreshToken: string) {
    const tokenData = await TokenModel.deleteOne({ refreshToken });
    return tokenData;
  }

  async findToken(refreshToken: string) {
    const tokenData = await TokenModel.findOne({ refreshToken });
    return tokenData;
  }

  validateAccessToken(token: string): TokenJwtPayload | null {
    try {
      const userData = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET || ''
      ) as TokenJwtPayload;
      return userData;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  validateRefreshToken(token: string): TokenJwtPayload | null {
    try {
      const userData = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET || ''
      ) as TokenJwtPayload;
      return userData;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}

export default new TokenService();

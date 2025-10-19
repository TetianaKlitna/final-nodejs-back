import UserModel from '../model/User'
import uuid from 'uuid'
import mailService from './mail-service'
import tokenService from './token-service'
import type { ResetTokenJwtPayload, TokenJwtPayload } from './token-service'
import {
  BadRequestError,
  UnauthenticatedError,
  ForbiddenError
} from '../errors'
import UserDTO from '../dto/user-dto'
import bcrypt from 'bcryptjs'
import ms, { StringValue } from 'ms'
import type { UserDoc } from '../model/User'

class UserService {
  async registration (name: string, email: string, password: string) {
    const candidate = await UserModel.findOne({ email })
    if (candidate) {
      throw new BadRequestError('An account with this email already exists.')
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const activationLink = uuid.v4()
    await UserModel.create({
      name,
      email,
      password: hashedPassword,
      activationLink
    })
    await mailService.sendActivationLink(
      email,
      `${process.env.API_URL}/api/v1/auth/activate/${activationLink}`
    )
  }

  async activate (activationLink: string) {
    const user = await UserModel.findOne({ activationLink })
    if (!user) {
      throw new BadRequestError('Invalid or expired activation link')
    }
    user.isActivated = true
    await user.save()
  }

  async login (email: string, password: string) {
    const user = await UserModel.findOne({ email })
    if (!user) {
      throw new BadRequestError('User with this email was not found')
    }
    const isPassSame = await bcrypt.compare(password, user.password || '')
    if (!isPassSame) {
      throw new BadRequestError('Incorrect password')
    }
    if (!user.isActivated) {
      throw new ForbiddenError('Please verify your email before logging in')
    }
    const userdto = new UserDTO(user)
    const tokens = tokenService.generateTokens(userdto.userId, userdto.name)
    await tokenService.saveToken(userdto.userId, tokens.refreshToken)
    return {
      ...tokens,
      user: userdto
    }
  }

  async logout (refreshToken: string) {
    const token = await tokenService.removeToken(refreshToken)
    return token
  }

  async refresh (refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthenticatedError('Invalid or missing authentication token')
    }
    const userData = tokenService.validateRefreshToken(refreshToken)
    const tokenFromDB = tokenService.findToken(refreshToken)
    if (!userData || !tokenFromDB) {
      throw new UnauthenticatedError('Invalid or missing authentication token')
    }
    const user = await UserModel.findById(userData.userId)
    if (!user) {
      throw new UnauthenticatedError('Invalid token: user does not exist.')
    }
    const userdto = new UserDTO(user)
    const tokens = tokenService.generateTokens(userdto.userId, userdto.name)
    await tokenService.saveToken(userdto.userId, tokens.refreshToken)
    return {
      ...tokens,
      user: userdto
    }
  }

  async forgotPassword (email: string) {
    const user = await UserModel.findOne({ email })
    if (!user) {
      throw new BadRequestError('No account found with this email address.')
    }
    if (!user.isActivated) {
      throw new ForbiddenError('Please verify your email before logging in')
    }

    const jti = uuid.v4()
    const expiresIn = process.env.JWT_RESET_LIFETIME || '15m'
    user.resetPasswordJti = jti
    user.resetPasswordExpires = new Date(
      Date.now() + ms(expiresIn as StringValue)
    )
    await user.save()

    const userId = user._id.toString()
    const resetToken = tokenService.generateResetToken(userId, jti)
    await mailService.sendResetPasswordLink(
      email,
      `${process.env.CLIENT_URL}/resetPassword?token=${encodeURIComponent(
        resetToken
      )}&email=${encodeURIComponent(email)}`
    )
  }

  async resetPassword (email: string, token: string, newPassword: string) {
    const userData = tokenService.validateResetToken(
      token
    ) as ResetTokenJwtPayload | null
    if (!userData) {
      throw new UnauthenticatedError('Invalid or missing reset token')
    }

    const user = await UserModel.findById(userData.userId)
    if (!user) {
      throw new BadRequestError('This reset link is invalid or has expired.')
    }

    const normalizedEmail = email.trim().toLowerCase()
    if (user.email !== normalizedEmail) {
      throw new BadRequestError('Email does not match.')
    }

    if (!user.isActivated) {
      throw new ForbiddenError('Please verify your email before logging in.')
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    const updated = await UserModel.findOneAndUpdate(
      {
        _id: user._id,
        resetPasswordJti: userData.jti,
        resetPasswordExpires: { $gt: new Date() },
        isActivated: true
      },
      {
        $set: {
          password: hashedPassword
        },
        $unset: {
          resetPasswordJti: '',
          resetPasswordExpires: ''
        }
      },
      { new: true }
    )

    if (!updated) {
      throw new ForbiddenError('This password reset link is no longer valid.')
    }
  }

  async getCurrentUser (refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthenticatedError('Access token missing')
    }

    const payload = tokenService.validateRefreshToken(
      refreshToken
    ) as TokenJwtPayload
    if (!payload) {
      throw new UnauthenticatedError('Invalid or expired token')
    }

    const user = await UserModel.findById(payload.userId).select('name email')
    if (!user) {
      throw new UnauthenticatedError('User not found')
    }

    const userdto = new UserDTO(user)
    return { user: userdto }
  }

  async googleLogin (email: string, fullName: string, googleId: string) {
    let user = await UserModel.findOne({ email })
    if (user && user.provider !== 'google') {
      throw new BadRequestError('This email is already registered.')
    }
    if (user && user.googleId !== googleId) {
      user.googleId = googleId
      await user.save()
    }
    if (!user) {
      user = await UserModel.create({
        email,
        name: fullName,
        googleId,
        provider: 'google',
        isActivated: true
      })
    }
    const userdto = new UserDTO(user)
    const tokens = tokenService.generateTokens(userdto.userId, userdto.name)
    await tokenService.saveToken(userdto.userId, tokens.refreshToken)
    return {
      ...tokens,
      user: userdto
    }
  }
}

export default new UserService()

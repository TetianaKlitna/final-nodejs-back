import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import userService from '../service/user-service'
import { validationResult } from 'express-validator'
import ms, { StringValue } from 'ms'
import uuid from 'uuid'
import passport from '../config/passport'
import { BadRequestError } from '../errors'

class AuthController {
  async register (req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: errors
          .array()
          .map(err => err.msg)
          .join(', ')
      })
    }
    const { name, email, password } = req.body
    await userService.registration(name, email, password)

    res.status(StatusCodes.CREATED).json({ success: true })
  }

  async login (req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body
    const userData = await userService.login(email, password)
    const expiresIn = process.env.JWT_REFRESH_LIFETIME || '2d'
    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: ms(expiresIn as StringValue),
      httpOnly: true,
      secure: true,
      sameSite: 'lax'
    })
    res.status(StatusCodes.OK).json({ ...userData })
  }

  async logout (req: Request, res: Response, next: NextFunction) {
    const { refreshToken } = req.cookies
    await userService.logout(refreshToken)
    res.clearCookie('refreshToken')
    return res.status(StatusCodes.OK).json({ success: true })
  }

  async activate (req: Request, res: Response, next: NextFunction) {
    const activationLink = req.params.link
    await userService.activate(activationLink)
    return res.redirect(`${process.env.CLIENT_URL}/login` as string)
  }

  async refresh (req: Request, res: Response, next: NextFunction) {
    const { refreshToken } = req.cookies
    const userData = await userService.refresh(refreshToken)
    const expiresIn = process.env.JWT_REFRESH_LIFETIME || '2d'
    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: ms(expiresIn as StringValue),
      httpOnly: true
    })
    res.status(StatusCodes.OK).json({ ...userData })
  }

  async forgotPassword (req: Request, res: Response, next: NextFunction) {
    const { email } = req.body
    await userService.forgotPassword(email)
    res.status(StatusCodes.OK).json({ success: true })
  }

  async resetPassword (req: Request, res: Response, next: NextFunction) {
    const { email, token, newPassword } = req.body
    await userService.resetPassword(email, token, newPassword)
    res.status(StatusCodes.OK).json({ success: true })
  }

  async getCurrentUser (req: Request, res: Response, next: NextFunction) {
    const { accessToken } = req.cookies
    const userData = await userService.getCurrentUser(accessToken)
    res.status(StatusCodes.OK).json({ ...userData })
  }

  async googleAuth (req: Request, res: Response, next: NextFunction) {
    const state = uuid.v4()
    res.cookie('oauthState', state, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000 // 15 min
    })
    passport.authenticate('google', {
      scope: ['email', 'profile'],
      state,
      session: false
    })(req, res, next)
  }

  async googleCallback (req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      'google',
      { session: false },
      async (err, userProfile) => {
        if (err) return next(err)
        if (!userProfile)
          return res.redirect(`${process.env.CLIENT_URL}/login?auth=failed`)

        const cookieState = req.cookies['oauthState']
        const stateFromGoogle = req.query.state
        if (!cookieState || cookieState !== stateFromGoogle) {
          return res.redirect(
            `${process.env.CLIENT_URL}/login?auth=state_mismatch`
          )
        }
        res.clearCookie('oauthState', { path: '/' })

        const email = userProfile.emails?.[0]?.value?.trim()?.toLowerCase()
        const name = `${userProfile.name?.givenName} ${userProfile.name?.familyName}`
        const googleId = userProfile.id

        if (!googleId) {
          return res.redirect(`${process.env.CLIENT_URL}/login?auth=missing_id`)
        }
        let userData
        try {
          userData = await userService.googleLogin(email, name, googleId)
        } catch (error) {
          console.error(error)
          if (
            error instanceof BadRequestError &&
            error.message === 'This email is already registered.'
          ) {
            return res.redirect(
              `${process.env.CLIENT_URL}/login?auth=email_exists`
            )
          }
          return res.redirect(`${process.env.CLIENT_URL}/login?auth=user_error`)
        }
        const expiresInAccess = process.env.JWT_ACCESS_LIFETIME || '30m'
        const expiresInRefresh = process.env.JWT_REFRESH_LIFETIME || '2d'
        res.cookie('accessToken', userData.accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: ms(expiresInAccess as StringValue)
        })
        res.cookie('refreshToken', userData.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/auth/refresh',
          maxAge: ms(expiresInRefresh as StringValue)
        })

        return res.redirect(`${process.env.CLIENT_URL}`)
      }
    )(req, res, next)
  }
}

export default new AuthController()

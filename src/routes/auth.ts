import express from 'express'
import { body } from 'express-validator'
import authController from '../controllers/auth'

const authRouter = express.Router()

authRouter.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
      })
      .withMessage(
        'Password must be at least 8 chars and include uppercase, lowercase, number, and symbol.'
      )
  ],
  authController.register
)
authRouter.post('/login', authController.login)
authRouter.post('/logout', authController.logout)
authRouter.get('/activate/:link', authController.activate)
authRouter.get('/user', authController.getCurrentUser)
authRouter.post('/refresh', authController.refresh)
authRouter.post('/forgotPassword', authController.forgotPassword)
authRouter.post('/resetPassword', authController.resetPassword)
authRouter.get('/google', authController.googleAuth)
authRouter.get('/google/callback', authController.googleCallback)

export default authRouter

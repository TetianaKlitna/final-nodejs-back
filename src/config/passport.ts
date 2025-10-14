import passport from 'passport'
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const CALLBACK_URL = `${process.env.API_URL}/api/v1/auth/google/callback`

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((obj: Express.User, done) => {
  done(null, obj)
})

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL
    },
    async (
      accessToken: string,
      refreshToken: string,
      userProfile: Profile,
      done
    ) => {
      return done(null, userProfile)
    }
  )
)

export default passport

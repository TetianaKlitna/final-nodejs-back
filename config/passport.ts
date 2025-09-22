import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import User from '../model/User';

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj: Express.User, done) => {
  done(null, obj);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: `${process.env.API_URL}/api/v1/auth/google/callback`,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done
    ) => {
      const { email, name } = profile._json;
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name,
          email,
          provider: 'google',
        });
      }
      return done(null, user);
    }
  )
);

export default passport;

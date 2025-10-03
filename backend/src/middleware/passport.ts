// Temporarily disabled to fix production issues
// import passport from 'passport';
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../database/client';
import { config } from '../config';
import { JWTUtil } from '../utils/jwt';

// Temporarily disabled Google OAuth Strategy
/*
passport.use('google', new GoogleStrategy({
  clientID: config.oauth.google.clientId || 'dummy-client-id',
  clientSecret: config.oauth.google.clientSecret || 'dummy-client-secret',
  callbackURL: `http://localhost:3001/api/auth/google/callback`
}, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      const { id, displayName, emails, photos } = profile;
      
      if (!emails || emails.length === 0) {
        return done(new Error('No email found in Google profile'), undefined);
      }
      
      const email = emails[0].value;
      const avatar = photos && photos.length > 0 ? photos[0].value : null;
      
      // Check if user already exists with this Google ID
      let user = await prisma.user.findUnique({
        where: { googleId: id }
      });
      
      if (user) {
        // Update user info if needed
        if (user.email !== email || user.name !== displayName || user.avatar !== avatar) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              email: email.toLowerCase(),
              name: displayName,
              avatar,
              isVerified: true
            }
          });
        }
        return done(null, user);
      }
      
      // Check if user exists with this email but different provider
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      
      if (existingUser) {
        // Link Google account to existing user
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            googleId: id,
            avatar,
            isVerified: true
          }
        });
        return done(null, user);
      }
      
      // Create new user
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: '', // Empty password for OAuth users
          name: displayName,
          avatar,
          googleId: id,
          credits: 10,
          isActive: true,
          isVerified: true
        }
      });
      
      return done(null, user);
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, undefined);
    }
  }));
*/

// Temporarily disabled passport functions
const passport = {
  use: () => {},
  serializeUser: () => {},
  deserializeUser: () => {}
};

// Serialize user for session
// passport.serializeUser((user: any, done: any) => {
//   done(null, user.id);
// });

// Deserialize user from session
// passport.deserializeUser(async (id: string, done: any) => {
//   try {
//     const user = await prisma.user.findUnique({
//       where: { id }
//     });
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });

export default passport;

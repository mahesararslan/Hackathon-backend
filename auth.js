import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
// import { PrismaClient } from '@prisma/client';
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config();

// const prisma = new PrismaClient();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback: true
  },
  async function (request, accessToken, refreshToken, profile, done) {
    try {
        // If user doesn't exist by googleId, check by email
        let user = await prisma.user.findUnique({
          where: {
            email: profile.email,
          },
        });

    //     // If no user, create a new one
        if (!user) {
          const firstName = profile.name.split("")[0];
          const lastName = profile.name.split("")[1];

          user = await prisma.user.create({
            data: {
              email: profile.email,
              firstName: firstName,
              lastName: lastName,
              // Additional fields can be set here as needed
            },
          });
        } 
        
        
        const token = jwt.sign({ id: user.id, email:user.email }, process.env.JWT_SECRET)



    //   // Proceed with user sign-in
      return done(null, {token});
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

export default passport;

{/* <GoogleButton label={"Sign up with Google"} onClick={(event: any) => {
            event.preventDefault();
            window.location.href = `http://localhost:3000/auth/google`;
        }} /> */}
import { Request } from 'express';
import passport from 'passport';
import passportJWT from 'passport-jwt';
import passportBearer from 'passport-http-bearer';
import { SECRET } from '../config';
import UserRepo from '../data/database/repository/UserRepo';

const JWTStrategy = passportJWT.Strategy;
const BearerStrategy = passportBearer.Strategy;

const cookieExtractor = (req: Request) => {
  let jwt = null;
  if (req && req.cookies) {
    jwt = req.cookies['jwt'];
  }
  return jwt;
};

passport.use(
  'jwt',
  new JWTStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: SECRET,
    },
    (jwtPayload, done) => {
      const { expiration } = jwtPayload;

      if (Date.now() > expiration) {
        done('Unauthorized', false);
      }
      UserRepo.findByEmail(jwtPayload.email).then((user) => {
        if (user) {
          return done(undefined, user, jwtPayload);
        } else {
          return done(undefined, false);
        }
      });
    },
  ),
);

passport.use(
  'bearer',
  new BearerStrategy(function (token, done) {
    UserRepo.findByApiKey(token).then((user) => {
      if (!user) {
        return done('Unauthorized', false);
      }
      return done(null, user);
    });
  }),
);

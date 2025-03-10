import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import passport from 'passport';
import passportJWT from 'passport-jwt';
import passportBearer from 'passport-http-bearer';
import MockStrategy from 'passport-mock-strategy';
import { Request } from 'express';
import { SECRET } from '../../../config';
import { IUserRepository, USER_REPOSITORY } from '../../users';

@Injectable()
export class PassportInitService implements OnModuleInit {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository
  ) {}

  onModuleInit() {
    this.initializePassport();
  }

  private initializePassport() {
    const JWTStrategy = process.env.NODE_ENV === 'test' ? MockStrategy : passportJWT.Strategy;
    const BearerStrategy = process.env.NODE_ENV === 'test' ? MockStrategy : passportBearer.Strategy;

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
          this.userRepository.findByEmail(jwtPayload.email).then((user) => {
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
      new BearerStrategy((token, done) => {
        this.userRepository.findByApiKey(token).then((user) => {
          if (!user) {
            return done('Unauthorized', false);
          }
          return done(null, user);
        });
      }),
    );
  }
}
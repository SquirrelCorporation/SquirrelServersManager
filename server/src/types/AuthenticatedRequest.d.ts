import User from '../data/database/model/User';

declare global {
  namespace Express {
    export interface Request {
      user: User;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    user: string | null;
  }
}

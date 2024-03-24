import { Session } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    user: string | null;
  }
}

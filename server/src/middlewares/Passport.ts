import passport from 'passport';

// This file is kept for backward compatibility
// The actual passport initialization is now handled by PassportInitService
export default passport;

export const cookieExtractor = (req: any) => {
  let jwt = null;
  if (req && req.cookies) {
    jwt = req.cookies['jwt'];
  }
  return jwt;
};

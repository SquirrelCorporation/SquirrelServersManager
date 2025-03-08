import { Request } from 'express';

/**
 * Extracts JWT token from a request using Authorization header or cookies
 */
export function extractJwtFromRequest(req: Request): string {
  // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Then check for cookie
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return '';
}
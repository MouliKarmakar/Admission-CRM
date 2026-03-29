import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Option A: Use a type alias (often cleaner for Express)
export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  // Use 'as AuthRequest' to tell TS this request will hold user data later
  const authReq = req as AuthRequest;
  
  // Note: Using req.header() is correct, but let's ensure TS sees it.
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    authReq.user = decoded as any;
    next();
  } catch (ex) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;

    if (!authReq.user || !roles.includes(authReq.user.role)) {
      res.status(403).json({ error: 'Access denied. You do not have permission to perform this action.' });
      return;
    }
    next();
  };
};
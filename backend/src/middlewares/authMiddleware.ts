import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import catchAsync from '../utils/catchAsync';

interface JwtPayload {
  id: string;
}

// 1. Check if user is logged in (Valid Token)
export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    // Get user from token and attach to req.user (ignoring password)
    req.user = await User.findById(decoded.id).select('-password') || undefined;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed or expired' });
  }
});

// 2. Check if user has the right role (Admin/Ustad/Student)
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role (${req.user?.role}) is not authorized to access this route` 
      });
    }
    next();
  };
};
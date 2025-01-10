const jwt = require('jsonwebtoken');
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET: string = process.env.JWT_SECRET || (() => {
  throw new Error("JWT_SECRET is not defined in the environment variables");
})();

export default function loggedIn(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.auth_token
  if (!token) throw new Error('Unauthorized: No token provided');
  jwt.verify(token, JWT_SECRET as string, (err: any) => {
    if (err) throw new Error('Unauthorized: Invalid token');
    next();
  });
}
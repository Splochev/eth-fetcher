import { Request, Response, NextFunction } from 'express';

export default async function globalTry(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
    req: Request, res: Response, next: NextFunction
) {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error);
    }
}

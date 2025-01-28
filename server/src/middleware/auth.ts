import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}

export const authenticateToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> | void => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Access token not found'
            });
            return;
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'fallback_secret'
        ) as { userId: string };

        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({
            success: false,
            error: 'Invalid token'
        });
        return;
    }
}; 

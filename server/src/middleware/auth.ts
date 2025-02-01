import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: any;
    guestToken?: string;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ success: false, message: '인증 토큰이 없습니다.' });
        }

        const [type, token] = authHeader.split(' ');

        if (type === 'Bearer') {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            req.user = decoded;
            return next();
        }

        return res.status(401).json({ success: false, message: '잘못된 토큰 형식입니다.' });
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ success: false, message: '인증에 실패했습니다.' });
    }
};

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ success: false, message: '인증 토큰이 없습니다.' });
        }

        const [type, token] = authHeader.split(' ');

        if (type === 'Guest') {
            // 게스트 토큰 처리
            req.guestToken = token;
            return next();
        }

        if (type !== 'Bearer') {
            return res.status(401).json({ success: false, message: '잘못된 토큰 형식입니다.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ success: false, message: '인증에 실패했습니다.' });
    }
}; 

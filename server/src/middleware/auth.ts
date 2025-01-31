import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '401435201024-8i8n4sc165h4v52qnhmqlf411nkbrk92.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        name?: string;
        picture?: string;
    };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log('토큰 없음:', req.headers);
            res.status(401).json({ success: false, error: '인증 토큰이 필요합니다.' });
            return;
        }

        const token = authHeader.split(' ')[1];
        console.log('토큰 검증 시도:', token.substring(0, 50) + '...');

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        if (!payload) {
            console.log('페이로드 없음');
            res.status(401).json({ success: false, error: '유효하지 않은 토큰입니다.' });
            return;
        }

        console.log('페이로드 확인:', {
            sub: payload.sub,
            email: payload.email,
            name: payload.name
        });

        req.user = {
            userId: payload.sub,
            email: payload.email || '',
            name: payload.name,
            picture: payload.picture
        };

        console.log('인증 성공:', req.user);
        next();
    } catch (error) {
        console.error('인증 오류:', error);
        res.status(403).json({
            success: false,
            error: '인증에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
}; 

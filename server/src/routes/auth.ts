import { Router, Request, Response, RequestHandler } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';

interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}

const router = Router();
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const googleAuthHandler: RequestHandler = async (req, res): Promise<void> => {
    const { credential } = req.body;
    
    if (!credential) {
        console.error('No credential provided');
        res.status(400).json({
            success: false,
            error: 'No credential provided'
        });
        return;
    }

    try {
        console.log('Verifying token with client ID:', GOOGLE_CLIENT_ID);
        
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        if (!payload) {
            console.error('Invalid token payload');
            res.status(400).json({
                success: false,
                error: 'Invalid token payload'
            });
            return;
        }

        console.log('Token payload:', {
            email: payload.email,
            name: payload.name,
            sub: payload.sub
        });

        let user = await User.findOne({ email: payload.email });
        if (!user) {
            console.log('Creating new user for:', payload.email);
            user = await User.create({
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                googleId: payload.sub
            });
        }

        const token = jwt.sign(
            { userId: user._id.toString() },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: 24 * 60 * 60 }
        );

        console.log('Login successful for:', payload.email);

        res.json({
            success: true,
            data: {
                token,
                user: {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    picture: user.picture
                }
            }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({
            success: false,
            error: 'Authentication failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

router.post('/google', googleAuthHandler);

// 현재 로그인한 사용자 정보 조회
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: '인증되지 않은 사용자입니다.'
            });
            return;
        }

        const user = await User.findById(req.user.userId)
            .select('-password -googleId');

        if (!user) {
            res.status(404).json({
                success: false,
                error: '사용자를 찾을 수 없습니다.'
            });
            return;
        }

        res.json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    picture: user.picture
                }
            }
        });
    } catch (error) {
        console.error('사용자 정보 조회 오류:', error);
        res.status(500).json({
            success: false,
            error: '사용자 정보 조회 중 오류가 발생했습니다.'
        });
    }
});

// 로그아웃
router.post('/logout', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        // 클라이언트에서 토큰을 제거하도록 지시
        res.json({
            success: true,
            message: '로그아웃 되었습니다.'
        });
    } catch (error) {
        console.error('로그아웃 오류:', error);
        res.status(500).json({
            success: false,
            error: '로그아웃 처리 중 오류가 발생했습니다.'
        });
    }
});

export default router; 

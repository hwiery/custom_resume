import express, { Request, Response, Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router: Router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface GoogleAuthRequest extends Request {
    body: {
        credential: string;
    };
}

// 구글 로그인 라우터
router.post('/google', (req: GoogleAuthRequest, res: Response) => {
    const handleGoogleAuth = async () => {
        try {
            const { credential } = req.body;
            console.log('Received credential:', credential);
            
            if (!credential) {
                return res.status(400).json({
                    success: false,
                    error: '인증 정보가 없습니다.'
                });
            }

            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            
            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                return res.status(400).json({
                    success: false,
                    error: '유효하지 않은 토큰입니다.'
                });
            }

            let user = await User.findOne({ email: payload.email });
            
            if (!user) {
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
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                success: true,
                data: {
                    token,
                    user: {
                        email: user.email,
                        name: user.name,
                        picture: user.picture,
                        googleId: user.googleId
                    }
                }
            });
        } catch (error) {
            console.error('Google auth error:', error);
            return res.status(401).json({
                success: false,
                error: '인증에 실패했습니다.'
            });
        }
    };

    handleGoogleAuth();
});

export default router; 

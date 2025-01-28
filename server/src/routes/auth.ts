import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt, { SignOptions } from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { Secret } from 'jsonwebtoken';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface JwtPayload {
    userId: string;
}

// 구글 로그인
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;
        
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        if (!payload) {
            throw new Error('Invalid token payload');
        }

        let user: IUser | null = await User.findOne({ email: payload.email });
        
        if (!user) {
            user = await User.create({
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                googleId: payload.sub
            });
        }

        const jwtPayload: JwtPayload = { userId: user._id.toString() };
        const secret: Secret = process.env.JWT_SECRET || 'fallback_secret';
        const expiresIn = process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN) : 86400; // 24시간
        const options: SignOptions = { expiresIn };
        const token = jwt.sign(jwtPayload, secret, options);

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
            error: 'Authentication failed'
        });
    }
});

export default router; 

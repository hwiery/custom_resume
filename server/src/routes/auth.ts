import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const client = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID);

// 구글 로그인
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.REACT_APP_GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid token payload');
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

    // Access Token 생성
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Refresh Token 생성
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    // Refresh Token을 사용자 문서에 저장
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      data: {
        token,
        refreshToken,
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

// 토큰 갱신
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new Error('Refresh token not provided');
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    // 새로운 액세스 토큰 발급
    const newToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token refresh failed'
    });
  }
});

// 토큰 검증
router.get('/validate', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-refreshToken');
    
    if (!user) {
      throw new Error('User not found');
    }

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

// 로그아웃
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

export default router; 
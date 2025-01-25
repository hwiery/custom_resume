const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// 정적 파일 서빙 설정
app.use(express.static(path.join(__dirname, 'build')));

// API 라우트
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// 구글 로그인 처리
app.post('/api/auth/google', async (req, res) => {
    try {
        const { token, email, name, picture } = req.body;
        
        if (!token || !email) {
            return res.status(400).json({ message: 'Invalid request data' });
        }

        console.log('Received login request:', { email, name });

        // 여기서 사용자 정보를 데이터베이스에 저장하거나 업데이트할 수 있습니다
        const user = {
            email,
            name,
            picture,
            id: email // 임시로 이메일을 ID로 사용
        };

        // JWT 토큰 생성
        const sessionToken = jwt.sign(
            { userId: user.id },
            'your-secret-key', // 실제 환경에서는 환경 변수에서 가져와야 합니다
            { expiresIn: '24h' }
        );

        // 쿠키에 토큰 설정
        res.cookie('auth_token', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24시간
        });

        console.log('Login successful:', user);
        res.json(user);
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ message: 'Authentication failed', error: error.message });
    }
});

// 토큰 검증
app.get('/api/auth/verify', (req, res) => {
    try {
        const token = req.cookies.auth_token;
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, 'your-secret-key');
        res.json({ valid: true, userId: decoded.userId });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// 로그아웃
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ message: 'Logged out successfully' });
});

// SPA를 위한 catch-all 라우트
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API is available at http://localhost:${PORT}/api`);
}); 
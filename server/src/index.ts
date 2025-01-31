import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';

dotenv.config();

const app = express();

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 1000, // 15분 동안 최대 1000개의 요청 허용
    message: { 
        success: false, 
        error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.' 
    }
});

// 미들웨어
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());
app.use(limiter);

// 데이터베이스 연결
connectDB();

// 기본 상태 확인 라우트
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: '서버가 정상적으로 실행 중입니다.' });
});

// API 라우트
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

const PORT = 5000;  // 포트를 5000으로 고정

app.listen(PORT, () => {
    console.log(`서버가 ${process.env.NODE_ENV} 모드로 포트 ${PORT}에서 실행 중입니다`);
}); 

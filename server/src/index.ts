import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRouter from './routes/auth';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS 설정
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우터
app.use('/api/auth', authRouter);

// 서버 상태 체크
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resumer')
    .then(() => console.log('MongoDB 연결 성공'))
    .catch((err) => console.error('MongoDB 연결 실패:', err));

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 

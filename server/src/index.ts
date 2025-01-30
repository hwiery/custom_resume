import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import chatRoutes from './routes/chat';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS 설정
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// 라우트 설정
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);

// MongoDB 연결
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        console.log('MongoDB 연결 시도 중...');
        console.log('MongoDB URI:', mongoURI?.split('@')[1]);

        if (!mongoURI) {
            throw new Error('MongoDB URI가 설정되지 않았습니다.');
        }

        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4  // IPv4 강제 사용
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB 연결 오류:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB 연결이 끊어졌습니다. 재연결을 시도합니다.');
            connectDB();
        });

        const db = mongoose.connection;
        console.log('MongoDB 연결 성공:', db.host);
        console.log('데이터베이스 이름:', db.name);
        console.log('연결 상태:', db.readyState);

    } catch (error) {
        console.error('MongoDB 연결 실패:', error);
        // 5초 후 재시도
        setTimeout(connectDB, 5000);
    }
};

// 서버 시작
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`서버가 ${process.env.NODE_ENV} 모드로 포트 ${PORT}에서 실행 중입니다`);
        });
    } catch (error) {
        console.error('서버 시작 실패:', error);
        process.exit(1);
    }
};

// 프로세스 종료 처리
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB 연결이 안전하게 종료되었습니다.');
        process.exit(0);
    } catch (err) {
        console.error('MongoDB 연결 종료 중 오류:', err);
        process.exit(1);
    }
});

startServer(); 

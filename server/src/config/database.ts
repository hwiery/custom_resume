import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        console.log('MongoDB 연결 시도 중...');
        console.log('MongoDB URI:', process.env.MONGODB_URI?.split('@')[1] || 'URI not found');

        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        const conn = await mongoose.connect(process.env.MONGODB_URI as string);
        console.log(`MongoDB 연결 성공: ${conn.connection.host}`);
        console.log('데이터베이스 이름:', conn.connection.name);
        console.log('연결 상태:', conn.connection.readyState);
        
        // 연결 이벤트 리스너 추가
        mongoose.connection.on('error', err => {
            console.error('MongoDB 연결 오류:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB 연결이 끊어졌습니다. 재연결을 시도합니다.');
            connectDB(); // 재연결 시도
        });

        mongoose.connection.on('connected', () => {
            console.log('MongoDB에 다시 연결되었습니다.');
        });

    } catch (error) {
        console.error('MongoDB 초기 연결 오류:', error);
        console.error('상세 오류:', JSON.stringify(error, null, 2));
        process.exit(1);
    }
};

export default connectDB; 

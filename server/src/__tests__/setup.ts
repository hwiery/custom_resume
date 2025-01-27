import dotenv from 'dotenv';

dotenv.config();

// 테스트 타임아웃 설정
jest.setTimeout(30000);

// 콘솔 에러 무시 설정
console.error = jest.fn();

// 환경 변수 설정
process.env.JWT_SECRET = 'test_secret';
process.env.NODE_ENV = 'test'; 
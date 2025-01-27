import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index';
import User from '../models/User';
import Chat from '../models/Chat';
import jwt from 'jsonwebtoken';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Chat.deleteMany({});
});

describe('Chat API', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    // 테스트 사용자 생성
    const user = await User.create({
      email: 'test@test.com',
      name: 'Test User',
      googleId: '123456789'
    });
    userId = user._id.toString();
    token = jwt.sign({ userId }, process.env.JWT_SECRET || 'test_secret');
  });

  describe('POST /api/chat/save', () => {
    it('should save chat messages', async () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'RESUMER', content: 'Hi there!' }
      ];

      const response = await request(app)
        .post('/api/chat/save')
        .set('Authorization', `Bearer ${token}`)
        .send({ messages });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('messages');
    });
  });

  describe('GET /api/chat/history', () => {
    it('should get chat history with pagination', async () => {
      // 테스트 채팅 데이터 생성
      await Chat.create({
        userId,
        messages: [{ role: 'user', content: 'Test message' }]
      });

      const response = await request(app)
        .get('/api/chat/history')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('chats');
      expect(response.body.data).toHaveProperty('pagination');
    });
  });
}); 
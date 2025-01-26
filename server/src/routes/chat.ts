import express from 'express';
import Chat from '../models/Chat';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 채팅 저장
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const { messages } = req.body;
    const userId = req.user._id;

    const chat = await Chat.create({
      userId,
      messages,
      createdAt: new Date()
    });

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Chat save error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to save chat' 
    });
  }
});

// 사용자의 채팅 내역 조회
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({ userId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get chat history' 
    });
  }
});

export default router; 
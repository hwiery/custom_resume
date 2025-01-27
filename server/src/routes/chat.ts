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
      error: '채팅 저장에 실패했습니다.' 
    });
  }
});

// 사용자의 채팅 내역 조회 (페이지네이션 적용)
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [chats, total] = await Promise.all([
      Chat.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Chat.countDocuments({ userId })
    ]);

    res.json({
      success: true,
      data: {
        chats,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ 
      success: false,
      error: '채팅 내역 조회에 실패했습니다.' 
    });
  }
});

// 특정 채팅 조회
router.get('/:chatId', authenticateToken, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId: req.user._id
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: '채팅을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Chat detail error:', error);
    res.status(500).json({
      success: false,
      error: '채팅 조회에 실패했습니다.'
    });
  }
});

export default router; 
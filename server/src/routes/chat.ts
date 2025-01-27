import express from 'express';
import Chat from '../models/Chat';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 새 채팅 시작
router.post('/start', authenticateToken, async (req, res) => {
  try {
    const { messages } = req.body;
    const firstMessage = messages[0].content;
    // 첫 메시지의 일부를 제목으로 사용
    const title = firstMessage.length > 30 
      ? `${firstMessage.substring(0, 30)}...` 
      : firstMessage;

    const chat = await Chat.create({
      userId: req.user._id,
      title,
      messages,
      createdAt: new Date()
    });

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Chat start error:', error);
    res.status(500).json({ 
      success: false,
      error: '채팅 시작에 실패했습니다.' 
    });
  }
});

// 채팅 메시지 추가
router.post('/:chatId/message', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
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

    chat.messages.push(message);
    await chat.save();

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Message add error:', error);
    res.status(500).json({
      success: false,
      error: '메시지 추가에 실패했습니다.'
    });
  }
});

// 채팅 히스토리 조회
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [chats, total] = await Promise.all([
      Chat.find({ userId: req.user._id })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title lastMessage lastMessageDate createdAt updatedAt'),
      Chat.countDocuments({ userId: req.user._id })
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
      error: '채팅 히스토리 조회에 실패했습니다.'
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
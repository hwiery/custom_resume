import express from 'express';
import Chat from '../models/Chat';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 채팅 저장
router.post('/save', authenticateToken, async (req, res) => {
    try {
        const { messages, sessionId } = req.body;
        const userId = req.user._id;

        let chat = await Chat.findOne({ userId, sessionId });

        if (chat) {
            chat.messages = messages;
            await chat.save();
        } else {
            chat = await Chat.create({
                userId,
                sessionId,
                messages
            });
        }

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

// 채팅 목록 조회 (페이지네이션)
router.get('/list', authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [chats, total] = await Promise.all([
            Chat.find({ userId, isArchived: false })
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit),
            Chat.countDocuments({ userId, isArchived: false })
        ]);

        res.json({
            success: true,
            data: {
                chats,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Chat list error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get chat list'
        });
    }
});

// 특정 채팅 조회
router.get('/:sessionId', authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;

        const chat = await Chat.findOne({ userId, sessionId });
        
        if (!chat) {
            return res.status(404).json({
                success: false,
                error: 'Chat not found'
            });
        }

        res.json({
            success: true,
            data: chat
        });
    } catch (error) {
        console.error('Chat get error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get chat'
        });
    }
});

// 채팅 삭제 (아카이브)
router.delete('/:sessionId', authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;

        const chat = await Chat.findOne({ userId, sessionId });
        
        if (!chat) {
            return res.status(404).json({
                success: false,
                error: 'Chat not found'
            });
        }

        chat.isArchived = true;
        await chat.save();

        res.json({
            success: true,
            message: 'Chat archived successfully'
        });
    } catch (error) {
        console.error('Chat delete error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete chat'
        });
    }
});

// 메시지 추가
router.post('/:sessionId/messages', authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { text, sender } = req.body;
        const userId = req.user._id;

        const chat = await Chat.findOne({ userId, sessionId });
        
        if (!chat) {
            return res.status(404).json({
                success: false,
                error: 'Chat not found'
            });
        }

        chat.messages.push({
            text,
            sender,
            timestamp: new Date()
        });

        await chat.save();

        res.json({
            success: true,
            data: chat
        });
    } catch (error) {
        console.error('Message add error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add message'
        });
    }
});

export default router; 
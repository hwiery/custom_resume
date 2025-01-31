import express, { Request, Response, Router, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import Chat from '../models/Chat';
import mongoose from 'mongoose';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// DB 연결 테스트
router.get('/test-db', async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. DB 연결 상태 확인
        const dbState = mongoose.connection.readyState;
        const dbStatus: { [key: number]: string } = {
            0: "연결 끊김",
            1: "연결됨",
            2: "연결 중",
            3: "연결 끊는 중",
            99: "연결 실패"
        };

        // 2. Chat 컬렉션의 문서 수 확인
        const chatCount = await Chat.countDocuments();

        res.json({
            success: true,
            data: {
                dbConnection: dbStatus[dbState] || "알 수 없는 상태",
                connectionString: process.env.MONGODB_URI?.split('@')[1] || "URI not found",
                chatCount,
                readyState: dbState
            }
        });
    } catch (error) {
        console.error('DB 테스트 오류:', error);
        res.status(500).json({ 
            success: false, 
            error: 'DB 테스트 실패',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});

// DB 상태 확인 (상세)
router.get('/db-status', async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. DB 연결 상태 확인
        const dbState = mongoose.connection.readyState;
        const dbStatus: { [key: number]: string } = {
            0: "연결 끊김",
            1: "연결됨",
            2: "연결 중",
            3: "연결 끊는 중",
            99: "연결 실패"
        };

        // 2. 최근 채팅 목록 조회 (최대 5개)
        const recentChats = await Chat.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('_id userId messages.content messages.timestamp messages.isUser createdAt')
            .lean();

        // 3. 통계 정보
        const totalChats = await Chat.countDocuments();
        const totalMessages = await Chat.aggregate([
            {
                $project: {
                    messageCount: { $size: "$messages" }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$messageCount" }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                connection: {
                    status: dbStatus[dbState] || "알 수 없는 상태",
                    readyState: dbState,
                    host: mongoose.connection.host,
                    name: mongoose.connection.name
                },
                stats: {
                    totalChats,
                    totalMessages: totalMessages[0]?.total || 0
                },
                recentChats: recentChats.map(chat => ({
                    ...chat,
                    messageCount: chat.messages.length,
                    lastMessage: chat.messages[chat.messages.length - 1]
                }))
            }
        });
    } catch (error) {
        console.error('DB 상태 확인 오류:', error);
        res.status(500).json({
            success: false,
            error: 'DB 상태 확인 실패',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});

// 채팅 목록 조회
router.get('/', authenticateToken, (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
    }

    const userId = req.user.userId;
    Chat.find({ userId }).sort({ updatedAt: -1 })
        .then(chats => {
            res.json({ success: true, data: chats });
        })
        .catch(next);
});

// 새 채팅 생성
router.post('/', authenticateToken, (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
    }

    const userId = req.user.userId;
    const { title } = req.body;

    const chat = new Chat({
        userId,
        title: title || '새로운 채팅',
        messages: []
    });

    chat.save()
        .then(savedChat => {
            res.json({ success: true, data: savedChat });
        })
        .catch(next);
});

// 채팅에 메시지 추가
router.post('/:chatId/messages', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'User not authenticated' });
            return;
        }

        console.log('메시지 추가 시도:', {
            chatId: req.params.chatId,
            userId: req.user.userId,
            message: req.body.message
        });

        const { chatId } = req.params;
        const { role, content } = req.body;
        const userId = req.user.userId;

        const chat = await Chat.findOne({ _id: chatId, userId });
        if (!chat) {
            console.log('채팅을 찾을 수 없음:', {
                chatId: req.params.chatId,
                userId: req.user.userId
            });
            res.status(404).json({ success: false, error: 'Chat not found' });
            return;
        }
        
        chat.messages.push({ role, content });
        await chat.save();
        
        console.log('메시지 추가 완료:', {
            chatId: chat._id,
            userId: chat.userId,
            totalMessages: chat.messages.length
        });

        res.json({ success: true, data: chat });
    } catch (error) {
        console.error('메시지 추가 오류:', error);
        res.status(500).json({ success: false, error: 'Failed to add message' });
    }
});

// Deepseek API 프록시 엔드포인트
router.post('/proxy/deepseek', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: '인증이 필요합니다.' });
            return;
        }

        const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
        
        if (!DEEPSEEK_API_KEY) {
            console.error('Deepseek API 키가 설정되지 않았습니다.');
            res.status(500).json({
                success: false,
                error: 'API 키가 설정되지 않았습니다.'
            });
            return;
        }

        console.log('프록시 요청 수신:', {
            messages: req.body.messages
        });

        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: "deepseek-chat",
            messages: req.body.messages,
            temperature: 0.7,
            max_tokens: 1000
        }, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('프록시 응답 수신:', response.data);
        res.json(response.data);
    } catch (error: any) {
        console.error('Deepseek API 프록시 오류:', error.response?.data || error.message, {
            status: error.response?.status,
            headers: error.response?.headers,
            data: error.response?.data
        });
        
        if (error.response?.status === 401) {
            res.status(401).json({ 
                success: false, 
                error: 'API 키가 유효하지 않습니다.' 
            });
            return;
        }

        if (error.response?.status === 429) {
            res.status(429).json({ 
                success: false, 
                error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' 
            });
            return;
        }

        res.status(error.response?.status || 500).json({ 
            success: false, 
            error: 'Deepseek API 요청 실패',
            details: error.response?.data || error.message
        });
    }
});

// 특정 채팅 상세 조회
router.get('/:chatId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'User not authenticated' });
            return;
        }

        const { chatId } = req.params;
        const userId = req.user.userId;

        const chat = await Chat.findOne({ _id: chatId, userId });
        if (!chat) {
            res.status(404).json({ success: false, error: '채팅을 찾을 수 없습니다.' });
            return;
        }

        res.json({ success: true, data: chat });
    } catch (error: any) {
        console.error('채팅 상세 조회 오류:', error);
        res.status(500).json({ 
            success: false, 
            error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
        });
    }
});

export default router; 
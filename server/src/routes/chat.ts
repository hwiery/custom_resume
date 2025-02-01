import express, { Request, Response, Router, NextFunction } from 'express';
import { authenticateToken, AuthRequest, auth } from '../middleware/auth';
import Chat from '../models/Chat';
import mongoose from 'mongoose';
import axios from 'axios';

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

// DeepSeek 프록시 엔드포인트
router.post('/proxy/deepseek', auth, async (req: AuthRequest, res: Response) => {
    try {
        const guestToken = req.headers['x-guest-token'] as string;
        const guestChatCount = parseInt(req.headers['x-guest-chat-count'] as string || '0');

        // 게스트 사용자 처리
        if (!req.user && guestToken) {
            if (guestChatCount >= 3) {
                return res.status(403).json({
                    success: false,
                    message: '게스트 사용자는 3회까지만 채팅이 가능합니다. 로그인 후 이용해주세요.'
                });
            }
            // 게스트 채팅 카운트 증가
            res.setHeader('x-guest-chat-count', (guestChatCount + 1).toString());
        }

        const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
        if (!DEEPSEEK_API_KEY) {
            throw new Error('DeepSeek API 키가 설정되지 않았습니다.');
        }

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

        res.json(response.data);
    } catch (error) {
        console.error('DeepSeek API 오류:', error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            res.status(401).json({
                success: false,
                message: 'API 인증에 실패했습니다.'
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: '채팅 처리 중 오류가 발생했습니다.'
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
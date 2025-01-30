import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { authenticateToken } from '../middleware/auth';
import Chat, { IChat } from '../models/Chat';
import mongoose from 'mongoose';
import axios from 'axios';
import ChatHistory, { ChatHistoryDocument, ChatHistoryResponse } from '../models/ChatHistory';

interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}

const router = express.Router();

// DB 연결 테스트
router.get('/test-db', async (req: Request, res: Response): Promise<void> => {
    try {
        const dbState = mongoose.connection.readyState;
        const dbStatus: { [key: number]: string } = {
            0: "연결 끊김",
            1: "연결됨",
            2: "연결 중",
            3: "연결 끊는 중",
            99: "연결 실패"
        };

        const [chatCount, historyCount] = await Promise.all([
            Chat.countDocuments(),
            ChatHistory.countDocuments()
        ]);

        res.json({
            success: true,
            data: {
                dbConnection: dbStatus[dbState] || "알 수 없는 상태",
                connectionString: process.env.MONGODB_URI?.split('@')[1] || "URI not found",
                chatCount,
                historyCount,
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
        const dbState = mongoose.connection.readyState;
        const dbStatus: { [key: number]: string } = {
            0: "연결 끊김",
            1: "연결됨",
            2: "연결 중",
            3: "연결 끊는 중",
            99: "연결 실패"
        };

        const recentChats = await Chat.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('content isUser createdAt')
            .lean();

        const totalChats = await Chat.countDocuments();

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
                    totalChats
                },
                recentChats: recentChats.map(chat => ({
                    ...chat,
                    messageCount: 1,
                    lastMessage: chat.content
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

// 사용자의 모든 채팅 가져오기
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'User not authenticated' });
            return;
        }

        const chats = await Chat.find({ userId: req.user.userId });
        res.json({ success: true, data: chats });
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch chats' });
    }
});

// 새로운 채팅 생성
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: '인증되지 않은 사용자입니다.' });
            return;
        }

        console.log('채팅 생성 시도:', {
            userId: req.user.userId,
            message: req.body.message
        });

        const { message } = req.body;
        if (!message) {
            res.status(400).json({ success: false, error: '메시지 내용이 필요합니다.' });
            return;
        }

        const chat = await Chat.create({
            historyId: new mongoose.Types.ObjectId(),
            content: message,
            isUser: true
        });

        console.log('채팅 생성 완료:', {
            chatId: chat._id,
            content: chat.content,
            isUser: chat.isUser
        });

        res.json({ success: true, data: chat });
    } catch (error) {
        console.error('채팅 생성 오류:', error);
        if (error instanceof Error) {
            res.status(500).json({ 
                success: false, 
                error: '채팅 생성 실패', 
                details: error.message 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: '알 수 없는 오류가 발생했습니다.' 
            });
        }
    }
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

        const { message } = req.body;
        const chat = await Chat.findOneAndUpdate(
            { _id: req.params.chatId },
            {
                $set: {
                    content: message,
                    isUser: true
                }
            },
            { new: true }
        );
        
        if (!chat) {
            console.log('채팅을 찾을 수 없음:', {
                chatId: req.params.chatId,
                userId: req.user.userId
            });
            res.status(404).json({ success: false, error: 'Chat not found' });
            return;
        }
        
        console.log('메시지 추가 완료:', {
            chatId: chat._id,
            content: chat.content,
            isUser: chat.isUser
        });

        res.json({ success: true, data: chat });
    } catch (error) {
        console.error('메시지 추가 오류:', error);
        res.status(500).json({ success: false, error: 'Failed to add message' });
    }
});

// Deepseek API 프록시 엔드포인트
router.post('/proxy/deepseek', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
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
            url: 'https://api.deepseek.com/v1/chat/completions',
            body: req.body
        });

        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', req.body, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('프록시 응답 수신:', response.data);
        res.json(response.data);
    } catch (error: any) {
        console.error('Deepseek API 프록시 오류:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ 
            success: false, 
            error: 'Deepseek API 요청 실패',
            details: error.response?.data || error.message
        });
    }
});

// 사용자의 모든 채팅 히스토리 가져오기
const getChatHistories: RequestHandler = async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [histories, total] = await Promise.all([
            ChatHistory.find({ 
                userId: new mongoose.Types.ObjectId(req.user.userId) 
            })
            .select('title lastMessage messageCount createdAt updatedAt')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit),
            ChatHistory.countDocuments({ 
                userId: new mongoose.Types.ObjectId(req.user.userId) 
            })
        ]);
        
        res.json({
            success: true,
            data: {
                histories: histories.map(h => h.toObject()),
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// 특정 채팅 히스토리의 모든 메시지 가져오기
const getChatHistory: RequestHandler = async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        const history = await ChatHistory.findOne({
            _id: new mongoose.Types.ObjectId(req.params.id),
            userId: new mongoose.Types.ObjectId(req.user.userId)
        }) as ChatHistoryDocument | null;

        if (!history) {
            res.status(404).json({
                success: false,
                error: 'Chat history not found'
            });
            return;
        }

        const [messages, total] = await Promise.all([
            Chat.find({ 
                historyId: history._id 
            })
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit),
            Chat.countDocuments({ 
                historyId: history._id 
            })
        ]);

        const response: ChatHistoryResponse = {
            ...history.toObject(),
            messages,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };

        res.json({
            success: true,
            data: response
        });
    } catch (error) {
        next(error);
    }
};

// 새로운 채팅 히스토리 생성
const createChatHistory: RequestHandler = async (req: AuthRequest, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }

        const { content } = req.body;
        
        const history = await ChatHistory.create([{
            userId: new mongoose.Types.ObjectId(req.user.userId),
            title: content.substring(0, 100),
            lastMessage: content,
            messageCount: 1
        }], { session }) as ChatHistoryDocument[];

        const message = await Chat.create([{
            historyId: history[0]._id,
            content,
            isUser: true
        }], { session });

        await session.commitTransaction();
        
        const response: ChatHistoryResponse = {
            ...history[0].toObject(),
            messages: [message[0]]
        };

        res.json({
            success: true,
            data: response
        });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

// 채팅 히스토리에 메시지 추가
const addMessageToChatHistory: RequestHandler = async (req: AuthRequest, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }

        const { content, isUser } = req.body;
        
        const history = await ChatHistory.findOneAndUpdate(
            { 
                _id: new mongoose.Types.ObjectId(req.params.id),
                userId: new mongoose.Types.ObjectId(req.user.userId)
            },
            { 
                $set: { lastMessage: content },
                $inc: { messageCount: 1 }
            },
            { 
                new: true,
                session 
            }
        ) as ChatHistoryDocument | null;

        if (!history) {
            await session.abortTransaction();
            res.status(404).json({
                success: false,
                error: 'Chat history not found'
            });
            return;
        }

        const message = await Chat.create([{
            historyId: history._id,
            content,
            isUser
        }], { session });

        await session.commitTransaction();

        res.json({
            success: true,
            data: message[0]
        });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

router.get('/history', authenticateToken, getChatHistories);
router.get('/history/:id', authenticateToken, getChatHistory);
router.post('/history', authenticateToken, createChatHistory);
router.post('/history/:id/message', authenticateToken, addMessageToChatHistory);

export default router; 
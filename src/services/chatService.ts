import api from '../api/axios';
import { Message, Chat } from '../types/message';
import { ChatError } from '../types/error';

class ChatService {
    private static instance: ChatService;
    private readonly INITIAL_MESSAGE: Message = {
        id: 0,
        text: "안녕하세요! 저는 당신의 이력서 작성을 도와드릴 AI 어시스턴트입니다. 어떤 도움이 필요하신가요?",
        sender: 'RESUMER',
        timestamp: new Date()
    };

    private constructor() {}

    public static getInstance(): ChatService {
        if (!ChatService.instance) {
            ChatService.instance = new ChatService();
        }
        return ChatService.instance;
    }

    private static getTempStorageKey(sessionId: string): string {
        return `temp_chat_${sessionId}`;
    }

    // 임시 채팅 저장
    public saveTempChat(sessionId: string, messages: Message[]): void {
        try {
            localStorage.setItem(
                ChatService.getTempStorageKey(sessionId),
                JSON.stringify(messages)
            );
        } catch (error) {
            throw new ChatError('채팅 임시 저장에 실패했습니다.');
        }
    }

    // 임시 채팅 로드
    public loadTempChat(sessionId: string): Message[] {
        try {
            const stored = localStorage.getItem(ChatService.getTempStorageKey(sessionId));
            if (stored) {
                return JSON.parse(stored);
            }
            return [this.INITIAL_MESSAGE];
        } catch (error) {
            console.error('Error loading temp chat:', error);
            return [this.INITIAL_MESSAGE];
        }
    }

    // 채팅 저장
    public async saveChat(sessionId: string, messages: Message[]): Promise<Chat> {
        try {
            const response = await api.post<{ success: boolean; data: Chat }>('/chat/save', {
                sessionId,
                messages
            });
            return response.data.data;
        } catch (error) {
            throw new ChatError('채팅 저장에 실패했습니다.');
        }
    }

    // 특정 채팅 조회
    public async getChat(sessionId: string): Promise<Chat> {
        try {
            const response = await api.get<{ success: boolean; data: Chat }>(
                `/chat/${sessionId}`
            );
            return response.data.data;
        } catch (error) {
            if ((error as any)?.status === 404) {
                throw new ChatError('채팅을 찾을 수 없습니다.', 'NOT_FOUND', 404);
            }
            throw new ChatError('채팅 조회에 실패했습니다.');
        }
    }

    // 메시지 추가
    public async addMessage(sessionId: string, text: string, sender: 'user' | 'RESUMER'): Promise<Chat> {
        try {
            const response = await api.post<{ success: boolean; data: Chat }>(
                `/chat/${sessionId}/messages`,
                { text, sender }
            );
            return response.data.data;
        } catch (error) {
            throw new ChatError('메시지 추가에 실패했습니다.');
        }
    }

    // 채팅 삭제
    public async deleteChat(sessionId: string): Promise<void> {
        try {
            await api.delete(`/chat/${sessionId}`);
            localStorage.removeItem(ChatService.getTempStorageKey(sessionId));
        } catch (error) {
            throw new ChatError('채팅 삭제에 실패했습니다.');
        }
    }

    // 임시 저장소 정리
    public clearTempStorage(sessionId: string): void {
        try {
            localStorage.removeItem(ChatService.getTempStorageKey(sessionId));
        } catch (error) {
            throw new ChatError('임시 저장소 정리에 실패했습니다.');
        }
    }

    public async getChatResponse(messages: Message[]): Promise<string> {
        // 실제 API 호출 로직으로 대체될 부분
        return "죄송합니다. 현재 서비스 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.";
    }

    public getInitialMessage(): Message {
        return this.INITIAL_MESSAGE;
    }
}

export const chatService = ChatService.getInstance();
export const getChatResponse = (messages: Message[]): Promise<string> => {
    return chatService.getChatResponse(messages);
}; 
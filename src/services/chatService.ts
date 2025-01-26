import { Message } from '../types/message';

class ChatService {
    private static instance: ChatService;
    private readonly TEMP_CHAT_KEY = 'tempChat';
    private readonly INITIAL_MESSAGE: Message = {
        id: 1,
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

    public saveTempChat(sessionId: string, messages: Message[]): void {
        try {
            localStorage.setItem(`${this.TEMP_CHAT_KEY}_${sessionId}`, JSON.stringify(messages));
        } catch (error) {
            console.error('Error saving temp chat:', error);
        }
    }

    public loadTempChat(sessionId: string): Message[] {
        try {
            const savedChat = localStorage.getItem(`${this.TEMP_CHAT_KEY}_${sessionId}`);
            if (savedChat) {
                return JSON.parse(savedChat);
            }
            return [this.INITIAL_MESSAGE];
        } catch (error) {
            console.error('Error loading temp chat:', error);
            return [this.INITIAL_MESSAGE];
        }
    }

    public clearChat(sessionId: string): void {
        try {
            localStorage.removeItem(`${this.TEMP_CHAT_KEY}_${sessionId}`);
        } catch (error) {
            console.error('Error clearing chat:', error);
        }
    }
}

export default ChatService.getInstance(); 
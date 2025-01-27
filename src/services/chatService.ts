import api from './api';
import { Message } from '../types/message';

interface ChatResponse {
  success: boolean;
  data: {
    chats: any[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }
  };
  error?: string;
}

class ChatService {
  static async saveChat(messages: Message[]) {
    try {
      const response = await api.post<ChatResponse>('/chat/save', { messages });
      return response.data;
    } catch (error) {
      console.error('Save chat error:', error);
      throw error;
    }
  }

  static async getChatHistory(page = 1, limit = 10) {
    try {
      const response = await api.get<ChatResponse>(`/chat/history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get chat history error:', error);
      throw error;
    }
  }

  static async getChat(chatId: string) {
    try {
      const response = await api.get<ChatResponse>(`/chat/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('Get chat error:', error);
      throw error;
    }
  }

  // 임시 저장 기능
  static saveTempChat(sessionId: string, messages: Message[]) {
    try {
      localStorage.setItem(`chat_${sessionId}`, JSON.stringify(messages));
    } catch (error) {
      console.error('Save temp chat error:', error);
    }
  }

  static loadTempChat(sessionId: string): Message[] {
    try {
      const saved = localStorage.getItem(`chat_${sessionId}`);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Load temp chat error:', error);
      return [];
    }
  }

  static clearTempChat(sessionId: string) {
    try {
      localStorage.removeItem(`chat_${sessionId}`);
    } catch (error) {
      console.error('Clear temp chat error:', error);
    }
  }
}

export default ChatService; 
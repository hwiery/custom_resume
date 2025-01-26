// Message 관련 타입
export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export interface ChatHistory {
    _id: string;
    userId: string;
    messages: Message[];
    createdAt: string;
}

// 사용자 관련 타입
export interface User {
    _id: string;
    email: string;
    name: string;
    picture?: string;
    googleId: string;
    createdAt: string;
}

// API 응답 타입
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

// API 요청 타입
export interface SaveChatRequest {
    messages: Message[];
}

export interface GoogleAuthRequest {
    credential: string;
} 
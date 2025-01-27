export interface Message {
    id: number;
    text: string;
    sender: 'user' | 'RESUMER';
    timestamp: Date;
}

export interface Chat {
    _id: string;
    userId: string;
    sessionId: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
    isArchived: boolean;
    title?: string;
}

export interface ChatPagination {
    total: number;
    page: number;
    pages: number;
}

export interface ChatListResponse {
    chats: Chat[];
    pagination: ChatPagination;
} 
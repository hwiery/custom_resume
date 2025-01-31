export interface Message {
    id?: number;
    role: 'user' | 'assistant';
    content: string;
    text?: string;
    sender?: string;
    timestamp: Date;
} 
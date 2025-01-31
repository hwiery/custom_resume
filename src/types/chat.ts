import { Message } from './message';

export interface Chat {
    _id: string;
    title: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
    userId: string;
} 
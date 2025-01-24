export interface Message {
    id: number;
    text: string;
    sender: 'RESUMER' | 'user';
    timestamp: Date;
} 
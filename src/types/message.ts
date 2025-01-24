export interface Message {
    id: number;
    text: string;
    sender: 'computer' | 'user';
    timestamp: Date;
} 
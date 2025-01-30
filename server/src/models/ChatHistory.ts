import mongoose, { Schema, Document } from 'mongoose';
import { IChat } from './Chat';

export interface IChatHistory extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    summary?: string;
    lastMessage: string;
    messageCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ChatHistoryDocument extends IChatHistory {
    messages?: IChat[];
    toObject(): ChatHistoryResponse;
}

export interface ChatHistoryResponse {
    _id: mongoose.Types.ObjectId;
    title: string;
    summary?: string;
    lastMessage: string;
    messageCount: number;
    createdAt: Date;
    updatedAt: Date;
    messages?: IChat[];
    pagination?: PaginationInfo;
}

const ChatHistorySchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String
    },
    lastMessage: {
        type: String,
        required: true
    },
    messageCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// 인덱스 추가
ChatHistorySchema.index({ userId: 1, updatedAt: -1 });
ChatHistorySchema.index({ title: 'text' });

export default mongoose.model<ChatHistoryDocument>('ChatHistory', ChatHistorySchema); 
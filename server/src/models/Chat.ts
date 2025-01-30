import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
    historyId: mongoose.Types.ObjectId;
    content: string;
    isUser: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ChatSchema: Schema = new Schema({
    historyId: {
        type: Schema.Types.ObjectId,
        ref: 'ChatHistory',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    isUser: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});

// 인덱스 추가
ChatSchema.index({ historyId: 1, createdAt: 1 });

export default mongoose.model<IChat>('Chat', ChatSchema); 
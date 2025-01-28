import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
    userId: mongoose.Types.ObjectId;
    messages: {
        content: string;
        timestamp: Date;
        isUser: boolean;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const ChatSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messages: [{
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        isUser: {
            type: Boolean,
            required: true
        }
    }]
}, {
    timestamps: true
});

export default mongoose.model<IChat>('Chat', ChatSchema); 
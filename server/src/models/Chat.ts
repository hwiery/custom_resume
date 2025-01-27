import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true,
        enum: ['user', 'RESUMER']
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    messages: [messageSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isArchived: {
        type: Boolean,
        default: false
    }
});

chatSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// 가상 필드: 메시지 수
chatSchema.virtual('messageCount').get(function() {
    return this.messages.length;
});

// 인덱스 설정
chatSchema.index({ userId: 1, sessionId: 1 });
chatSchema.index({ createdAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat; 
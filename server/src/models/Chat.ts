import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  messages: [messageSchema],
  lastMessage: { type: String },
  lastMessageDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 저장 전에 마지막 메시지 정보 업데이트
chatSchema.pre('save', function(next) {
  if (this.messages && this.messages.length > 0) {
    const lastMsg = this.messages[this.messages.length - 1];
    this.lastMessage = lastMsg.content;
    this.lastMessageDate = lastMsg.timestamp;
  }
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Chat', chatSchema); 
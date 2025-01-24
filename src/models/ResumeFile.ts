import mongoose from 'mongoose';

const resumeFileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resumeTitle: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        enum: ['pdf', 'docx'],
        required: true
    },
    fileUrl: {
        type: String,
        required: true,
        // Supabase Storage URL 형식
        match: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('ResumeFile', resumeFileSchema); 
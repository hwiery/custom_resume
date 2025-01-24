import mongoose from 'mongoose';

const jobPostingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobLink: {
        type: String,
        required: true
    },
    keywords: [String],
    analysisResult: {
        matchingScore: Number,
        suggestedImprovements: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('JobPosting', jobPostingSchema); 
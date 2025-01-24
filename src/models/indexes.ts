import User from './User';
import ChatHistory from './ChatHistory';
import JobPosting from './JobPosting';

const createIndexes = async () => {
    try {
        // User 인덱스
        await User.collection.createIndex({ email: 1 }, { unique: true });
        await User.collection.createIndex({ googleId: 1 }, { unique: true, sparse: true });

        // ChatHistory 인덱스
        await ChatHistory.collection.createIndex({ userId: 1 });
        await ChatHistory.collection.createIndex({ createdAt: -1 });

        // JobPosting 인덱스
        await JobPosting.collection.createIndex({ userId: 1 });
        await JobPosting.collection.createIndex({ keywords: 1 });

        console.log('Indexes created successfully');
    } catch (error) {
        console.error('Error creating indexes:', error);
    }
};

export default createIndexes; 
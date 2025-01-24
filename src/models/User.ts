import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    googleId: { 
        type: String, 
        unique: true 
    },
    name: String,
    picture: String,
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

export default mongoose.model('User', userSchema); 
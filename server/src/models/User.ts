import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
    _id: Types.ObjectId;
    email: string;
    name: string;
    picture: string;
    googleId: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    googleId: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema); 

import { Message } from '../types/message';

const TEMP_COLLECTION = 'tempChats';
const USER_COLLECTION = 'userChats';

export const saveTempChat = async (sessionId: string, messages: Message[]) => {
    try {
        const response = await fetch('/api/chats/temp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId,
                messages,
                timestamp: new Date(),
                isTemp: true
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to save temp chat');
        }
    } catch (error) {
        console.error('Error saving temp chat:', error);
    }
};

export const migrateToUserChat = async (sessionId: string, userId: string) => {
    try {
        const response = await fetch('/api/chats/migrate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId,
                userId
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to migrate chat');
        }
    } catch (error) {
        console.error('Error migrating chat:', error);
    }
};

export const deleteTempChat = async (sessionId: string) => {
    try {
        const response = await fetch(`/api/chats/temp/${sessionId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete temp chat');
        }
    } catch (error) {
        console.error('Error deleting temp chat:', error);
    }
}; 
export interface ApiError {
    message: string;
    code?: string;
    status?: number;
}

export class ChatError extends Error {
    constructor(
        message: string,
        public code?: string,
        public status?: number
    ) {
        super(message);
        this.name = 'ChatError';
    }

    static fromApiError(error: ApiError): ChatError {
        return new ChatError(error.message, error.code, error.status);
    }
}

export const getErrorMessage = (error: unknown): string => {
    if (error instanceof ChatError) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return '알 수 없는 오류가 발생했습니다.';
}; 
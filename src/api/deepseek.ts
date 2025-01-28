import axios, { AxiosError } from 'axios';
import { Message } from '../types/message';

// API 기본 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const deepseekApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
    withCredentials: true
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

// 재시도 설정
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1초

const sleep = (ms: number): Promise<void> => 
    new Promise(resolve => setTimeout(resolve, ms));

// API 요청 제한 관리
const rateLimiter = {
    tokens: 50, // 초당 최대 요청 수
    lastRefill: Date.now(),
    interval: 1000, // 1초

    async checkLimit(): Promise<boolean> {
        const now = Date.now();
        const timePassed = now - this.lastRefill;
        
        if (timePassed >= this.interval) {
            this.tokens = 50;
            this.lastRefill = now;
        }

        if (this.tokens <= 0) {
            const waitTime = this.interval - timePassed;
            await sleep(waitTime);
            return this.checkLimit();
        }

        this.tokens--;
        return true;
    }
};

export const getChatResponse = async (messages: Message[]): Promise<string> => {
    try {
        const chatMessages = messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
        }));

        console.log('Sending request to proxy');
        console.log('Request payload:', {
            model: "deepseek-chat",
            messages: chatMessages
        });

        const response = await deepseekApi.post('/api/chat/proxy/deepseek', {
            model: "deepseek-chat",
            messages: chatMessages,
            temperature: 0.7,
            max_tokens: 1000
        });

        console.log('API Response:', response.data);
        
        if (!response.data.choices || !response.data.choices[0]) {
            throw new Error('Invalid response format from API');
        }

        return response.data.choices[0].message.content;
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error('Error getting response:', axiosError);
        throw new Error(`API 오류: ${axiosError.message}`);
    }
};

const getChatResponseWithRetry = async (messages: Message[]): Promise<string> => {
    await rateLimiter.checkLimit();
    let retries = 0;

    while (retries < MAX_RETRIES) {
        try {
            const chatMessages = messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            }));

            // API 엔드포인트 경로 수정
            const response = await deepseekApi.post('/v1/chat/completions', {
                model: "deepseek-chat",
                messages: chatMessages,
                temperature: 0.7,  // 응답의 창의성 조절
                max_tokens: 1000   // 최대 토큰 수 제한
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            const axiosError = error as AxiosError;
            
            if (axiosError.response?.status === 401) {
                console.error('API 키가 유효하지 않습니다.');
                throw new Error('Invalid API key');
            }
            
            if (axiosError.response?.status === 429) {
                console.log(`Rate limit exceeded, waiting ${RETRY_DELAY}ms`);
                await sleep(RETRY_DELAY);
                retries++;
                continue;
            }

            if (axiosError.response?.status === 500) {
                if (retries < MAX_RETRIES - 1) {
                    console.log(`Server error, retrying... (${retries + 1}/${MAX_RETRIES})`);
                    await sleep(RETRY_DELAY);
                    retries++;
                    continue;
                }
            }

            throw new Error(`API Error: ${axiosError.message}`);
        }
    }

    throw new Error('Max retries exceeded');
}; 
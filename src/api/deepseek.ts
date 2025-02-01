import axios, { AxiosError } from 'axios';
import { Message } from '../types/message';

// API 기본 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true,
    timeout: 30000 // 30초 타임아웃
});

// 인터셉터 추가
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        const guestToken = localStorage.getItem('guestToken');
        
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        } else if (guestToken && config.headers) {
            config.headers.Authorization = `Guest ${guestToken}`;
        } else {
            // 게스트 토큰이 없는 경우 새로 생성
            const newGuestToken = Math.random().toString(36).substring(7);
            localStorage.setItem('guestToken', newGuestToken);
            if (config.headers) {
                config.headers.Authorization = `Guest ${newGuestToken}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 추가
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.code === 'ERR_NETWORK') {
            console.error('네트워크 오류:', error);
            throw new Error('서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.');
        }
        return Promise.reject(error);
    }
);

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
    let retries = 0;

    while (retries < MAX_RETRIES) {
        try {
            // 게스트 채팅 카운트 가져오기
            const guestChatCount = parseInt(localStorage.getItem('guestChatCount') || '0');
            const guestToken = localStorage.getItem('guestToken');

            console.log('API 요청 시도:', {
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))
            });

            const response = await api.post('/api/chat/proxy/deepseek', {
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))
            }, {
                headers: {
                    'x-guest-token': guestToken || '',
                    'x-guest-chat-count': guestChatCount.toString()
                }
            });

            // 게스트 채팅 카운트 업데이트
            if (!localStorage.getItem('token')) {
                localStorage.setItem('guestChatCount', (guestChatCount + 1).toString());
            }

            if (response.data.choices && response.data.choices[0]) {
                // 채팅 내용 임시 저장
                const chatHistory = JSON.parse(localStorage.getItem('guestChatHistory') || '[]');
                chatHistory.push({
                    messages: messages,
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem('guestChatHistory', JSON.stringify(chatHistory));

                return response.data.choices[0].message.content;
            }

            throw new Error('서버 응답 형식이 올바르지 않습니다.');
        } catch (error) {
            console.error('Chat API 요청 실패:', error);
            
            if (error instanceof Error) {
                if (error.message === '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.') {
                    if (retries < MAX_RETRIES - 1) {
                        console.log(`서버 연결 재시도 중... (${retries + 1}/${MAX_RETRIES})`);
                        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                        retries++;
                        continue;
                    }
                }
            }

            const axiosError = error as AxiosError;
            if (axiosError.response?.status === 403) {
                throw new Error('채팅 횟수 제한에 도달했습니다. 로그인 후 이용해주세요.');
            }
            
            throw new Error('채팅 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
    }

    throw new Error('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
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
            const response = await api.post('/v1/chat/completions', {
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
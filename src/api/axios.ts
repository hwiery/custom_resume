import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// API 응답 타입 정의
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// API 에러 타입 정의
export interface ApiError {
    message: string;
    status?: number;
    code?: string;
}

interface ErrorResponse {
    message?: string;
    code?: string;
    data?: {
        message?: string;
        code?: string;
    };
}

// API 인스턴스 생성
const api: AxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError<ErrorResponse>) => {
        const originalRequest = error.config;

        // 401 에러 (인증 만료) 처리
        if (error.response?.status === 401 && originalRequest) {
            try {
                // 토큰 갱신 시도
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/refresh`, {
                        refreshToken
                    });
                    
                    const { token } = response.data;
                    localStorage.setItem('authToken', token);
                    
                    // 원래 요청 재시도
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return axios(originalRequest);
                }
            } catch (refreshError) {
                // 토큰 갱신 실패시 로그아웃 처리
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
            }
        }

        // 에러 응답 통일
        const apiError: ApiError = {
            message: error.response?.data?.message || error.response?.data?.data?.message || '알 수 없는 오류가 발생했습니다.',
            status: error.response?.status,
            code: error.response?.data?.code || error.response?.data?.data?.code
        };

        return Promise.reject(apiError);
    }
);

export default api;

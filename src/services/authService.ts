import { User, AuthResponse, ApiResponse } from '../types';
import axios from '../utils/axios';

class AuthService {
    private static instance: AuthService;
    private readonly TOKEN_KEY = 'token';
    private readonly USER_KEY = 'user';

    private constructor() {}

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    // 구글 로그인
    public async googleLogin(credential: string): Promise<void> {
        try {
            const response = await axios.post<ApiResponse<AuthResponse>>('/api/auth/google', { credential });
            const { token, user } = response.data.data!;
            
            this.setToken(token);
            this.setUser(user);
        } catch (error) {
            console.error('Google login failed:', error);
            throw error;
        }
    }

    // 로그아웃
    public async logout(): Promise<void> {
        try {
            await axios.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            this.clearAuth();
        }
    }

    // 토큰 검증
    public async validateToken(): Promise<boolean> {
        try {
            const token = this.getToken();
            if (!token) return false;

            const response = await axios.get<ApiResponse<User>>('/api/auth/validate');
            const user = response.data.data!;
            this.setUser(user);
            return true;
        } catch (error) {
            console.error('Token validation failed:', error);
            this.clearAuth();
            return false;
        }
    }

    // 현재 사용자 정보 가져오기
    public getUser(): User | null {
        const userStr = localStorage.getItem(this.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    }

    // 토큰 가져오기
    public getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    // 인증 상태 확인
    public isAuthenticated(): boolean {
        return !!this.getToken();
    }

    private setToken(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    private setUser(user: User): void {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    private clearAuth(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }
}

export default AuthService.getInstance(); 
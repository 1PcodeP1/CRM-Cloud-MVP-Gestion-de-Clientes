// frontend/src/types/auth.ts

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    company: string;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

export interface RegisterResponse {
    message: string;
}

export interface ApiError {
    message: string;
    statusCode: number;
}

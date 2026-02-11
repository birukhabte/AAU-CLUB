export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'CLUB_LEADER' | 'MEMBER';
    avatar?: string;
    isActive: boolean;
}

export interface AuthResponse {
    user: User;
    token: string;
    refreshToken: string;
}

export interface Club {
    id: string;
    name: string;
    description: string;
    category: string;
    logo: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    membersCount?: number;
}

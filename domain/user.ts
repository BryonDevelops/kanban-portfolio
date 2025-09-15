export interface User {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    avatarUrl?: string;
    isAdmin: boolean;
}
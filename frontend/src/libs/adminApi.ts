// Admin API Service
import { api } from "./api";

// Types
export interface AdminStats {
    totalUsers: number;
    totalDecks: number;
    totalCards: number;
    totalPosts: number;
    totalStudyLogs: number;
    publicDecks: number;
    notices: number;
}

export interface AdminUser {
    id: number;
    username: string;
    nickname: string;
    roles: string[];
    status: string;
    createdAt: string;
}

export interface AdminDeck {
    id: number;
    name: string;
    description: string;
    isPublic: boolean;
    cardCount: number;
    ownerUsername: string;
    createdAt: string;
}

export interface AdminPost {
    id: number;
    title: string;
    content: string;
    authorName: string;
    authorId: number | null;
    isNotice: boolean;
    likeCount: number;
    attachmentUrls: string[];
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export const AdminApi = {
    // Dashboard Stats
    getStats: () => api.get<AdminStats>("/admin/stats"),

    // User Management
    getUsers: (page = 0, size = 20) =>
        api.get<PageResponse<AdminUser>>(`/admin/users?page=${page}&size=${size}`),
    getUser: (id: number) => api.get<AdminUser>(`/admin/users/${id}`),
    createUser: (data: { username: string; password: string; roles?: string[]; status?: string }) =>
        api.post<AdminUser>("/admin/users", data),
    updateUser: (id: number, data: { username?: string; password?: string; roles?: string[]; status?: string }) =>
        api.put<AdminUser>(`/admin/users/${id}`, data),
    deleteUser: (id: number) => api.delete(`/admin/users/${id}`),

    // Deck Management
    getDecks: (page = 0, size = 20) =>
        api.get<PageResponse<AdminDeck>>(`/admin/decks?page=${page}&size=${size}`),
    getPublicDecks: () => api.get<AdminDeck[]>("/admin/decks/public"),
    deleteDeck: (id: number) => api.delete(`/admin/decks/${id}`),

    // Post Management
    getPosts: (query?: string) =>
        api.get<AdminPost[]>(`/admin/posts${query ? `?q=${encodeURIComponent(query)}` : ""}`),
    toggleNotice: (id: number, isNotice: boolean) =>
        api.patch<AdminPost>(`/admin/posts/${id}/notice?isNotice=${isNotice}`),
    deletePost: (id: number) => api.delete(`/admin/posts/${id}`),
};

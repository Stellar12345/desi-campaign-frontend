import apiClient from "./api";
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  ApiResponse,
  PaginatedUsersResponse,
} from "@/types";

export const usersApi = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<PaginatedUsersResponse>>("/private/users");
    // Extract users from data.items
    return response.data.data?.items ?? [];
  },

  // Get single user
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/private/users/${id}`);
    return response.data.data;
  },

  // Create user
  create: async (payload: CreateUserPayload): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>("/private/users", payload);
    return response.data.data;
  },

  // Update user
  update: async (id: string, payload: UpdateUserPayload): Promise<User> => {
    // Use private users endpoint to update existing user
    const response = await apiClient.put<ApiResponse<User>>(`/private/users/${id}`, payload);
    return response.data.data;
  },

  // Soft delete user
  softDelete: async (id: string): Promise<void> => {
    await apiClient.delete(`/public/users/${id}`);
  },

  // Restore user
  restore: async (id: string): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User>>(`/public/users/restore/${id}`);
    return response.data.data;
  },

  // Hard delete user
  hardDelete: async (id: string): Promise<void> => {
    await apiClient.delete(`/private/users/hard-delete/${id}`);
  },

  // Delete contact
  deleteContact: async (contactId: string): Promise<void> => {
    await apiClient.delete(`/private/contact/${contactId}`);
  },
};

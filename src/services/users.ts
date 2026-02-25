import apiClient from "./api";
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  ApiResponse,
} from "@/types";

// Helper: map bulk user payload from backend into frontend User shape
function mapBulkUserToUser(data: {
  id: string;
  firstName: string;
  title?: string | null;
  companyName?: string | null;
  email: string;
  corporatePhone: string;
  city?: string | null;
  state?: string | null;
  companyCity?: string | null;
  companyState?: string | null;
  companyCountry?: string | null;
  companyPhone?: string | null;
  secondaryEmail?: string | null;
  secondaryEmailSource?: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}): User {
  const primaryContact = {
    id: data.id,
    userId: data.id,
    name: data.firstName,
    channelCode: "EMAIL",
    email: data.email,
    phone: data.corporatePhone,
    countryCode: "",
    street: "",
    city: data.city || data.companyCity || "",
    state: data.state || data.companyState || "",
    country: data.companyCountry || "",
    postalCode: "",
    verified: false,
    optedOut: false,
  };

  return {
    id: data.id,
    firstName: data.firstName,
    // Backend payload doesn't provide lastName separately
    lastName: "",
    email: data.email,
    // Use corporatePhone as phoneNo for now
    phoneNo: data.corporatePhone,
    // Preserve full bulk user fields
    title: data.title ?? null,
    companyName: data.companyName ?? null,
    corporatePhone: data.corporatePhone,
    city: data.city ?? null,
    state: data.state ?? null,
    companyCity: data.companyCity ?? null,
    companyState: data.companyState ?? null,
    companyCountry: data.companyCountry ?? null,
    companyPhone: data.companyPhone ?? null,
    secondaryEmail: data.secondaryEmail ?? null,
    secondaryEmailSource: data.secondaryEmailSource ?? null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    deletedAt: data.deletedAt,
    isDeleted: data.isDeleted,
    // Synthesize a primary contact so details page & forms show something meaningful
    contacts: [primaryContact],
  };
}

export const usersApi = {
  // Get all users - backend endpoint updated to /private/bulk?page=&limit=
  // Supports pagination and (optionally) basic filters.
  // NOTE: Backend shape differs from existing User type, so we map fields best-effort.
  getAll: async (
    page: number,
    limit: number,
    filters?: {
      firstName?: string;
      email?: string;
      phoneNo?: string;
    }
  ): Promise<{
    items: User[];
    pageInfo: {
      totalResults: number;
      pageCount: number;
      resultsPerPage: number;
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      nextPage: number | null;
      prevPage: number | null;
    };
  }> => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));

    // Backend: only send `search` when there's an actual value
    const search =
      filters?.firstName || filters?.email || filters?.phoneNo || "";

    if (search && search.trim().length > 0) {
      params.set("search", search.trim());
    }

    const response = await apiClient.get<
      ApiResponse<{
        items: Array<{
          id: string;
          firstName: string;
          title?: string | null;
          companyName?: string | null;
          email: string;
          corporatePhone: string;
          city?: string | null;
          state?: string | null;
          companyCity?: string | null;
          companyState?: string | null;
          companyCountry?: string | null;
          companyPhone?: string | null;
          secondaryEmail?: string | null;
          secondaryEmailSource?: string | null;
          isDeleted: boolean;
          deletedAt: string | null;
          createdAt: string;
          updatedAt: string;
        }>;
        pageInfo: {
          totalResults: number;
          pageCount: number;
          resultsPerPage: number;
          currentPage: number;
          totalPages: number;
          hasNextPage: boolean;
          hasPrevPage: boolean;
          nextPage: number | null;
          prevPage: number | null;
        };
      }>
    >(`/private/bulk?${params.toString()}`);

    const items = response.data.data?.items ?? [];
    const pageInfo = response.data.data?.pageInfo;

    const mapped: User[] = items.map((item) => mapBulkUserToUser(item));

    return {
      items: mapped,
      pageInfo,
    };
  },

  // Get single user
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<
      ApiResponse<{
        id: string;
        firstName: string;
        title?: string | null;
        companyName?: string | null;
        email: string;
        corporatePhone: string;
        city?: string | null;
        state?: string | null;
        companyCity?: string | null;
        companyState?: string | null;
        companyCountry?: string | null;
        companyPhone?: string | null;
        secondaryEmail?: string | null;
        secondaryEmailSource?: string | null;
        isDeleted: boolean;
        deletedAt: string | null;
        createdAt: string;
        updatedAt: string;
      }>
    >(`/private/bulk/${id}`);

    const data = response.data.data;
    return mapBulkUserToUser(data);
  },

  // Create user
  create: async (payload: CreateUserPayload): Promise<User> => {
    const response = await apiClient.post<
      ApiResponse<{
        id: string;
        firstName: string;
        title?: string | null;
        companyName?: string | null;
        email: string;
        corporatePhone: string;
        city?: string | null;
        state?: string | null;
        companyCity?: string | null;
        companyState?: string | null;
        companyCountry?: string | null;
        companyPhone?: string | null;
        secondaryEmail?: string | null;
        secondaryEmailSource?: string | null;
        isDeleted: boolean;
        deletedAt: string | null;
        createdAt: string;
        updatedAt: string;
      }>
    >("/private/bulk", payload);
    // Check if response has error status
    if (response.data.status === "ERROR") {
      const error = new Error(response.data.message || "Failed to create user");
      (error as any).response = { data: response.data };
      throw error;
    }
    const data = response.data.data;
    return mapBulkUserToUser(data);
  },

  // Update user
  update: async (id: string, payload: UpdateUserPayload): Promise<User> => {
    const response = await apiClient.put<
      ApiResponse<{
        id: string;
        firstName: string;
        title?: string | null;
        companyName?: string | null;
        email: string;
        corporatePhone: string;
        city?: string | null;
        state?: string | null;
        companyCity?: string | null;
        companyState?: string | null;
        companyCountry?: string | null;
        companyPhone?: string | null;
        secondaryEmail?: string | null;
        secondaryEmailSource?: string | null;
        isDeleted: boolean;
        deletedAt: string | null;
        createdAt: string;
        updatedAt: string;
      }>
    >(`/private/bulk/${id}`, payload);
    // Check if response has error status
    if (response.data.status === "ERROR") {
      const error = new Error(response.data.message || "Failed to update user");
      (error as any).response = { data: response.data };
      throw error;
    }
    const data = response.data.data;
    return mapBulkUserToUser(data);
  },

  // Soft delete user
  softDelete: async (id: string): Promise<void> => {
    await apiClient.delete(`/public/users/${id}`);
  },

  // Restore user
  restore: async (id: string): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User>>(`/public/users/restore/${id}`);
    // Check if response has error status
    if (response.data.status === "ERROR") {
      const error = new Error(response.data.message || "Failed to restore user");
      (error as any).response = { data: response.data };
      throw error;
    }
    return response.data.data;
  },

  // Hard delete user
  hardDelete: async (id: string): Promise<void> => {
    await apiClient.delete(`/private/bulk/${id}`);
  },

  // Delete contact
  deleteContact: async (contactId: string): Promise<void> => {
    await apiClient.delete(`/private/contact/${contactId}`);
  },

  // Bulk import users from CSV
  importBulk: async (file: File): Promise<ApiResponse<unknown>> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<ApiResponse<unknown>>(
      "/private/bulk/import",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },
};

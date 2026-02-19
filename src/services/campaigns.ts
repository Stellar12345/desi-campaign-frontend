import apiClient from "./api";
import type {
  Campaign,
  CreateCampaignPayload,
  UpdateCampaignPayload,
  PublishCampaignPayload,
  ApiResponse,
  PaginatedUsersResponse,
  PaginatedCampaignsResponse,
  CampaignSummary,
  CampaignSummaryById,
} from "@/types";

export const campaignsApi = {
  // Get all campaigns
  getAll: async (): Promise<Campaign[]> => {
    const response = await apiClient.get<ApiResponse<Campaign[] | { items: Campaign[] }>>(
      "/private/campaigns"
    );
    // Handle different response structures
    const data = response.data.data;
    if (Array.isArray(data)) {
      return data;
    }
    // If it's an object with items property (paginated response)
    if (data && typeof data === "object" && "items" in data && Array.isArray((data as any).items)) {
      return (data as any).items;
    }
    return [];
  },

  // Get published campaigns with pagination
  getPublishedPaginated: async (
    page: number,
    resultsPerPage: number
  ): Promise<PaginatedCampaignsResponse> => {
    const response = await apiClient.get<ApiResponse<PaginatedCampaignsResponse>>(
      `/private/campaigns?status=PUBLISHED&page=${page}`
    );
    return response.data.data;
  },

  // Get single campaign
  getById: async (id: string): Promise<Campaign> => {
    const response = await apiClient.get<ApiResponse<Campaign>>(`/private/campaigns/${id}`);
    return response.data.data;
  },

  // Create campaign
  create: async (payload: CreateCampaignPayload): Promise<Campaign> => {
    const response = await apiClient.post<ApiResponse<Campaign>>("/private/campaigns", payload);
    return response.data.data;
  },

  // Update campaign
  update: async (id: string, payload: UpdateCampaignPayload): Promise<Campaign> => {
    const response = await apiClient.put<ApiResponse<Campaign>>(`/private/campaigns/${id}`, payload);
    return response.data.data;
  },

  // Delete campaign
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/private/campaigns/${id}`);
  },

  // Publish campaign
  publish: async (payload: PublishCampaignPayload): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      "/private/campaigns/publish",
      payload
    );
    return response.data; // Return full response including data, message, etc.
  },

  // Get contacts for campaign, filtered by channel (EMAIL, WHATSAPP, etc.)
  // This reuses the /private/users endpoint with ?channelCode=...
  getContacts: async (channelCode: string): Promise<PaginatedUsersResponse["items"]> => {
    const response = await apiClient.get<ApiResponse<PaginatedUsersResponse>>(
      `/private/users?channelCode=${encodeURIComponent(channelCode)}`
    );
    return response.data.data?.items ?? [];
  },

  // Attach contacts to an existing campaign
  addContacts: async (payload: { campaignId: string; contacts: string[] }): Promise<void> => {
    await apiClient.post("/private/campaigns/contacts", payload);
  },

  // Dashboard summary
  getSummary: async (startDate: string, toDate: string): Promise<CampaignSummary> => {
    const response = await apiClient.get<ApiResponse<CampaignSummary>>(
      `/private/campaigns/summary?startDate=${encodeURIComponent(startDate)}&toDate=${encodeURIComponent(
        toDate
      )}`
    );
    return response.data.data;
  },

  // Per-campaign summary for a published campaign
  getCampaignSummary: async (id: string): Promise<CampaignSummaryById> => {
    const response = await apiClient.get<ApiResponse<CampaignSummaryById>>(
      `/private/campaigns/summary/campaign/${id}`
    );
    return response.data.data;
  },
};

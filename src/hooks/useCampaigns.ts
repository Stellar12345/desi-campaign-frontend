import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignsApi } from "@/services/campaigns";
import type {
  Campaign,
  CreateCampaignPayload,
  UpdateCampaignPayload,
  PublishCampaignPayload,
  CampaignSummary,
} from "@/types";

const QUERY_KEYS = {
  campaigns: ["campaigns"] as const,
  publishedCampaigns: ["campaigns", "published"] as const,
  campaign: (id: string) => ["campaigns", id] as const,
  contacts: (channelCode: string) => ["campaigns", "contacts", channelCode] as const,
  summary: (startDate: string, toDate: string) =>
    ["campaigns", "summary", startDate, toDate] as const,
};

// Get all campaigns (optionally filtered by status)
export function useCampaigns(status?: "DRAFT" | "PUBLISHED" | "SENT" | "FAILED") {
  return useQuery({
    queryKey: status ? [...QUERY_KEYS.campaigns, status] : QUERY_KEYS.campaigns,
    queryFn: () => campaignsApi.getAll(status),
  });
}

// Get published campaigns (for dashboard)
export function usePublishedCampaigns() {
  return useQuery<Campaign[]>({
    queryKey: QUERY_KEYS.publishedCampaigns,
    queryFn: () => campaignsApi.getAll("PUBLISHED"),
  });
}

// Get published campaigns with pagination (for listing page)
export function usePublishedCampaignsPaginated(page: number, resultsPerPage: number) {
  return useQuery({
    queryKey: ["campaigns", "published", page, resultsPerPage] as const,
    queryFn: () => campaignsApi.getPublishedPaginated(page, resultsPerPage),
    placeholderData: (previousData) => previousData,
  });
}

// Get single campaign
export function useCampaign(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.campaign(id),
    queryFn: () => campaignsApi.getById(id),
    enabled: !!id,
  });
}

// Get contacts for a specific channel (EMAIL, WHATSAPP, etc.)
export function useCampaignContacts(channelCode: string) {
  return useQuery({
    queryKey: QUERY_KEYS.contacts(channelCode),
    queryFn: () => campaignsApi.getContacts(channelCode),
    enabled: !!channelCode,
  });
}

// Get dashboard summary for a date range
export function useCampaignSummary(startDate: string, toDate: string) {
  return useQuery<CampaignSummary>({
    queryKey: QUERY_KEYS.summary(startDate, toDate),
    queryFn: () => campaignsApi.getSummary(startDate, toDate),
  });
}

// Get per-campaign summary by ID
export function useCampaignSummaryById(id: string) {
  return useQuery({
    queryKey: ["campaigns", "summary", "campaign", id],
    queryFn: () => campaignsApi.getCampaignSummary(id),
    enabled: !!id,
  });
}

// Create campaign
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCampaignPayload) => campaignsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaigns });
    },
  });
}

// Update campaign
export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCampaignPayload }) =>
      campaignsApi.update(id, payload),
    onSuccess: (_data: Campaign, variables: { id: string; payload: UpdateCampaignPayload }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaigns });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaign(variables.id) });
    },
  });
}

// Delete campaign
export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaigns });
    },
  });
}

// Publish campaign
export function usePublishCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PublishCampaignPayload) => campaignsApi.publish(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaigns });
    },
  });
}

// Add contacts to an existing campaign via /private/campaigns/contacts
export function useUpdateCampaignContacts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { campaignId: string; contacts: string[] }) =>
      campaignsApi.addContacts(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaigns });
    },
  });
}

export interface Contact {
  id?: string;
  userId?: string;
  name: string;
  channelCode: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  verified: boolean;
  optedOut: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  isDeleted: boolean;
  contacts: Contact[];
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  contacts?: Omit<Contact, 'verified' | 'optedOut'>[];
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNo?: string;
  contacts?: Omit<Contact, 'verified' | 'optedOut'>[];
}

export interface ApiResponse<T> {
  status: string;
  httpStatusCode: number;
  data: T;
  timestamp?: string;
  message?: string;
}

export interface PaginatedUsersResponse {
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
}

export interface PaginatedCampaignsResponse {
  items: Campaign[];
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
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Campaign Types
export interface Campaign {
  id: string;
  name: string;
  channelCode: string;
  apiProvider: string;
  subject: string;
  textBody?: string | null;
  htmlBody?: string | null;
  status: "DRAFT" | "PUBLISHED" | "SENT" | "FAILED";
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string | null;
  sentAt?: string | null;
  totalRecipients?: number;
  sentCount?: number;
  deliveredCount?: number;
  openedCount?: number;
  clickedCount?: number;
  failedCount?: number;
  isDeleted?: boolean;
  contacts?: CampaignContact[];
}

export interface CampaignContact {
  id: string;
  contactId: string;
  campaignId: string;
  name: string;
  email: string;
  phone: string;
}

export interface CreateCampaignPayload {
  name: string;
  channelCode: string;
  apiProvider: string;
  subject: string;
  textBody?: string;
  htmlBody?: string;
  contacts?: string[]; // Contact IDs
  status?: "DRAFT" | "PUBLISHED" | "SENT" | "FAILED"; // Status, defaults to DRAFT
}

export interface UpdateCampaignPayload {
  name?: string;
  channelCode?: string;
  apiProvider?: string;
  subject?: string;
  textBody?: string;
  htmlBody?: string;
  contacts?: string[];
  status?: "DRAFT" | "PUBLISHED" | "SENT" | "FAILED";
}

export interface PublishCampaignPayload {
  campaignId: string;
}

// Dashboard summary for /private/campaigns/summary
export interface CampaignSummary {
  generatedAt: string;
  users: {
    total: number;
    active: number;
    deleted: number;
    newToday: number;
    newThisMonth: number;
  };
  contacts: {
    total: number;
    verified: number;
    optedOut: number;
    email: number;
    whatsapp: number;
    deleted: number;
  };
  campaigns: {
    total: number;
    draft: number;
    scheduled: number;
    sent: number;
    failed: number;
    email: number;
    whatsapp: number;
  };
  deliveries: {
    total: number;
    pending: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
  };
  engagement: {
    uniqueOpeners: number;
    uniqueClickers: number;
    totalOpens: number;
    totalClicks: number;
    totalReplies: number;
    totalPurchases: number;
    avgEngagementScorePerUser: number;
  };
  rates: {
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    clickThroughRate: number;
    failureRate: number;
    unsubscribeRate: number;
  };
  today: {
    campaignsSent: number;
    deliveriesSent: number;
    opens: number;
    clicks: number;
    replies: number;
    purchases: number;
    newContacts: number;
    optOuts: number;
  };
  thisMonth: {
    campaignsSent: number;
    deliveriesSent: number;
    opens: number;
    clicks: number;
    replies: number;
    purchases: number;
    newContacts: number;
    optOuts: number;
  };
}

// Per-campaign daily summary for /private/campaigns/summary/campaign/:id
export interface CampaignDailySummary {
  campaignId: string;
  date: string;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalFailed: number;
  totalUnsubscribed: number;
  // Back-end specific fields
  campaignName: string;
  campainStatus: string;
}

export interface CampaignUserStat {
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNo: string;
  };
  email: string;
  sent: number;
  delivered: number;
  openCount: number;
  clickCount: number;
  failed: number;
  unsubscribed: number;
  lastOpenedAt: string | null;
}

export interface CampaignSummaryById {
  campaignSummary: CampaignDailySummary;
  userStats: CampaignUserStat[];
}

export interface CampaignWizardData {
  step: number;
  basicInfo: {
    name: string;
    channelCode: string;
    apiProvider: string;
    subject: string;
  };
  emailContent: {
    textBody: string;
    htmlBody: string;
  };
  contacts: string[]; // Selected contact IDs
  isDraft: boolean;
}

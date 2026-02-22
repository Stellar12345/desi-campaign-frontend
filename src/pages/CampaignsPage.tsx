import { useNavigate } from "react-router-dom";
import { Plus, Edit, Send, Trash2 } from "lucide-react";
import { useCampaigns, useDeleteCampaign } from "@/hooks/useCampaigns";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import { formatDateString, getErrorMessage } from "@/utils/format";
import { useToastContext } from "@/contexts/ToastContext";
import { useState } from "react";
import ConfirmModal from "@/components/users/ConfirmModal";
import type { Campaign } from "@/types";

export default function CampaignsPage() {
  const navigate = useNavigate();
  // Get only DRAFT campaigns from API
  const { data: campaignsData, isLoading } = useCampaigns("DRAFT");
  const deleteCampaign = useDeleteCampaign();
  const { showSuccess, showError } = useToastContext();
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; campaignId?: string; campaignName?: string }>({
    isOpen: false,
  });

  // Ensure campaigns is always an array
  const draftCampaigns = Array.isArray(campaignsData) ? campaignsData : [];

  // Local filter for campaign channel (EMAIL vs WHATSAPP)
  const [channelFilter, setChannelFilter] = useState<"EMAIL" | "WHATSAPP">("EMAIL");
  const filteredCampaigns = draftCampaigns.filter((c) => c.channelCode === channelFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge variant="success">Published</Badge>;
      case "SENT":
        return <Badge variant="info">Sent</Badge>;
      case "FAILED":
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge variant="default">Draft</Badge>;
    }
  };

  // Helper function to check which step is pending
  const getPendingStep = (campaign: Campaign): number | null => {
    // Step 1: Basic Info - check if name, channelCode, apiProvider, subject are filled
    if (!campaign.name || !campaign.channelCode || !campaign.apiProvider || !campaign.subject) {
      return 1;
    }
    
    // Step 2: Email Content - check if htmlBody is filled
    if (!campaign.htmlBody || campaign.htmlBody.trim() === "") {
      return 2;
    }
    
    // Step 3: Contacts - check if contacts exist and have at least one
    if (!campaign.contacts || campaign.contacts.length === 0) {
      return 3;
    }
    
    // All steps are complete, can go to publish (step 5)
    return null;
  };

  // Handler for publish button click - checks pending steps and navigates accordingly
  const handlePublishClick = (campaign: Campaign) => {
    const pendingStep = getPendingStep(campaign);
    
    if (pendingStep) {
      // Navigate to the pending step
      navigate(`/campaigns/${campaign.id}/edit?step=${pendingStep}`);
    } else {
      // All steps complete, navigate to publish step (step 5)
      navigate(`/campaigns/${campaign.id}/edit?step=5`);
    }
  };

  const handleDelete = async () => {
    if (deleteModal.campaignId) {
      try {
        await deleteCampaign.mutateAsync(deleteModal.campaignId);
        showSuccess("Campaign Deleted", "Campaign has been deleted successfully.");
        setDeleteModal({ isOpen: false });
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        showError("Delete Failed", errorMessage, 6000);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
          <p className="mt-2 text-gray-600">Manage your email & WhatsApp campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Channel toggle */}
          <div className="inline-flex rounded-full bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setChannelFilter("EMAIL")}
              className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                channelFilter === "EMAIL"
                  ? "bg-white shadow text-[#E9488A]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setChannelFilter("WHATSAPP")}
              className={`px-3 py-1 text-sm font-medium rounded-full transition-colors relative ${
                channelFilter === "WHATSAPP"
                  ? "bg-white shadow text-[#F3B44C]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              WhatsApp
              <span className="ml-1.5 text-xs text-gray-400">(Coming Soon)</span>
            </button>
          </div>

          {channelFilter === "EMAIL" ? (
            <Button
              onClick={() =>
                navigate(`/campaigns/new?channel=${channelFilter.toLowerCase()}`)
              }
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Email Campaign
            </Button>
          ) : (
            <Button disabled>
              <Plus className="w-5 h-5 mr-2" />
              Coming Soon
            </Button>
          )}
        </div>
      </div>

      {/* Campaigns List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {channelFilter === "EMAIL" ? "No draft campaigns yet" : "WhatsApp Campaigns Coming Soon"}
            </h3>
            <p className="text-gray-600 mb-4">
              {channelFilter === "EMAIL" 
                ? "Get started by creating your first email campaign."
                : "WhatsApp campaign creation will be available soon. Stay tuned!"}
            </p>
            {channelFilter === "EMAIL" ? (
              <Button
                onClick={() =>
                  navigate(`/campaigns/new?channel=${channelFilter.toLowerCase()}`)
                }
              >
                Create Email Campaign
              </Button>
            ) : (
              <Button disabled>
                Coming Soon
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{campaign.name}</h3>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <p className="text-gray-600 mb-2">{campaign.subject}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Channel: {campaign.channelCode}</span>
                    <span>Provider: {campaign.apiProvider}</span>
                    <span>Created: {formatDateString(campaign.createdAt)}</span>
                  </div>
                </div>
                {campaign.status === "DRAFT" && (
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handlePublishClick(campaign)}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Publish
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteModal({ isOpen: true, campaignId: campaign.id, campaignName: campaign.name })}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={handleDelete}
        title="Delete Campaign"
        message={`Are you sure you want to delete "${deleteModal.campaignName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteCampaign.isPending}
      />
    </div>
  );
}

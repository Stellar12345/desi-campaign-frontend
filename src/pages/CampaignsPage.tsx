import { useNavigate } from "react-router-dom";
import { Plus, Edit, Send } from "lucide-react";
import { useCampaigns, usePublishCampaign } from "@/hooks/useCampaigns";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import { formatDateString } from "@/utils/format";
import { useState } from "react";
import ConfirmModal from "@/components/users/ConfirmModal";

export default function CampaignsPage() {
  const navigate = useNavigate();
  const { data: campaignsData, isLoading } = useCampaigns();
  const publishCampaign = usePublishCampaign();
  const [publishModal, setPublishModal] = useState<{ isOpen: boolean; campaignId?: string }>({
    isOpen: false,
  });

  // Ensure campaigns is always an array
  const campaigns = Array.isArray(campaignsData) ? campaignsData : [];

  // Local filter for campaign channel (EMAIL vs WHATSAPP)
  const [channelFilter, setChannelFilter] = useState<"EMAIL" | "WHATSAPP">("EMAIL");
  const filteredCampaigns = campaigns.filter((c) => c.channelCode === channelFilter);

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

  const handlePublish = async () => {
    if (publishModal.campaignId) {
      await publishCampaign.mutateAsync({ campaignId: publishModal.campaignId });
      setPublishModal({ isOpen: false });
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
                  ? "bg-white shadow text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setChannelFilter("WHATSAPP")}
              className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                channelFilter === "WHATSAPP"
                  ? "bg-white shadow text-green-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              WhatsApp
            </button>
          </div>

          <Button
            onClick={() =>
              navigate(`/campaigns/new?channel=${channelFilter.toLowerCase()}`)
            }
          >
            <Plus className="w-5 h-5 mr-2" />
            {channelFilter === "EMAIL" ? "Create Email Campaign" : "Create WhatsApp Campaign"}
          </Button>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first{" "}
              {channelFilter === "EMAIL" ? "email" : "WhatsApp"} campaign.
            </p>
            <Button
              onClick={() =>
                navigate(`/campaigns/new?channel=${channelFilter.toLowerCase()}`)
              }
            >
              {channelFilter === "EMAIL"
                ? "Create Email Campaign"
                : "Create WhatsApp Campaign"}
            </Button>
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
                      onClick={() => setPublishModal({ isOpen: true, campaignId: campaign.id })}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Publish
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish Confirmation Modal */}
      <ConfirmModal
        isOpen={publishModal.isOpen}
        onClose={() => setPublishModal({ isOpen: false })}
        onConfirm={handlePublish}
        title="Publish Campaign"
        message="Are you sure you want to publish this campaign? It will be sent to all selected recipients."
        confirmText="Publish"
        variant="danger"
        isLoading={publishCampaign.isPending}
      />
    </div>
  );
}

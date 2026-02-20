import { AlertTriangle } from "lucide-react";
import { useCampaignWizard } from "@/contexts/CampaignWizardContext";
import { usePublishCampaign, useCreateCampaign } from "@/hooks/useCampaigns";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToastContext } from "@/contexts/ToastContext";
import { getErrorMessage } from "@/utils/format";
import { convertToEmailHtml } from "@/components/campaigns/CampaignEmailEditor";

interface StepPublishProps {
  onPrevious: () => void;
}

export default function StepPublish({ onPrevious }: StepPublishProps) {
  const { wizardData, resetWizard, campaignId } = useCampaignWizard();
  const publishCampaign = usePublishCampaign();
  const createCampaign = useCreateCampaign();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      let finalCampaignId = campaignId;

      // If no campaign ID, create the campaign first
      if (!finalCampaignId) {
        const created = await createCampaign.mutateAsync({
          ...wizardData.basicInfo,
          htmlBody: convertToEmailHtml(wizardData.emailContent.htmlBody),
          textBody: wizardData.emailContent.textBody,
          contacts: wizardData.contacts,
        });
        finalCampaignId = created.id;
      }

      // Safety check
      if (!finalCampaignId) {
        throw new Error("No campaignId available to publish");
      }

      // Publish the campaign directly (no update call needed)
      const publishResponse = await publishCampaign.mutateAsync({
        campaignId: finalCampaignId,
      });

      // Show success notification with message from API
      const successMessage = (publishResponse as any)?.message || "Campaign published successfully";
      showSuccess(
        "Campaign Published",
        successMessage,
        5000
      );

      // Reset wizard and redirect after a short delay to show notification
      setTimeout(() => {
        resetWizard();
        navigate("/campaigns");
      }, 1000);
    } catch (error: unknown) {
      console.error("Failed to publish campaign:", error);
      const errorMessage = getErrorMessage(error);
      showError(
        "Publish Failed",
        errorMessage,
        6000
      );
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Final Publish</h2>
        <p className="text-gray-600">Review and publish your campaign</p>
      </div>

      {/* Warning Card */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-1">Important Notice</h3>
            <p className="text-sm text-yellow-800">
              After publishing, the campaign will be sent to all selected recipients. This action
              cannot be undone.
            </p>
          </div>
        </div>
      </div>

      {/* Campaign Summary */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Campaign Name</p>
            <p className="text-base font-medium text-gray-900">{wizardData.basicInfo.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Recipients</p>
            <p className="text-base font-medium text-gray-900">{wizardData.contacts.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Channel</p>
            <p className="text-base font-medium text-gray-900">
              {wizardData.basicInfo.channelCode}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Provider</p>
            <p className="text-base font-medium text-gray-900">
              {wizardData.basicInfo.apiProvider}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Placeholder */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Metrics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">-</p>
            <p className="text-sm text-gray-600">Sent</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">-</p>
            <p className="text-sm text-gray-600">Delivered</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">-</p>
            <p className="text-sm text-gray-600">Opened</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-200">
        <Button variant="outline" onClick={onPrevious} disabled={isPublishing}>
          Previous
        </Button>
        <Button
          variant="primary"
          onClick={handlePublish}
          isLoading={isPublishing}
          disabled={isPublishing}
        >
          Publish Campaign
        </Button>
      </div>
    </div>
  );
}

import { AlertTriangle } from "lucide-react";
import { useCampaignWizard } from "@/contexts/CampaignWizardContext";
import { usePublishCampaign, useCreateCampaign, useUpdateCampaign } from "@/hooks/useCampaigns";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToastContext } from "@/contexts/ToastContext";
import { convertToEmailHtml } from "@/components/campaigns/CampaignEmailEditor";

interface StepPublishProps {
  onPrevious: () => void;
}

export default function StepPublish({ onPrevious }: StepPublishProps) {
  const { wizardData, resetWizard, campaignId } = useCampaignWizard();
  const publishCampaign = usePublishCampaign();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      let finalCampaignId = campaignId;

      // If editing existing campaign, update it first with all current data
      if (finalCampaignId) {
        await updateCampaign.mutateAsync({
          id: finalCampaignId,
          payload: {
            ...wizardData.basicInfo,
            htmlBody: convertToEmailHtml(wizardData.emailContent.htmlBody),
            textBody: wizardData.emailContent.textBody,
            contacts: wizardData.contacts,
          },
        });
      } else {
        // If no campaign ID, create the campaign first
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

      // Publish the campaign
      const publishResponse = await publishCampaign.mutateAsync({
        campaignId: finalCampaignId,
      });

      // Show success notification with campaign details
      if (publishResponse && typeof publishResponse === 'object') {
        const responseData = (publishResponse as any).data;
        if (responseData) {
          const sent = responseData.sent || 0;
          const failed = responseData.failed || 0;
          const totalRecipients = responseData.totalRecipients || 0;
          const emails = responseData.emails || [];
          
          const message = `Sent to ${sent} recipient(s)${failed > 0 ? `, ${failed} failed` : ""}. Total: ${totalRecipients}${emails.length > 0 ? ` (${emails.slice(0, 3).join(", ")}${emails.length > 3 ? "..." : ""})` : ""}`;
          
          showSuccess(
            "Campaign Published Successfully!",
            message,
            8000 // Show for 8 seconds
          );
        } else {
          showSuccess(
            "Campaign Published Successfully!",
            (publishResponse as any).message || "Your campaign has been sent to all selected recipients.",
            5000
          );
        }
      } else {
        showSuccess(
          "Campaign Published Successfully!",
          "Your campaign has been sent to all selected recipients.",
          5000
        );
      }

      // Reset wizard and redirect after a short delay to show notification
      setTimeout(() => {
        resetWizard();
        navigate("/campaigns");
      }, 1000);
    } catch (error: any) {
      console.error("Failed to publish campaign:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to publish campaign";
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

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useCampaignWizard } from "@/contexts/CampaignWizardContext";
import { useCreateCampaign, useUpdateCampaign } from "@/hooks/useCampaigns";
import Button from "@/components/ui/Button";

const emailContentSchema = z.object({
  textBody: z.string().optional(),
  htmlBody: z.string().min(1, "HTML body is required"),
});

type EmailContentFormData = z.infer<typeof emailContentSchema>;

interface StepEmailContentProps {
  onNext: () => void;
  onPrevious: () => void;
}

export default function StepEmailContent({ onNext, onPrevious }: StepEmailContentProps) {
  const { wizardData, updateEmailContent, campaignId, setCampaignId } = useCampaignWizard();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<EmailContentFormData>({
    resolver: zodResolver(emailContentSchema),
    defaultValues: wizardData.emailContent,
    mode: "onChange",
  });

  // Reset form when wizard data changes
  useEffect(() => {
    reset(wizardData.emailContent);
  }, [wizardData.emailContent, reset]);

  const htmlBody = watch("htmlBody");

  const onSubmit = async (data: EmailContentFormData) => {
    // Ensure we always store both fields, falling back to empty string for textBody
    updateEmailContent({
      htmlBody: data.htmlBody,
      textBody: data.textBody ?? "",
    });
    
    // Auto-save draft when moving to next step
    setIsSavingDraft(true);
    try {
      if (campaignId) {
        // UPDATE: Campaign exists, use PUT to update - send ALL current wizard data
        console.log("🔄 Updating existing campaign:", campaignId);
        const updatePayload: any = {
          // Basic info from previous steps
          name: wizardData.basicInfo.name,
          channelCode: wizardData.basicInfo.channelCode,
          apiProvider: wizardData.basicInfo.apiProvider,
          subject: wizardData.basicInfo.subject,
          // Current step data
          htmlBody: data.htmlBody,
          status: "DRAFT", // Always keep status as DRAFT when updating
        };
        // Only include textBody if it has a value
        if (data.textBody && data.textBody.trim() !== "") {
          updatePayload.textBody = data.textBody;
        }
        // Include contacts from previous/current steps
        if (wizardData.contacts && wizardData.contacts.length > 0) {
          updatePayload.contacts = wizardData.contacts;
        }
        
        await updateCampaign.mutateAsync({
          id: campaignId,
          payload: updatePayload,
        });
      } else {
        // CREATE: First time only, use POST to create (if basic info exists)
        if (wizardData.basicInfo.name && wizardData.basicInfo.subject) {
          console.log("✨ Creating new campaign (first time)");
          const createPayload: any = {
            ...wizardData.basicInfo,
            htmlBody: data.htmlBody,
            status: "DRAFT", // Always set status to DRAFT for new campaigns
          };
          // Only include textBody if it exists
          if (data.textBody && data.textBody.trim() !== "") {
            createPayload.textBody = data.textBody;
          }
          // Only include contacts if they exist
          if (wizardData.contacts && wizardData.contacts.length > 0) {
            createPayload.contacts = wizardData.contacts;
          } else {
            createPayload.contacts = [];
          }
          
          const newCampaign = await createCampaign.mutateAsync(createPayload);
          // Store the campaign ID for subsequent steps - now all future saves will be UPDATE
          if (newCampaign?.id) {
            setCampaignId(newCampaign.id);
            console.log("✅ Campaign created with ID:", newCampaign.id);
          }
        }
      }
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setIsSavingDraft(false);
    }
    
    onNext();
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    const formData = watch();
    updateEmailContent({
      htmlBody: formData.htmlBody,
      textBody: formData.textBody ?? "",
    });

    try {
      if (campaignId) {
        // UPDATE: Campaign exists, use PUT to update - send ALL current wizard data
        console.log("🔄 Updating existing campaign:", campaignId);
        const updatePayload: any = {
          // Basic info from previous steps
          name: wizardData.basicInfo.name,
          channelCode: wizardData.basicInfo.channelCode,
          apiProvider: wizardData.basicInfo.apiProvider,
          subject: wizardData.basicInfo.subject,
          // Current step data
          htmlBody: formData.htmlBody,
          status: "DRAFT", // Always keep status as DRAFT when updating
        };
        // Only include textBody if it has a value
        if (formData.textBody && formData.textBody.trim() !== "") {
          updatePayload.textBody = formData.textBody;
        }
        // Include contacts from previous/current steps
        if (wizardData.contacts && wizardData.contacts.length > 0) {
          updatePayload.contacts = wizardData.contacts;
        }
        
        await updateCampaign.mutateAsync({
          id: campaignId,
          payload: updatePayload,
        });
      } else {
        // CREATE: First time only, use POST to create
        console.log("✨ Creating new campaign (first time)");
        const createPayload: any = {
          ...wizardData.basicInfo,
          htmlBody: formData.htmlBody,
          status: "DRAFT", // Always set status to DRAFT for new campaigns
        };
        // Only include textBody if it exists
        if (formData.textBody && formData.textBody.trim() !== "") {
          createPayload.textBody = formData.textBody;
        }
        // Only include contacts if they exist
        if (wizardData.contacts && wizardData.contacts.length > 0) {
          createPayload.contacts = wizardData.contacts;
        } else {
          createPayload.contacts = [];
        }
        
        const newCampaign = await createCampaign.mutateAsync(createPayload);
        // Store the campaign ID for subsequent steps - now all future saves will be UPDATE
        if (newCampaign?.id) {
          setCampaignId(newCampaign.id);
          console.log("✅ Campaign created with ID:", newCampaign.id);
        }
      }
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setIsSavingDraft(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Email Content</h2>
        <p className="text-gray-600">Create your email content with HTML support</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Text Body
              </label>
              <textarea
                {...register("textBody")}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Plain text version (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                HTML Body <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("htmlBody")}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="<html>...</html>"
              />
              {errors.htmlBody && (
                <p className="mt-1 text-sm text-red-600">{errors.htmlBody.message}</p>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Live Preview</label>
            <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm min-h-[400px]">
              <iframe
                srcDoc={htmlBody || "<p>Preview will appear here...</p>"}
                className="w-full h-full min-h-[400px] border-0 rounded"
                title="Email Preview"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleSaveDraft}
            isLoading={isSavingDraft}
          >
            Save Draft
          </Button>
          <Button type="submit" disabled={!isValid}>
            Next
          </Button>
        </div>
      </div>
    </form>
  );
}

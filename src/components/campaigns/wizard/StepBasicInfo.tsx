import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useCampaignWizard } from "@/contexts/CampaignWizardContext";
import { useCreateCampaign, useUpdateCampaign } from "@/hooks/useCampaigns";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

const basicInfoSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  channelCode: z.string().min(1, "Channel code is required"),
  apiProvider: z.string().min(1, "API provider is required"),
  subject: z.string().min(1, "Subject is required"),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

interface StepBasicInfoProps {
  onNext: () => void;
}

export default function StepBasicInfo({ onNext }: StepBasicInfoProps) {
  const { wizardData, updateBasicInfo, campaignId, setCampaignId } = useCampaignWizard();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const [isSaving, setIsSaving] = useState(false);

  const [searchParams] = useSearchParams();
  const initialChannelFromUrl = (searchParams.get("channel") || "").toUpperCase();
  const initialChannelCode =
    (initialChannelFromUrl === "EMAIL" || initialChannelFromUrl === "WHATSAPP"
      ? initialChannelFromUrl
      : wizardData.basicInfo.channelCode || "EMAIL") as "EMAIL" | "WHATSAPP";

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      ...wizardData.basicInfo,
      channelCode: initialChannelCode,
    },
    mode: "onChange",
  });

  // Reset form when wizard data changes (e.g., when loading campaign for edit)
  useEffect(() => {
    reset(wizardData.basicInfo);
  }, [wizardData.basicInfo, reset]);

  const onSubmit = async (data: BasicInfoFormData) => {
    updateBasicInfo(data);
    
    // Auto-save draft when moving to next step
    setIsSaving(true);
    try {
      if (campaignId) {
        // UPDATE: Campaign exists, use PUT to update - send ALL current wizard data
        console.log("🔄 Updating existing campaign:", campaignId);
        const updatePayload: any = {
          // Current step data
          name: data.name,
          channelCode: data.channelCode,
          apiProvider: data.apiProvider,
          subject: data.subject,
          status: "DRAFT", // Always keep status as DRAFT when updating
        };
        // Include email content from previous/current steps
        if (wizardData.emailContent.htmlBody && wizardData.emailContent.htmlBody.trim() !== "") {
          updatePayload.htmlBody = wizardData.emailContent.htmlBody;
        }
        if (wizardData.emailContent.textBody && wizardData.emailContent.textBody.trim() !== "") {
          updatePayload.textBody = wizardData.emailContent.textBody;
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
        // CREATE: First time, use POST to create - only send basic info, no empty fields
        console.log("✨ Creating new campaign (first time)");
        const createPayload: any = {
          name: data.name,
          channelCode: data.channelCode,
          apiProvider: data.apiProvider,
          subject: data.subject,
          status: "DRAFT", // Always set status to DRAFT for new campaigns
        };
        // Only include email content if it exists
        if (wizardData.emailContent.htmlBody && wizardData.emailContent.htmlBody.trim() !== "") {
          createPayload.htmlBody = wizardData.emailContent.htmlBody;
        }
        if (wizardData.emailContent.textBody && wizardData.emailContent.textBody.trim() !== "") {
          createPayload.textBody = wizardData.emailContent.textBody;
        }
        // Do NOT send contacts in Basic Info step - contacts will be added in Step 3
        
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
      setIsSaving(false);
    }
    
    onNext();
  };

  const channelCodeOptions = [
    { value: "EMAIL", label: "EMAIL" },
    { value: "WHATSAPP", label: "WHATSAPP" },
  ];

  const apiProviderOptions = [
    { value: "SENDGRID", label: "SENDGRID" },
    { value: "MAILGUN", label: "MAILGUN" },
    { value: "AWS_SES", label: "AWS SES" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
        <p className="text-gray-600">Enter the basic details for your campaign</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Campaign Name"
            {...register("name")}
            error={errors.name?.message}
            placeholder="Enter campaign name"
          />
          <Select
            label="Channel Code"
            {...register("channelCode")}
            error={errors.channelCode?.message}
            options={channelCodeOptions}
          />
          <Select
            label="API Provider"
            {...register("apiProvider")}
            error={errors.apiProvider?.message}
            options={apiProviderOptions}
          />
          <Input
            label="Subject"
            {...register("subject")}
            error={errors.subject?.message}
            placeholder="Enter email subject"
          />
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Button type="submit" disabled={!isValid || isSaving} isLoading={isSaving}>
          Next
        </Button>
      </div>
    </form>
  );
}

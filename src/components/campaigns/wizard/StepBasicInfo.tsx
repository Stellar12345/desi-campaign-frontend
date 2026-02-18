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
  const { wizardData, updateBasicInfo, campaignId } = useCampaignWizard();
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
    
    // Auto-save draft when moving to next step (if editing)
    if (campaignId) {
      setIsSaving(true);
      try {
        await updateCampaign.mutateAsync({
          id: campaignId,
          payload: {
            name: data.name,
            channelCode: data.channelCode,
            apiProvider: data.apiProvider,
            subject: data.subject,
          },
        });
      } catch (error) {
        console.error("Failed to save:", error);
      } finally {
        setIsSaving(false);
      }
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

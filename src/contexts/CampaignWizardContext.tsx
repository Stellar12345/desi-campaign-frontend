import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { CampaignWizardData, Campaign } from "@/types";

interface CampaignWizardContextType {
  wizardData: CampaignWizardData;
  campaignId?: string;
  updateBasicInfo: (data: CampaignWizardData["basicInfo"]) => void;
  updateEmailContent: (data: CampaignWizardData["emailContent"]) => void;
  updateContacts: (contacts: string[]) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetWizard: () => void;
  loadCampaign: (campaign: Campaign) => void;
}

const initialWizardData: CampaignWizardData = {
  step: 1,
  basicInfo: {
    name: "",
    channelCode: "EMAIL",
    apiProvider: "SENDGRID",
    subject: "",
  },
  emailContent: {
    textBody: "",
    htmlBody: "",
  },
  contacts: [],
  isDraft: true,
};

const CampaignWizardContext = createContext<CampaignWizardContextType | undefined>(undefined);

export function CampaignWizardProvider({
  children,
  campaignId,
  initialCampaign,
}: {
  children: ReactNode;
  campaignId?: string;
  initialCampaign?: Campaign;
}) {
  const [wizardData, setWizardData] = useState<CampaignWizardData>(initialWizardData);

  const loadCampaign = (campaign: Campaign) => {
    setWizardData({
      step: 1,
      basicInfo: {
        name: campaign.name || "",
        channelCode: campaign.channelCode || "EMAIL",
        apiProvider: campaign.apiProvider || "SENDGRID",
        subject: campaign.subject || "",
      },
      emailContent: {
        textBody: campaign.textBody || "",
        htmlBody: campaign.htmlBody || "",
      },
      contacts: campaign.contacts?.map((c) => c.contactId || c.id) || [],
      isDraft: campaign.status === "DRAFT",
    });
  };

  // Load campaign data if provided
  useEffect(() => {
    if (initialCampaign) {
      loadCampaign(initialCampaign);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCampaign]);

  const updateBasicInfo = (data: CampaignWizardData["basicInfo"]) => {
    setWizardData((prev) => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, ...data },
    }));
  };

  const updateEmailContent = (data: CampaignWizardData["emailContent"]) => {
    setWizardData((prev) => ({
      ...prev,
      emailContent: { ...prev.emailContent, ...data },
    }));
  };

  const updateContacts = (contacts: string[]) => {
    setWizardData((prev) => ({
      ...prev,
      contacts,
    }));
  };

  const setStep = (step: number) => {
    setWizardData((prev) => ({
      ...prev,
      step: Math.max(1, Math.min(5, step)),
    }));
  };

  const nextStep = () => {
    setWizardData((prev) => ({
      ...prev,
      step: Math.min(5, prev.step + 1),
    }));
  };

  const prevStep = () => {
    setWizardData((prev) => ({
      ...prev,
      step: Math.max(1, prev.step - 1),
    }));
  };

  const resetWizard = () => {
    setWizardData(initialWizardData);
  };

  return (
    <CampaignWizardContext.Provider
      value={{
        wizardData,
        campaignId,
        updateBasicInfo,
        updateEmailContent,
        updateContacts,
        setStep,
        nextStep,
        prevStep,
        resetWizard,
        loadCampaign,
      }}
    >
      {children}
    </CampaignWizardContext.Provider>
  );
}

export function useCampaignWizard() {
  const context = useContext(CampaignWizardContext);
  if (context === undefined) {
    throw new Error("useCampaignWizard must be used within CampaignWizardProvider");
  }
  return context;
}

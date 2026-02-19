import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useCampaignWizard } from "@/contexts/CampaignWizardContext";
import Stepper from "./Stepper";
import StepBasicInfo from "./StepBasicInfo";
import StepEmailContent from "./StepEmailContent";
import StepContacts from "./StepContacts";
import StepReview from "./StepReview";
import StepPublish from "./StepPublish";
import { FileText, Mail, Users, Eye, Send } from "lucide-react";

const steps = [
  { number: 1, label: "Basic Info", icon: <FileText className="w-6 h-6" /> },
  { number: 2, label: "Email Content", icon: <Mail className="w-6 h-6" /> },
  { number: 3, label: "Add Contacts", icon: <Users className="w-6 h-6" /> },
  { number: 4, label: "Review", icon: <Eye className="w-6 h-6" /> },
  { number: 5, label: "Publish", icon: <Send className="w-6 h-6" /> },
];

interface CampaignWizardProps {
  campaignId?: string;
}

export default function CampaignWizard({ campaignId }: CampaignWizardProps) {
  const { wizardData, nextStep, prevStep, setStep } = useCampaignWizard();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Handle step query parameter from URL
  useEffect(() => {
    const stepParam = searchParams.get("step");
    if (stepParam) {
      const stepNumber = parseInt(stepParam, 10);
      if (stepNumber >= 1 && stepNumber <= 5 && stepNumber !== wizardData.step) {
        setStep(stepNumber);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const renderStep = () => {
    switch (wizardData.step) {
      case 1:
        return <StepBasicInfo onNext={nextStep} />;
      case 2:
        return <StepEmailContent onNext={nextStep} onPrevious={prevStep} />;
      case 3:
        return <StepContacts onNext={nextStep} onPrevious={prevStep} />;
      case 4:
        return <StepReview onNext={nextStep} onPrevious={prevStep} onEditStep={setStep} />;
      case 5:
        return <StepPublish onPrevious={prevStep} />;
      default:
        return <StepBasicInfo onNext={nextStep} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {campaignId ? "Edit Campaign" : "Create Campaign"}
            </h1>
            <p className="text-gray-600">
              {campaignId
                ? "Edit your campaign and publish when ready"
                : "Follow the steps to create and publish your campaign"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/campaigns")}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <span className="inline-block rounded-full border border-gray-300 px-2 py-1 text-xs font-medium mr-1">
              ←
            </span>
            Back to Campaigns
          </button>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <Stepper currentStep={wizardData.step} steps={steps} />
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <AnimatePresence mode="wait">
            <motion.div
              key={wizardData.step}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

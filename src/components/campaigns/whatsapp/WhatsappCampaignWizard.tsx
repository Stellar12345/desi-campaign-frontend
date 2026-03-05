import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import StepContacts from "@/components/campaigns/wizard/StepContacts";
import Stepper from "@/components/campaigns/wizard/Stepper";
import apiClient from "@/services/api";
import Skeleton from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";

// Minimal placeholder wizard to route WhatsApp campaigns away from the email wizard.
// You can later replace the inner steps with full WhatsApp-specific implementation.

interface WhatsappTemplate {
  id: string;
  sid: string;
  friendlyName: string;
  language: string;
  variables: Record<string, string>;
  types: Record<string, any>;
  twilioUrl?: string;
}

const stepItems = [
  { number: 1, label: "Select Template", icon: null },
  { number: 2, label: "Configure Variables", icon: null },
  { number: 3, label: "Preview Message", icon: null },
  { number: 4, label: "Add Contacts", icon: null },
  { number: 5, label: "Review", icon: null },
  { number: 6, label: "Publish", icon: null },
];

export default function WhatsappCampaignWizard() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [selectedTemplateSid, setSelectedTemplateSid] = useState<string>("");

  const next = () => setCurrent((c) => Math.min(stepItems.length - 1, c + 1));
  const prev = () => setCurrent((c) => Math.max(0, c - 1));

  // Load WhatsApp templates for step 1
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoadingTemplates(true);
      try {
        const res = await apiClient.get<any>("/private/whatsapp-templates");
        const items: WhatsappTemplate[] =
          res.data?.data?.items || res.data?.data || res.data?.items || [];
        if (mounted) {
          setTemplates(items);
        }
      } catch (error) {
        console.error("Failed to load WhatsApp templates:", error);
      } finally {
        if (mounted) setIsLoadingTemplates(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const renderStepContent = () => {
    switch (current) {
      // Step 1: Select Template (API-backed)
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Select Template</h2>
              <p className="text-gray-600">
                Choose a WhatsApp template to start your campaign.
              </p>
            </div>

            {isLoadingTemplates ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            ) : templates.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-500">
                No WhatsApp templates found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((tpl) => {
                  // Derive a simple preview/body text from the first type entry
                  const firstType = Object.values(tpl.types || {})[0] as any;
                  const body: string =
                    (firstType && typeof firstType.body === "string"
                      ? firstType.body
                      : "") || "";
                  const isSelected = selectedTemplateSid === tpl.sid;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplateSid(tpl.sid)}
                      className={[
                        "text-left rounded-2xl border p-4 transition shadow-sm hover:shadow-md focus:outline-none",
                        isSelected
                          ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50/40"
                          : "border-gray-200 bg-white",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {tpl.friendlyName}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {tpl.language}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2 break-words line-clamp-3">
                        {body || "No preview text available."}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Type: {Object.keys(tpl.types || {}).join(", ") || "N/A"}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={next}
                disabled={!selectedTemplateSid}
              >
                Next
              </Button>
            </div>
          </div>
        );

      case 3:
        // For now reuse existing contacts selector to prove routing works.
        return <StepContacts onNext={next} onPrevious={prev} />;
      default:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              WhatsApp Wizard – Step {current + 1}
            </h2>
            <p className="text-gray-600">
              This is a placeholder step. Routing is now using the dedicated WhatsApp
              wizard instead of the email wizard.
            </p>
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prev}
                disabled={current === 0}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={next}
                disabled={current === stepItems.length - 1}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header (matches email wizard style) */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate("/campaigns?channel=whatsapp")}
            className="flex items-center gap-3 text-3xl font-bold text-gray-900 mb-2 hover:text-gray-700 transition-colors group"
          >
            <ArrowLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
            <span>Create WhatsApp Campaign</span>
          </button>
          <p className="text-gray-600">
            Follow the steps to create and publish your WhatsApp campaign.
          </p>
        </div>

        {/* Stepper - reuse existing email wizard Stepper with WhatsApp labels */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <Stepper currentStep={current + 1} steps={stepItems} />
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
}


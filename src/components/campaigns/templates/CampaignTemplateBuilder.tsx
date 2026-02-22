import { FC, useState, useEffect } from "react";
import {
  TemplateType,
  TemplateInputs,
  generateTemplateHtml,
  detectTemplateType,
  extractTemplateInputs,
} from "@/utils/emailTemplates";
import { TemplateSelector } from "./TemplateSelector";
import { TemplateInputForm } from "./TemplateInputForm";
import { TemplatePreview } from "./TemplatePreview";

interface CampaignTemplateBuilderProps {
  onHtmlGenerated: (html: string) => void;
  existingHtmlBody?: string;
}

export const CampaignTemplateBuilder: FC<CampaignTemplateBuilderProps> = ({
  onHtmlGenerated,
  existingHtmlBody,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState<string>("");
  const [templateInputs, setTemplateInputs] = useState<Partial<TemplateInputs>>({});

  // Detect and restore template when existing HTML is provided
  // This runs when component mounts or when existingHtmlBody changes (e.g., editing from Review)
  useEffect(() => {
    if (existingHtmlBody && existingHtmlBody.trim().length > 0) {
      const detectedType = detectTemplateType(existingHtmlBody);
      if (detectedType) {
        // Only restore if we haven't already set this template
        // This prevents resetting when user is actively editing
        if (!selectedTemplate || selectedTemplate !== detectedType) {
          const extractedInputs = extractTemplateInputs(existingHtmlBody, detectedType);
          setSelectedTemplate(detectedType);
          setTemplateInputs(extractedInputs);
          setGeneratedHtml(existingHtmlBody);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingHtmlBody]); // Only depend on existingHtmlBody to restore on mount/edit

  const handleSelectTemplate = (templateType: TemplateType) => {
    setSelectedTemplate(templateType);
    setTemplateInputs({});
    setGeneratedHtml("");
  };

  const handleGenerateTemplate = (inputs: TemplateInputs) => {
    if (!selectedTemplate) return;

    const html = generateTemplateHtml(selectedTemplate, inputs);
    setGeneratedHtml(html);
    setTemplateInputs(inputs);
    // Automatically update HTML body when template is generated
    onHtmlGenerated(html);
  };

  const handleCancelTemplate = () => {
    setSelectedTemplate(null);
    setGeneratedHtml("");
    setTemplateInputs({});
  };

  return (
    <div className="space-y-6">
      {!selectedTemplate ? (
        <TemplateSelector onSelectTemplate={handleSelectTemplate} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Template Configuration</h3>
              <button
                type="button"
                onClick={handleCancelTemplate}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to Templates
              </button>
            </div>
            <TemplateInputForm
              templateType={selectedTemplate}
              initialValues={templateInputs}
              onSubmit={handleGenerateTemplate}
              onCancel={handleCancelTemplate}
            />
          </div>

          {/* Preview */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {generatedHtml ? (
              <TemplatePreview htmlContent={generatedHtml} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-sm">Fill in the form to generate template preview</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

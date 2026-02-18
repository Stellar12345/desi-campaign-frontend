import { Edit } from "lucide-react";
import { useCampaignWizard } from "@/contexts/CampaignWizardContext";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface StepReviewProps {
  onNext: () => void;
  onPrevious: () => void;
  onEditStep: (step: number) => void;
}

export default function StepReview({ onNext, onPrevious, onEditStep }: StepReviewProps) {
  const { wizardData } = useCampaignWizard();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Preview & Review</h2>
        <p className="text-gray-600">Review your campaign before publishing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Campaign Information</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(1)}
                className="text-blue-600"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Campaign Name</p>
                <p className="text-base font-medium text-gray-900">{wizardData.basicInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Channel Code</p>
                <p className="text-base font-medium text-gray-900">
                  {wizardData.basicInfo.channelCode}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">API Provider</p>
                <p className="text-base font-medium text-gray-900">
                  {wizardData.basicInfo.apiProvider}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Subject</p>
                <p className="text-base font-medium text-gray-900">
                  {wizardData.basicInfo.subject}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant="info">Draft</Badge>
              </div>
            </div>
          </div>

          {/* Recipients */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recipients</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(3)}
                className="text-blue-600"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {wizardData.contacts.length}
              </p>
              <p className="text-sm text-gray-600">Total recipients</p>
            </div>
          </div>
        </div>

        {/* Email Preview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(2)}
              className="text-blue-600"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-900">Subject:</p>
              <p className="text-sm text-gray-700">{wizardData.basicInfo.subject}</p>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <iframe
                srcDoc={wizardData.emailContent.htmlBody || "<p>No content</p>"}
                className="w-full h-96 border-0 rounded"
                title="Email Preview"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-200">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}

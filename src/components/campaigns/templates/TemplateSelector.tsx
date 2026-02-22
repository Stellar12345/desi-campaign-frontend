import { FC } from "react";
import { TemplateType, TEMPLATE_METADATA } from "@/utils/emailTemplates";
import Button from "@/components/ui/Button";

interface TemplateSelectorProps {
  onSelectTemplate: (templateType: TemplateType) => void;
}

export const TemplateSelector: FC<TemplateSelectorProps> = ({ onSelectTemplate }) => {
  const templates = Object.values(TEMPLATE_METADATA);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose a Template</h3>
        <p className="text-sm text-gray-600">Select a predefined template to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              {/* Thumbnail */}
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                {template.thumbnail}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-gray-900 mb-1">
                  {template.name}
                </h4>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {template.description}
                </p>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => onSelectTemplate(template.id)}
                  className="w-full"
                >
                  Use Template
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

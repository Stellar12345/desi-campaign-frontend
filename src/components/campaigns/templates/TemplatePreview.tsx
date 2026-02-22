import { FC } from "react";

interface TemplatePreviewProps {
  htmlContent: string;
}

export const TemplatePreview: FC<TemplatePreviewProps> = ({
  htmlContent,
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Template Preview</h3>
      </div>

      {/* Preview Content */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="p-4 bg-gray-50 min-h-[400px]">
          <iframe
            srcDoc={htmlContent}
            className="w-full h-full min-h-[400px] border-0 rounded bg-white"
            title="Template Preview"
          />
        </div>
      </div>
    </div>
  );
};

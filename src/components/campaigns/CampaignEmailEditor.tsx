import { FC, useCallback } from "react";
import { Editor } from "@tinymce/tinymce-react";

export interface CampaignEmailEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * TinyMCE-based email editor for campaign HTML content.
 * - Gmail-like toolbar
 * - Image upload to /api/upload
 * - Output suitable for wrapping into SendGrid htmlBody
 */
export const CampaignEmailEditor: FC<CampaignEmailEditorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const handleEditorChange = useCallback(
    (content: string) => {
      onChange(content);
    },
    [onChange]
  );

  const imagesUploadHandler = useCallback(
    (blobInfo: any, progress: (percent: number) => void): Promise<string> => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", blobInfo.blob(), blobInfo.filename());

        fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(`Upload failed with status ${response.status}`);
            }
            const json = await response.json();
            if (!json || !json.location) {
              throw new Error("Invalid upload response: missing \`location\`");
            }
            resolve(json.location as string);
          })
          .catch((error) => {
            console.error("Image upload error:", error);
            reject(error);
          });

        // Progress can be updated here if backend supports it
        progress(0);
      });
    },
    []
  );

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
        border: "1px solid #e5e7eb",
        padding: "12px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Editor
        apiKey={import.meta.env.VITE_TINYMCE_API_KEY || ""}
        value={value}
        disabled={disabled}
        onEditorChange={handleEditorChange}
        init={{
          height: 450,
          menubar: false,
          branding: false,
          statusbar: true,
          resize: true,
          plugins: ["link", "lists", "image", "preview", "code"],
          toolbar:
            "undo redo | formatselect | " +
            "bold italic underline | forecolor | " +
            "alignleft aligncenter alignright | " +
            "bullist numlist | link image | " +
            "preview code",
          skin: "oxide",
          content_style:
            "body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size:14px; margin:0; padding:12px; color:#111827; } a { color:#2563eb; }",
          forced_root_block: "p",
          remove_script_host: true,
          convert_urls: true,
          relative_urls: false,
          images_upload_handler: imagesUploadHandler,
        }}
      />
    </div>
  );
};

/**
 * Wrap TinyMCE content into an email-safe HTML wrapper for SendGrid.
 * - Table-based layout
 * - Inline styles only
 */
export function convertToEmailHtml(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Campaign Email</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; background-color:#f4f6f8; padding:24px 0;">
    <tr>
      <td align="center" style="padding:0; margin:0;">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; background-color:#ffffff; border-radius:8px; overflow:hidden;">
          <tr>
            <td style="padding:24px 24px 24px 24px; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:1.6; color:#111827;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px 24px 24px; font-family:Arial, Helvetica, sans-serif; font-size:12px; line-height:1.5; color:#6b7280; text-align:center; border-top:1px solid #e5e7eb;">
              <span style="display:block; margin-bottom:4px;">You are receiving this email because you subscribed to updates.</span>
              <span style="display:block;">If you no longer wish to receive these emails, you can unsubscribe at any time.</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}


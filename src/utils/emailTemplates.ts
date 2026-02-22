/**
 * Email Template Generator
 * Generates email-client compatible HTML templates with inline styles
 * All templates use table-based layout for maximum email client compatibility
 */

export type TemplateType = 
  | "discount" 
  | "product-launch" 
  | "festival" 
  | "announcement";

export interface DiscountTemplateInputs {
  customerName: string;
  discountPercentage: string;
  offerExpiryDate: string;
  ctaButtonText: string;
  ctaButtonLink: string;
}

export interface ProductLaunchTemplateInputs {
  productName: string;
  productImageUrl: string;
  description: string;
  ctaButtonText: string;
  ctaLink: string;
}

export interface FestivalTemplateInputs {
  festivalName: string;
  offerText: string;
  ctaButtonText: string;
  ctaLink: string;
}

export interface AnnouncementTemplateInputs {
  heading: string;
  message: string;
  ctaText: string;
  ctaLink: string;
}

export type TemplateInputs = 
  | DiscountTemplateInputs 
  | ProductLaunchTemplateInputs 
  | FestivalTemplateInputs 
  | AnnouncementTemplateInputs;

/**
 * Base email wrapper - 600px centered table layout
 */
function getEmailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Campaign Email</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; background-color:#f4f6f8; padding:24px 0;">
    <tr>
      <td align="center" style="padding:0;">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          ${content}
          <tr>
            <td style="padding:24px; font-size:12px; line-height:1.5; color:#6b7280; text-align:center; border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 8px 0;">You are receiving this email because you subscribed to updates.</p>
              <p style="margin:0;">If you no longer wish to receive these emails, you can unsubscribe at any time.</p>
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

/**
 * Discount Offer Template
 */
export function generateDiscountTemplate(inputs: DiscountTemplateInputs): string {
  const {
    customerName,
    discountPercentage,
    offerExpiryDate,
    ctaButtonText,
    ctaButtonLink,
  } = inputs;

  const content = `
    <tr>
      <td style="padding:0;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          <!-- Header Image -->
          <tr>
            <td style="padding:0; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align:center;">
              <div style="padding:40px 24px; color:#ffffff;">
                <h1 style="margin:0; font-size:32px; font-weight:bold; color:#ffffff;">Special Offer!</h1>
              </div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px 24px;">
              <h2 style="margin:0 0 16px 0; font-size:24px; font-weight:600; color:#111827;">Hello ${customerName || "Valued Customer"}!</h2>
              <p style="margin:0 0 24px 0; font-size:16px; line-height:1.6; color:#374151;">
                We have an exclusive offer just for you! Get <strong style="color:#dc2626; font-size:20px;">${discountPercentage || "20"}% OFF</strong> on your next purchase.
              </p>
              <p style="margin:0 0 24px 0; font-size:14px; line-height:1.6; color:#6b7280;">
                This offer expires on <strong>${offerExpiryDate || "December 31, 2024"}</strong>. Don't miss out on this amazing deal!
              </p>
              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin:32px 0;">
                <tr>
                  <td align="center" style="padding:0;">
                    <a href="${ctaButtonLink || "#"}" style="display:inline-block; padding:14px 32px; background-color:#2563eb; color:#ffffff; text-decoration:none; border-radius:6px; font-weight:600; font-size:16px; text-align:center;">${ctaButtonText || "Claim Offer Now"}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return getEmailWrapper(content);
}

/**
 * Product Launch Template
 */
export function generateProductLaunchTemplate(inputs: ProductLaunchTemplateInputs): string {
  const {
    productName,
    productImageUrl,
    description,
    ctaButtonText,
    ctaLink,
  } = inputs;

  const content = `
    <tr>
      <td style="padding:0;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 24px; background-color:#111827; text-align:center;">
              <h1 style="margin:0; font-size:28px; font-weight:bold; color:#ffffff;">New Product Launch</h1>
            </td>
          </tr>
          <!-- Product Image -->
          <tr>
            <td style="padding:0; text-align:center; background-color:#f9fafb;">
              ${productImageUrl ? `
                <img src="${productImageUrl}" alt="${productName || "Product"}" style="max-width:100%; height:auto; display:block; margin:0 auto;" />
              ` : `
                <div style="padding:120px 24px; background-color:#e5e7eb; color:#6b7280; font-size:16px;">
                  Product Image Placeholder
                </div>
              `}
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px 24px;">
              <h2 style="margin:0 0 16px 0; font-size:24px; font-weight:600; color:#111827; text-align:center;">${productName || "Introducing Our New Product"}</h2>
              <p style="margin:0 0 24px 0; font-size:16px; line-height:1.8; color:#374151; text-align:center;">
                ${description || "We're excited to introduce our latest innovation. Experience the future of quality and design."}
              </p>
              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin:32px 0;">
                <tr>
                  <td align="center" style="padding:0;">
                    <a href="${ctaLink || "#"}" style="display:inline-block; padding:14px 32px; background-color:#059669; color:#ffffff; text-decoration:none; border-radius:6px; font-weight:600; font-size:16px; text-align:center;">${ctaButtonText || "Learn More"}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return getEmailWrapper(content);
}

/**
 * Festival / Seasonal Promotion Template
 */
export function generateFestivalTemplate(inputs: FestivalTemplateInputs): string {
  const {
    festivalName,
    offerText,
    ctaButtonText,
    ctaLink,
  } = inputs;

  const content = `
    <tr>
      <td style="padding:0;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          <!-- Header -->
          <tr>
            <td style="padding:40px 24px; background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%); text-align:center;">
              <h1 style="margin:0; font-size:32px; font-weight:bold; color:#ffffff; text-transform:uppercase; letter-spacing:1px;">${festivalName || "Festival Celebration"}</h1>
              <p style="margin:16px 0 0 0; font-size:18px; color:#ffffff; font-weight:500;">Special Promotions Await!</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px 24px; background-color:#fef3c7;">
              <div style="text-align:center; margin-bottom:32px;">
                <p style="margin:0; font-size:20px; font-weight:600; color:#92400e; line-height:1.6;">
                  ${offerText || "Celebrate this special occasion with exclusive deals and offers!"}
                </p>
              </div>
              <div style="background-color:#ffffff; padding:24px; border-radius:8px; border:2px solid #fbbf24;">
                <p style="margin:0 0 16px 0; font-size:16px; line-height:1.8; color:#374151; text-align:center;">
                  Don't miss out on our limited-time festival offers. Shop now and save big!
                </p>
                <!-- CTA Button -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin:24px 0 0 0;">
                  <tr>
                    <td align="center" style="padding:0;">
                      <a href="${ctaLink || "#"}" style="display:inline-block; padding:14px 32px; background-color:#f59e0b; color:#ffffff; text-decoration:none; border-radius:6px; font-weight:600; font-size:16px; text-align:center;">${ctaButtonText || "Shop Now"}</a>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return getEmailWrapper(content);
}

/**
 * Announcement Template
 */
export function generateAnnouncementTemplate(inputs: AnnouncementTemplateInputs): string {
  const {
    heading,
    message,
    ctaText,
    ctaLink,
  } = inputs;

  const content = `
    <tr>
      <td style="padding:0;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 24px; background-color:#1f2937; text-align:center;">
              <h1 style="margin:0; font-size:26px; font-weight:600; color:#ffffff;">Important Announcement</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px 24px;">
              <h2 style="margin:0 0 20px 0; font-size:22px; font-weight:600; color:#111827;">${heading || "We Have News!"}</h2>
              <div style="margin:0 0 32px 0; font-size:16px; line-height:1.8; color:#374151;">
                ${message || "We're excited to share some important updates with you. Stay tuned for more information."}
              </div>
              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin:32px 0 0 0;">
                <tr>
                  <td align="center" style="padding:0;">
                    <a href="${ctaLink || "#"}" style="display:inline-block; padding:14px 32px; background-color:#6366f1; color:#ffffff; text-decoration:none; border-radius:6px; font-weight:600; font-size:16px; text-align:center;">${ctaText || "Read More"}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return getEmailWrapper(content);
}

/**
 * Main template generator function
 */
export function generateTemplateHtml(
  templateType: TemplateType,
  inputs: TemplateInputs
): string {
  switch (templateType) {
    case "discount":
      return generateDiscountTemplate(inputs as DiscountTemplateInputs);
    case "product-launch":
      return generateProductLaunchTemplate(inputs as ProductLaunchTemplateInputs);
    case "festival":
      return generateFestivalTemplate(inputs as FestivalTemplateInputs);
    case "announcement":
      return generateAnnouncementTemplate(inputs as AnnouncementTemplateInputs);
    default:
      throw new Error(`Unknown template type: ${templateType}`);
  }
}

/**
 * Template metadata for UI display
 */
export interface TemplateMetadata {
  id: TemplateType;
  name: string;
  description: string;
  thumbnail: string; // CSS gradient or emoji for preview
}

export const TEMPLATE_METADATA: Record<TemplateType, TemplateMetadata> = {
  discount: {
    id: "discount",
    name: "Discount Offer",
    description: "Perfect for promotional campaigns and special offers",
    thumbnail: "🎁",
  },
  "product-launch": {
    id: "product-launch",
    name: "Product Launch",
    description: "Announce new products with style",
    thumbnail: "🚀",
  },
  festival: {
    id: "festival",
    name: "Festival / Seasonal",
    description: "Celebrate holidays and special occasions",
    thumbnail: "🎉",
  },
  announcement: {
    id: "announcement",
    name: "Announcement",
    description: "Share important news and updates",
    thumbnail: "📢",
  },
};

/**
 * Detect template type from HTML content
 * More robust detection that checks for template-specific markers
 */
export function detectTemplateType(html: string): TemplateType | null {
  if (!html || html.trim().length === 0) return null;

  // Normalize HTML for better matching (remove extra whitespace)
  const normalizedHtml = html.replace(/\s+/g, " ");

  // Check for discount template - has "Special Offer!" and discount percentage pattern
  if (
    (normalizedHtml.includes("Special Offer!") || normalizedHtml.includes("SpecialOffer!")) &&
    (normalizedHtml.includes("% OFF") || normalizedHtml.includes("%OFF") || /%\s*OFF/i.test(normalizedHtml))
  ) {
    return "discount";
  }

  // Check for product launch - has "New Product Launch" or "Introducing Our New Product"
  if (
    normalizedHtml.includes("New Product Launch") ||
    normalizedHtml.includes("NewProductLaunch") ||
    normalizedHtml.includes("Introducing Our New Product") ||
    normalizedHtml.includes("IntroducingOurNewProduct")
  ) {
    return "product-launch";
  }

  // Check for festival - has orange/yellow gradient colors (#f59e0b, #d97706) and festival markers
  if (
    (normalizedHtml.includes("background:linear-gradient(135deg, #f59e0b") ||
      normalizedHtml.includes("background:linear-gradient(135deg,#f59e0b") ||
      normalizedHtml.includes("#f59e0b")) &&
    (normalizedHtml.includes("Special Promotions Await") ||
      normalizedHtml.includes("Festival Celebration") ||
      normalizedHtml.includes("FestivalCelebration"))
  ) {
    return "festival";
  }

  // Check for announcement - has "Important Announcement" or "We Have News!"
  if (
    normalizedHtml.includes("Important Announcement") ||
    normalizedHtml.includes("ImportantAnnouncement") ||
    normalizedHtml.includes("We Have News!") ||
    normalizedHtml.includes("WeHaveNews!")
  ) {
    return "announcement";
  }

  return null;
}

/**
 * Extract template inputs from HTML content
 */
export function extractTemplateInputs(html: string, templateType: TemplateType): Partial<TemplateInputs> {
  if (!html || !templateType) return {};

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  switch (templateType) {
    case "discount": {
      const h2 = doc.querySelector("h2");
      const customerNameMatch = h2?.textContent?.match(/Hello\s+(.+?)!/);
      const discountMatch = html.match(/(\d+)% OFF/);
      const expiryMatch = html.match(/expires on\s+<strong>(.+?)<\/strong>/);
      const ctaButton = doc.querySelector('a[href*="http"]');
      const ctaText = ctaButton?.textContent?.trim();
      const ctaLink = ctaButton?.getAttribute("href");

      return {
        customerName: customerNameMatch?.[1] || "",
        discountPercentage: discountMatch?.[1] || "",
        offerExpiryDate: expiryMatch?.[1] || "",
        ctaButtonText: ctaText || "",
        ctaButtonLink: ctaLink || "",
      };
    }

    case "product-launch": {
      const h2 = doc.querySelector("h2");
      const productName = h2?.textContent?.trim();
      const img = doc.querySelector("img");
      const productImageUrl = img?.getAttribute("src");
      const p = doc.querySelector("p");
      const description = p?.textContent?.trim();
      const ctaButton = doc.querySelector('a[href*="http"]');
      const ctaText = ctaButton?.textContent?.trim();
      const ctaLink = ctaButton?.getAttribute("href");

      return {
        productName: productName || "",
        productImageUrl: productImageUrl || "",
        description: description || "",
        ctaButtonText: ctaText || "",
        ctaLink: ctaLink || "",
      };
    }

    case "festival": {
      const h1 = doc.querySelector("h1");
      const festivalName = h1?.textContent?.trim();
      const offerTextElement = doc.querySelector("p[style*='color:#92400e']");
      const offerText = offerTextElement?.textContent?.trim();
      const ctaButton = doc.querySelector('a[href*="http"]');
      const ctaText = ctaButton?.textContent?.trim();
      const ctaLink = ctaButton?.getAttribute("href");

      return {
        festivalName: festivalName || "",
        offerText: offerText || "",
        ctaButtonText: ctaText || "",
        ctaLink: ctaLink || "",
      };
    }

    case "announcement": {
      const h2 = doc.querySelector("h2");
      const heading = h2?.textContent?.trim();
      const messageDiv = doc.querySelector("div[style*='line-height:1.8']");
      const message = messageDiv?.textContent?.trim();
      const ctaButton = doc.querySelector('a[href*="http"]');
      const ctaText = ctaButton?.textContent?.trim();
      const ctaLink = ctaButton?.getAttribute("href");

      return {
        heading: heading || "",
        message: message || "",
        ctaText: ctaText || "",
        ctaLink: ctaLink || "",
      };
    }

    default:
      return {};
  }
}

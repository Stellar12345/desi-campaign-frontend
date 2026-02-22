import { FC } from "react";
import { useForm } from "react-hook-form";
import {
  TemplateType,
  DiscountTemplateInputs,
  ProductLaunchTemplateInputs,
  FestivalTemplateInputs,
  AnnouncementTemplateInputs,
} from "@/utils/emailTemplates";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type TemplateInputs = 
  | DiscountTemplateInputs 
  | ProductLaunchTemplateInputs 
  | FestivalTemplateInputs 
  | AnnouncementTemplateInputs;

interface TemplateInputFormProps {
  templateType: TemplateType;
  initialValues?: Partial<TemplateInputs>;
  onSubmit: (inputs: TemplateInputs) => void;
  onCancel: () => void;
}

export const TemplateInputForm: FC<TemplateInputFormProps> = ({
  templateType,
  initialValues = {},
  onSubmit,
  onCancel,
}) => {
  // Use any for form type since we handle validation per template type
  const { register, formState: { errors }, trigger, getValues } = useForm<any>({
    defaultValues: initialValues,
  });

  const getFormFields = () => {
    switch (templateType) {
      case "discount":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Customer Name
              </label>
              <Input
                {...register("customerName", { required: "Customer name is required" })}
                placeholder="John Doe"
                error={errors.customerName?.message as string}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Discount Percentage
              </label>
              <Input
                {...register("discountPercentage", { required: "Discount percentage is required" })}
                placeholder="20"
                type="text"
                error={errors.discountPercentage?.message as string}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Offer Expiry Date
              </label>
              <Input
                {...register("offerExpiryDate", { required: "Expiry date is required" })}
                placeholder="December 31, 2024"
                error={errors.offerExpiryDate?.message as string}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                CTA Button Text
              </label>
              <Input
                {...register("ctaButtonText", { required: "CTA button text is required" })}
                placeholder="Claim Offer Now"
                error={errors.ctaButtonText?.message as string}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                CTA Button Link
              </label>
              <Input
                {...register("ctaButtonLink", { required: "CTA link is required" })}
                placeholder="https://example.com/offer"
                type="url"
                error={errors.ctaButtonLink?.message as string}
              />
            </div>
          </>
        );

      case "product-launch":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Product Name
              </label>
              <Input
                {...register("productName", { required: "Product name is required" })}
                placeholder="Amazing New Product"
                error={errors.productName?.message as string}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Product Image URL
              </label>
              <Input
                {...register("productImageUrl", { required: "Product image URL is required" })}
                placeholder="https://example.com/product-image.jpg"
                type="url"
                error={errors.productImageUrl?.message as string}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                {...register("description", { required: "Description is required" })}
                placeholder="Describe your product..."
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message as string}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                CTA Button Text
              </label>
              <Input
                {...register("ctaButtonText", { required: "CTA button text is required" })}
                placeholder="Learn More"
                error={errors.ctaButtonText?.message as string}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                CTA Link
              </label>
              <Input
                {...register("ctaLink", { required: "CTA link is required" })}
                placeholder="https://example.com/product"
                type="url"
                error={errors.ctaLink?.message as string}
              />
            </div>
          </>
        );

      case "festival":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Festival Name
              </label>
              <Input
                {...register("festivalName", { required: "Festival name is required" })}
                placeholder="Diwali Celebration"
                error={errors.festivalName?.message as string}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Offer Text
              </label>
              <textarea
                {...register("offerText", { required: "Offer text is required" })}
                placeholder="Celebrate this special occasion with exclusive deals!"
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.offerText ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.offerText && (
                <p className="mt-1 text-sm text-red-600">{errors.offerText.message as string}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                CTA Button Text
              </label>
              <Input
                {...register("ctaButtonText", { required: "CTA button text is required" })}
                placeholder="Shop Now"
                error={errors.ctaButtonText?.message as string}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                CTA Link
              </label>
              <Input
                {...register("ctaLink", { required: "CTA link is required" })}
                placeholder="https://example.com/shop"
                type="url"
                error={errors.ctaLink?.message as string}
              />
            </div>
          </>
        );

      case "announcement":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Heading
              </label>
              <Input
                {...register("heading", { required: "Heading is required" })}
                placeholder="We Have News!"
                error={errors.heading?.message as string}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Message
              </label>
              <textarea
                {...register("message", { required: "Message is required" })}
                placeholder="Share your important announcement..."
                rows={5}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.message ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message.message as string}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                CTA Text
              </label>
              <Input
                {...register("ctaText", { required: "CTA text is required" })}
                placeholder="Read More"
                error={errors.ctaText?.message as string}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                CTA Link
              </label>
              <Input
                {...register("ctaLink", { required: "CTA link is required" })}
                placeholder="https://example.com/announcement"
                type="url"
                error={errors.ctaLink?.message as string}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const handleGenerateClick = async () => {
    // Validate all fields
    const isValid = await trigger();
    if (isValid) {
      // Get form values and submit
      const values = getValues();
      onSubmit(values);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">{getFormFields()}</div>
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" variant="primary" onClick={handleGenerateClick}>
          Generate Template
        </Button>
      </div>
    </div>
  );
};

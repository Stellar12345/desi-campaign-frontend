import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { User, CreateUserPayload, UpdateUserPayload } from "@/types";

const userSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    title: z.string().optional().transform((val) => val ?? ""),
    companyName: z.string().optional().transform((val) => val ?? ""),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email"),
    corporatePhone: z.string().optional().transform((val) => val ?? ""),
    city: z.string().optional().transform((val) => val ?? ""),
    state: z.string().optional().transform((val) => val ?? ""),
    companyCity: z.string().optional().transform((val) => val ?? ""),
    companyState: z.string().optional().transform((val) => val ?? ""),
    companyCountry: z.string().optional().transform((val) => val ?? ""),
    companyPhone: z.string().optional().transform((val) => val ?? ""),
    secondaryEmail: z
      .string()
      .optional()
      .transform((val) => (val === "" ? undefined : val))
      .refine(
        (val) => !val || z.string().email().safeParse(val).success,
        "Please enter a valid secondary email"
      ),
    secondaryEmailSource: z.string().optional().transform((val) => val ?? ""),
  })
  .refine(
    (data) =>
      !data.secondaryEmail ||
      (data.secondaryEmail &&
        data.secondaryEmailSource &&
        data.secondaryEmailSource.trim().length > 0),
    {
      path: ["secondaryEmailSource"],
      message: "Secondary email source is required when secondary email is provided",
    }
  );

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserPayload | UpdateUserPayload) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function UserForm({ user, onSubmit, onCancel, isLoading }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      firstName: user?.firstName || "",
      title: user?.title || "",
      companyName: user?.companyName || "",
      email: user?.email || "",
      corporatePhone: user?.corporatePhone || user?.phoneNo || "",
      city: user?.city || "",
      state: user?.state || "",
      companyCity: user?.companyCity || "",
      companyState: user?.companyState || "",
      companyCountry: user?.companyCountry || "",
      companyPhone: user?.companyPhone || "",
      secondaryEmail: user?.secondaryEmail || undefined,
      secondaryEmailSource: user?.secondaryEmailSource || "",
    },
  });

  const handleFormSubmit = (data: UserFormData) => {
    const firstName = data.firstName?.trim() || "";

    // Transform data to match new flat API payload
    const payload: CreateUserPayload | UpdateUserPayload = {
      firstName,
      title: data.title?.trim() || "",
      companyName: data.companyName?.trim() || "",
      email: data.email.trim(),
      corporatePhone: data.corporatePhone?.trim() || "",
      city: data.city?.trim() || "",
      state: data.state?.trim() || "",
      companyCity: data.companyCity?.trim() || "",
      companyState: data.companyState?.trim() || "",
      companyCountry: data.companyCountry?.trim() || "",
      companyPhone: data.companyPhone?.trim() || "",
      secondaryEmail: data.secondaryEmail ?? null,
      secondaryEmailSource: data.secondaryEmail
        ? (data.secondaryEmailSource || "").trim()
        : null,
    };

    onSubmit(payload);
  };

  // Handle form errors - this will be called if validation fails
  const handleFormError = (errors: any) => {
    console.error("Form validation errors:", errors);
    // Log specific contact errors to help debug
    if (errors.contacts) {
      errors.contacts.forEach((contactError: any, index: number) => {
        if (contactError) {
          console.error(`Contact ${index + 1} validation errors:`, contactError);
          if (contactError.email) {
            console.error(`  - Email error: ${contactError.email.message}`);
          }
          if (contactError.phone) {
            console.error(`  - Phone error: ${contactError.phone.message}`);
          }
        }
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit, handleFormError)} className="space-y-6">
      {/* SECTION 1: Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            {...register("firstName")}
            error={errors.firstName?.message}
            placeholder="Enter first name"
          />
          <Input
            label="Title"
            {...register("title")}
            error={errors.title?.message}
            placeholder="e.g. Director"
          />
          <Input
            label="Email"
            type="email"
            {...register("email")}
            error={errors.email?.message}
            placeholder="Enter email address"
          />
          <Input
            label="Corporate Phone"
            {...register("corporatePhone")}
            error={errors.corporatePhone?.message}
            placeholder="+91 00000 00000"
          />
          <Input
            label="City"
            {...register("city")}
            error={errors.city?.message}
            placeholder="Enter city"
          />
          <Input
            label="State"
            {...register("state")}
            error={errors.state?.message}
            placeholder="Enter state"
          />
        </div>
      </div>

      {/* SECTION 2: Company Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Company Name"
            {...register("companyName")}
            error={errors.companyName?.message}
            placeholder="Enter company name"
          />
          <Input
            label="Company Phone"
            {...register("companyPhone")}
            error={errors.companyPhone?.message}
            placeholder="Company phone"
          />
          <Input
            label="Company City"
            {...register("companyCity")}
            error={errors.companyCity?.message}
            placeholder="Enter company city"
          />
          <Input
            label="Company State"
            {...register("companyState")}
            error={errors.companyState?.message}
            placeholder="Enter company state"
          />
          <Input
            label="Company Country"
            {...register("companyCountry")}
            error={errors.companyCountry?.message}
            placeholder="Enter company country"
          />
        </div>
      </div>

      {/* SECTION 3: Secondary Contact (Optional) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Secondary Contact (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Secondary Email"
            type="email"
            {...register("secondaryEmail")}
            error={errors.secondaryEmail?.message}
            placeholder="Enter secondary email (optional)"
          />
          <Input
            label="Secondary Email Source"
            {...register("secondaryEmailSource")}
            error={errors.secondaryEmailSource?.message}
            placeholder="e.g. Apollo, CRM"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {/* Use type="submit" to properly trigger form validation */}
        <Button type="submit" isLoading={isLoading}>
          {user ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  );
}

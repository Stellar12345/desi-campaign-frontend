import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import type { User, CreateUserPayload, UpdateUserPayload } from "@/types";

// Dynamic validation based on channel code
const contactSchema = z
  .object({
    id: z.string().optional(),
    userId: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    channelCode: z.string().min(1, "Channel code is required"),
    email: z.string().optional(),
    phone: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    useSameAddress: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.channelCode === "EMAIL" || data.channelCode === "EMAIL_AND_WHATSAPP") {
        return data.email && z.string().email().safeParse(data.email).success;
      }
      return true;
    },
    {
      message: "Valid email is required for EMAIL channel",
      path: ["email"],
    }
  )
  .refine(
    (data) => {
      if (
        data.channelCode === "SMS" ||
        data.channelCode === "WHATSAPP" ||
        data.channelCode === "EMAIL_AND_WHATSAPP"
      ) {
        return data.phone && data.phone.length > 0;
      }
      return true;
    },
    {
      message: "Phone is required for SMS/WHATSAPP channel",
      path: ["phone"],
    }
  );

const userSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    channelCode: z.string().min(1, "Channel code is required"),
    email: z.string().optional(),
    phone: z.string().optional(),
    contacts: z.array(contactSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.channelCode === "EMAIL" || data.channelCode === "EMAIL_AND_WHATSAPP") {
        return data.email && z.string().email().safeParse(data.email).success;
      }
      return true;
    },
    {
      message: "Valid email is required for EMAIL channel",
      path: ["email"],
    }
  )
  .refine(
    (data) => {
      if (
        data.channelCode === "SMS" ||
        data.channelCode === "WHATSAPP" ||
        data.channelCode === "EMAIL_AND_WHATSAPP"
      ) {
        return data.phone && data.phone.length > 0;
      }
      return true;
    },
    {
      message: "Phone is required for SMS/WHATSAPP channel",
      path: ["phone"],
    }
  );

const channelCodeOptions = [
  { value: "EMAIL", label: "EMAIL" },
  { value: "SMS", label: "SMS" },
  { value: "WHATSAPP", label: "WHATSAPP" },
  { value: "EMAIL_AND_WHATSAPP", label: "EMAIL_AND_WHATSAPP" },
  { value: "PUSH", label: "PUSH" },
];

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
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user ? `${user.firstName} ${user.lastName}`.trim() : "",
      channelCode: user?.contacts?.[0]?.channelCode || "EMAIL",
      email: user?.email || "",
      phone: user?.phoneNo || "",
      contacts: user
        ? // When editing: map existing contacts
          user.contacts?.map((c) => ({
            id: c.id,
            userId: c.userId,
            name: c.name,
            channelCode: c.channelCode,
            email: c.email,
            phone: c.phone,
            street: c.street || "",
            city: c.city || "",
            state: c.state || "",
            country: c.country || "",
            postalCode: c.postalCode || "",
            useSameAddress: false,
          })) || []
        : // When creating: add default contact
          [
            {
              name: "Email Contact",
              channelCode: "EMAIL",
              email: "",
              phone: "",
              street: "",
              city: "",
              state: "",
              country: "",
              postalCode: "",
              useSameAddress: false,
            },
          ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contacts",
  });

  // Watch basic info fields
  const basicChannelCode = useWatch({ control, name: "channelCode" });
  const basicEmail = useWatch({ control, name: "email" });
  const basicPhone = useWatch({ control, name: "phone" });
  const basicName = useWatch({ control, name: "name" });

  // Helper function to get contact name based on channel code
  const getContactName = (channelCode: string) => {
    if (channelCode === "EMAIL") return "Email Contact";
    if (channelCode === "WHATSAPP") return "WhatsApp Contact";
    if (channelCode === "EMAIL_AND_WHATSAPP") return "Email and WhatsApp Contact";
    if (channelCode === "SMS") return "SMS Contact";
    return "Contact";
  };

  // Auto-fill contact name when channel code changes
  const handleChannelCodeChange = (index: number | null, value: string) => {
    if (index !== null) {
      setValue(`contacts.${index}.channelCode`, value);
      setValue(`contacts.${index}.name`, getContactName(value));
    } else {
      setValue("channelCode", value);
      // Sync basic channel code with first contact when creating new user
      if (!user && fields.length > 0) {
        setValue(`contacts.0.channelCode`, value);
        setValue(`contacts.0.name`, getContactName(value));
      }
    }
  };

  // Sync basic info email/phone with first contact when creating new user
  useEffect(() => {
    if (!user && fields.length > 0) {
      const firstContactEmail = watch(`contacts.0.email`);
      const firstContactPhone = watch(`contacts.0.phone`);
      const firstContactChannelCode = watch(`contacts.0.channelCode`);

      // If first contact email is empty and basic email exists, sync it
      if (!firstContactEmail && basicEmail) {
        if (firstContactChannelCode === "EMAIL" || firstContactChannelCode === "EMAIL_AND_WHATSAPP") {
          setValue(`contacts.0.email`, basicEmail);
        }
      }

      // If first contact phone is empty and basic phone exists, sync it
      if (!firstContactPhone && basicPhone) {
        if (
          firstContactChannelCode === "SMS" ||
          firstContactChannelCode === "WHATSAPP" ||
          firstContactChannelCode === "EMAIL_AND_WHATSAPP"
        ) {
          setValue(`contacts.0.phone`, basicPhone);
        }
      }
    }
  }, [basicEmail, basicPhone, user, fields.length]);

  const handleFormSubmit = (data: UserFormData) => {
    // Split name into firstName and lastName
    const nameParts = data.name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Get primary email and phone from basic info
    const primaryEmail = data.email || "";
    const primaryPhone = data.phone || "";

    // Process contacts - handle "use same address" logic
    const processedContacts = (data.contacts || []).map((contact, idx) => {
      const contactData: any = {
        name: contact.name || getContactName(contact.channelCode),
        channelCode: contact.channelCode,
      };

      // Always include email if it exists in the contact data (even if channel doesn't require it)
      // This preserves existing email data when channel code changes
      if (contact.email !== undefined && contact.email !== null && contact.email !== "") {
        contactData.email = contact.email;
      } else if (contact.channelCode === "EMAIL" || contact.channelCode === "EMAIL_AND_WHATSAPP") {
        // Only set email if channel requires it and no existing email
        contactData.email = idx === 0 && primaryEmail ? primaryEmail : "";
      }

      // Always include phone if it exists in the contact data (even if channel doesn't require it)
      // This preserves existing phone data when channel code changes
      if (contact.phone !== undefined && contact.phone !== null && contact.phone !== "") {
        contactData.phone = contact.phone;
      } else if (
        contact.channelCode === "SMS" ||
        contact.channelCode === "WHATSAPP" ||
        contact.channelCode === "EMAIL_AND_WHATSAPP"
      ) {
        // Only set phone if channel requires it and no existing phone
        contactData.phone = idx === 0 && primaryPhone ? primaryPhone : "";
      }

      // Handle address - if useSameAddress, copy from first contact
      if (contact.useSameAddress && idx > 0 && data.contacts && data.contacts.length > 0) {
        const firstContact = data.contacts[0];
        contactData.street = firstContact.street || "";
        contactData.city = firstContact.city || "";
        contactData.state = firstContact.state || "";
        contactData.country = firstContact.country || "";
        contactData.postalCode = firstContact.postalCode || "";
      } else {
        contactData.street = contact.street || "";
        contactData.city = contact.city || "";
        contactData.state = contact.state || "";
        contactData.country = contact.country || "";
        contactData.postalCode = contact.postalCode || "";
      }

      // Include id and userId for updates - CRITICAL for backend to identify which contacts to update
      if (contact.id) {
        contactData.id = contact.id;
      }
      if (contact.userId) {
        contactData.userId = contact.userId;
      }

      return contactData;
    });

    // Transform data to match API payload
    const payload: CreateUserPayload | UpdateUserPayload = {
      firstName,
      lastName,
      email: primaryEmail,
      phoneNo: primaryPhone,
      contacts: processedContacts, // Use contacts from form (already includes default contact when creating)
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Name"
            {...register("name")}
            error={errors.name?.message}
            placeholder="Enter full name"
          />
          <Select
            label="Channel Code"
            {...register("channelCode", {
              onChange: (e) => handleChannelCodeChange(null, e.target.value),
            })}
            error={errors.channelCode?.message}
            options={channelCodeOptions}
          />
          {(basicChannelCode === "EMAIL" || basicChannelCode === "EMAIL_AND_WHATSAPP") && (
            <Input
              label="Email"
              type="email"
              {...register("email")}
              error={errors.email?.message}
              placeholder="Enter email address"
            />
          )}
          {(basicChannelCode === "SMS" ||
            basicChannelCode === "WHATSAPP" ||
            basicChannelCode === "EMAIL_AND_WHATSAPP") && (
            <Input
              label="Phone"
              {...register("phone")}
              error={errors.phone?.message}
              placeholder="Enter phone number"
            />
          )}
        </div>
      </div>

      {/* Contacts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Contacts</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                name: "Email Contact",
                channelCode: "EMAIL",
                email: "",
                phone: "",
                street: "",
                city: "",
                state: "",
                country: "",
                postalCode: "",
                useSameAddress: false,
              })
            }
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Secondary Contact
          </Button>
        </div>

        {fields.length === 0 && (
          <p className="text-sm text-gray-500">No contacts added yet.</p>
        )}

        {fields.map((field, index) => {
          const contactChannelCode = watch(`contacts.${index}.channelCode`);
          const useSameAddress = watch(`contacts.${index}.useSameAddress`);
          const firstContact = fields[0];

          return (
            <div
              key={field.id}
              className="p-4 border border-gray-200 rounded-lg space-y-4"
            >
              <div className="flex items-center justify-end mb-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Channel Code"
                  {...register(`contacts.${index}.channelCode`, {
                    onChange: (e) => {
                      handleChannelCodeChange(index, e.target.value);
                    },
                  })}
                  error={errors.contacts?.[index]?.channelCode?.message}
                  options={channelCodeOptions}
                />
                {/* Hidden fields to preserve values when not shown */}
                <input
                  type="hidden"
                  {...register(`contacts.${index}.name`)}
                />
                {/* Always register email field, even if not visible */}
                {(contactChannelCode === "EMAIL" ||
                  contactChannelCode === "EMAIL_AND_WHATSAPP") ? (
                  <Input
                    label="Email"
                    type="email"
                    {...register(`contacts.${index}.email`)}
                    error={errors.contacts?.[index]?.email?.message}
                    placeholder={
                      index === 0 && basicEmail
                        ? `Default: ${basicEmail}`
                        : "Enter email address"
                    }
                  />
                ) : (
                  <input
                    type="hidden"
                    {...register(`contacts.${index}.email`)}
                  />
                )}
                {/* Always register phone field, even if not visible */}
                {(contactChannelCode === "SMS" ||
                  contactChannelCode === "WHATSAPP" ||
                  contactChannelCode === "EMAIL_AND_WHATSAPP") ? (
                  <Input
                    label="Phone"
                    {...register(`contacts.${index}.phone`)}
                    error={errors.contacts?.[index]?.phone?.message}
                    placeholder={
                      index === 0 && basicPhone
                        ? `Default: ${basicPhone}`
                        : "Enter phone number"
                    }
                  />
                ) : (
                  <input
                    type="hidden"
                    {...register(`contacts.${index}.phone`)}
                  />
                )}
              </div>

              {/* Address Section */}
              {index > 0 && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`useSameAddress-${index}`}
                      {...register(`contacts.${index}.useSameAddress`)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`useSameAddress-${index}`}
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Use same address as primary contact
                    </label>
                  </div>

                  {!useSameAddress && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Street"
                        {...register(`contacts.${index}.street`)}
                        error={errors.contacts?.[index]?.street?.message}
                      />
                      <Input
                        label="City"
                        {...register(`contacts.${index}.city`)}
                        error={errors.contacts?.[index]?.city?.message}
                      />
                      <Input
                        label="State"
                        {...register(`contacts.${index}.state`)}
                        error={errors.contacts?.[index]?.state?.message}
                      />
                      <Input
                        label="Country"
                        {...register(`contacts.${index}.country`)}
                        error={errors.contacts?.[index]?.country?.message}
                      />
                      <Input
                        label="Postal Code"
                        {...register(`contacts.${index}.postalCode`)}
                        error={errors.contacts?.[index]?.postalCode?.message}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Primary contact address fields */}
              {index === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <Input
                    label="Street"
                    {...register(`contacts.${index}.street`)}
                    error={errors.contacts?.[index]?.street?.message}
                  />
                  <Input
                    label="City"
                    {...register(`contacts.${index}.city`)}
                    error={errors.contacts?.[index]?.city?.message}
                  />
                  <Input
                    label="State"
                    {...register(`contacts.${index}.state`)}
                    error={errors.contacts?.[index]?.state?.message}
                  />
                  <Input
                    label="Country"
                    {...register(`contacts.${index}.country`)}
                    error={errors.contacts?.[index]?.country?.message}
                  />
                  <Input
                    label="Postal Code"
                    {...register(`contacts.${index}.postalCode`)}
                    error={errors.contacts?.[index]?.postalCode?.message}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {/* Use explicit click handler so submit always runs handleFormSubmit */}
        <Button
          type="button"
          isLoading={isLoading}
          onClick={handleSubmit(handleFormSubmit)}
        >
          {user ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  );
}

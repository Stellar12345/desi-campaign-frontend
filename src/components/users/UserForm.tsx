import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import type { User, CreateUserPayload, UpdateUserPayload } from "@/types";
import { useDeleteContact } from "@/hooks/useUsers";

// Dynamic validation based on channel code
const contactSchema = z
  .object({
    id: z.string().optional(),
    userId: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    channelCode: z.string().min(1, "Channel code is required"),
    email: z.string().nullable().optional().transform(val => val ?? ""),
    phone: z.string().nullable().optional().transform(val => val ?? ""),
    street: z.string().nullable().optional().transform(val => val ?? ""),
    city: z.string().nullable().optional().transform(val => val ?? ""),
    state: z.string().nullable().optional().transform(val => val ?? ""),
    country: z.string().nullable().optional().transform(val => val ?? ""),
    postalCode: z.string().nullable().optional().transform(val => val ?? ""),
    useSameAddress: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // Only validate email if it's provided and channel requires it
      if (data.channelCode === "EMAIL" || data.channelCode === "EMAIL_AND_WHATSAPP") {
        // If email field has a value, it must be valid
        if (data.email && data.email.trim() !== "") {
          return z.string().email().safeParse(data.email).success;
        }
        // Empty email is allowed - will be validated at submit time if needed
        return true;
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
      // Only validate phone if it's provided and channel requires it
      if (
        data.channelCode === "WHATSAPP" ||
        data.channelCode === "EMAIL_AND_WHATSAPP"
      ) {
        // If phone field has a value, it must not be empty
        if (data.phone && data.phone.trim() !== "") {
          return data.phone.length > 0;
        }
        // Empty phone is allowed - will be validated at submit time if needed
        return true;
      }
      return true;
    },
    {
      message: "Phone is required for WHATSAPP channel",
      path: ["phone"],
    }
  );

const userSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().nullable().optional().transform(val => val ?? ""),
    phone: z.string().nullable().optional().transform(val => val ?? ""),
    contacts: z.array(contactSchema).optional(),
  });

// Only allow EMAIL, WHATSAPP, and EMAIL_AND_WHATSAPP
const channelCodeOptions = [
  { value: "EMAIL", label: "EMAIL" },
  { value: "WHATSAPP", label: "WHATSAPP" },
  { value: "EMAIL_AND_WHATSAPP", label: "EMAIL_AND_WHATSAPP" },
];

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserPayload | UpdateUserPayload) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function UserForm({ user, onSubmit, onCancel, isLoading }: UserFormProps) {
  const deleteContact = useDeleteContact();
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
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

  // Handle contact deletion - call API if contact has ID, otherwise just remove from form
  const handleDeleteContact = async (index: number) => {
    const contacts = getValues("contacts");
    const contactToDelete = contacts?.[index];
    
    // If contact has an ID, delete it from the backend
    if (contactToDelete?.id) {
      try {
        await deleteContact.mutateAsync(contactToDelete.id);
        // Remove from form after successful deletion
        remove(index);
      } catch (error) {
        console.error("Failed to delete contact:", error);
        // Optionally show error message to user
      }
    } else {
      // If no ID, just remove from form (new contact that wasn't saved yet)
      remove(index);
    }
  };

  // Watch basic info fields
  const basicEmail = useWatch({ control, name: "email" });
  const basicPhone = useWatch({ control, name: "phone" });

  // Helper function to get contact name based on channel code
  const getContactName = (channelCode: string) => {
    if (channelCode === "EMAIL") return "Email Contact";
    if (channelCode === "WHATSAPP") return "WhatsApp Contact";
    if (channelCode === "EMAIL_AND_WHATSAPP") return "Email and WhatsApp Contact";
    return "Contact";
  };

  // Auto-fill contact name when channel code changes
  const handleChannelCodeChange = (index: number | null, value: string) => {
    if (index !== null) {
      setValue(`contacts.${index}.channelCode`, value);
      setValue(`contacts.${index}.name`, getContactName(value));
    }
  };

  // Sync contact email/phone to basic info fields (hidden from UI)
  useEffect(() => {
    const contacts = watch("contacts") || [];
    
    // Find email from contacts (prioritize EMAIL or EMAIL_AND_WHATSAPP)
    let emailFromContact = "";
    for (const contact of contacts) {
      if (contact?.email && contact.email.trim() !== "") {
        if (contact.channelCode === "EMAIL" || contact.channelCode === "EMAIL_AND_WHATSAPP") {
          emailFromContact = contact.email;
          break;
        }
      }
    }
    
    // Find phone from contacts (prioritize WHATSAPP or EMAIL_AND_WHATSAPP)
    let phoneFromContact = "";
    for (const contact of contacts) {
      if (contact?.phone && contact.phone.trim() !== "") {
        if (contact.channelCode === "WHATSAPP" || contact.channelCode === "EMAIL_AND_WHATSAPP") {
          phoneFromContact = contact.phone;
          break;
        }
      }
    }
    
    // Update basic info fields (hidden) with values from contacts
    if (emailFromContact) {
      setValue("email", emailFromContact, { shouldValidate: false });
    }
    if (phoneFromContact) {
      setValue("phone", phoneFromContact, { shouldValidate: false });
    }
  }, [watch("contacts"), setValue, watch]);

  const handleFormSubmit = (data: UserFormData) => {
    console.log("✅ Form submitted successfully! Data:", data);
    console.log("✅ Contacts count:", data.contacts?.length || 0);
    
    // Use firstName and lastName directly from form
    const firstName = data.firstName?.trim() || "";
    const lastName = data.lastName?.trim() || "";

    // Get primary email and phone from contacts (synced to basic info)
    // Find email from contacts
    let primaryEmail = data.email || "";
    for (const contact of (data.contacts || [])) {
      if (contact?.email && contact.email.trim() !== "") {
        if (contact.channelCode === "EMAIL" || contact.channelCode === "EMAIL_AND_WHATSAPP") {
          primaryEmail = contact.email;
          break;
        }
      }
    }
    
    // Find phone from contacts
    let primaryPhone = data.phone || "";
    for (const contact of (data.contacts || [])) {
      if (contact?.phone && contact.phone.trim() !== "") {
        if (contact.channelCode === "WHATSAPP" || contact.channelCode === "EMAIL_AND_WHATSAPP") {
          primaryPhone = contact.phone;
          break;
        }
      }
    }

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

    console.log("✅ Calling onSubmit with payload:", payload);
    console.log("✅ Payload contacts:", processedContacts);
    console.log("✅ User ID:", user?.id);
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
      {/* Basic Info */}
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
            label="Last Name"
            {...register("lastName")}
            error={errors.lastName?.message}
            placeholder="Enter last name"
          />
          {/* Email and Phone fields are hidden - they sync automatically from contacts */}
          <input type="hidden" {...register("email")} />
          <input type="hidden" {...register("phone")} />
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
                ...(user?.id && { userId: user.id }),
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
                  onClick={() => handleDeleteContact(index)}
                  isLoading={deleteContact.isPending}
                  disabled={deleteContact.isPending}
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
                  options={(() => {
                    // Get all contacts to determine restrictions
                    const allContacts = watch("contacts") || [];
                    
                    // If this contact is EMAIL_AND_WHATSAPP, only allow that option
                    if (contactChannelCode === "EMAIL_AND_WHATSAPP") {
                      return [{ value: "EMAIL_AND_WHATSAPP", label: "EMAIL_AND_WHATSAPP" }];
                    }
                    
                    // If first contact is EMAIL, second contact must be WHATSAPP
                    if (index === 1 && allContacts[0]?.channelCode === "EMAIL") {
                      return [{ value: "WHATSAPP", label: "WHATSAPP" }];
                    }
                    
                    // If any contact is EMAIL_AND_WHATSAPP, disable other options for all contacts
                    const hasEmailAndWhatsApp = allContacts.some(
                      (c: any, i: number) => i !== index && c?.channelCode === "EMAIL_AND_WHATSAPP"
                    );
                    if (hasEmailAndWhatsApp) {
                      return [{ value: "EMAIL_AND_WHATSAPP", label: "EMAIL_AND_WHATSAPP" }];
                    }
                    
                    // Default: show all options
                    return channelCodeOptions;
                  })()}
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
                {(contactChannelCode === "WHATSAPP" ||
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
        {/* Use type="submit" to properly trigger form validation */}
        <Button type="submit" isLoading={isLoading}>
          {user ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  );
}

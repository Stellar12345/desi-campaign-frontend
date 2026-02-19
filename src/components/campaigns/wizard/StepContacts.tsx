import { useState } from "react";
import { Search, Check } from "lucide-react";
import { useCampaignWizard } from "@/contexts/CampaignWizardContext";
import {
  useCampaignContacts,
  useCreateCampaign,
  useUpdateCampaignContacts,
  useUpdateCampaign,
} from "@/hooks/useCampaigns";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";

interface StepContactsProps {
  onNext: () => void;
  onPrevious: () => void;
}

interface ContactOption {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export default function StepContacts({ onNext, onPrevious }: StepContactsProps) {
  const { wizardData, updateContacts, campaignId, setCampaignId } = useCampaignWizard();
  // Use the selected channel from step 1 to fetch matching contacts (EMAIL, WHATSAPP, etc.)
  const channelCode = wizardData.basicInfo.channelCode || "EMAIL";
  const { data: contactsData = [], isLoading } = useCampaignContacts(channelCode);
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const updateCampaignContacts = useUpdateCampaignContacts();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>(wizardData.contacts);

  // Flatten contacts from users if needed
  const contacts: ContactOption[] = Array.isArray(contactsData)
    ? contactsData.flatMap((item: any) => {
        // If item has contacts array, flatten them
        if (item.contacts && Array.isArray(item.contacts)) {
          return item.contacts.map((contact: any) => ({
            id: contact.id || contact.contactId || `${item.id}-${contact.email}`,
            name: contact.name || `${item.firstName || ""} ${item.lastName || ""}`.trim(),
            email: contact.email,
            phone: contact.phone,
          }));
        }
        // Otherwise treat as direct contact
        return {
          id: item.id || item.contactId,
          name: item.name || `${item.firstName || ""} ${item.lastName || ""}`.trim(),
          email: item.email,
          phone: item.phone,
        };
      })
    : [];

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleContact = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map((c) => c.id));
    }
  };

  const handleNext = async () => {
    updateContacts(selectedContacts);
    
    // Auto-save draft when moving to next step
    setIsSavingDraft(true);
    try {
      if (campaignId) {
        // UPDATE: Campaign exists, use PUT to update contacts
        console.log("🔄 Updating existing campaign contacts:", campaignId);
        await updateCampaignContacts.mutateAsync({
          campaignId,
          contacts: selectedContacts,
        });
      } else {
        // CREATE: First time only, use POST to create (if basic info exists)
        if (wizardData.basicInfo.name && wizardData.basicInfo.subject) {
          console.log("✨ Creating new campaign (first time)");
          const createPayload: any = {
            ...wizardData.basicInfo,
            contacts: selectedContacts,
            status: "DRAFT", // Always set status to DRAFT for new campaigns
          };
          // Only include htmlBody if it exists
          if (wizardData.emailContent.htmlBody && wizardData.emailContent.htmlBody.trim() !== "") {
            createPayload.htmlBody = wizardData.emailContent.htmlBody;
          }
          // Only include textBody if it exists
          if (wizardData.emailContent.textBody && wizardData.emailContent.textBody.trim() !== "") {
            createPayload.textBody = wizardData.emailContent.textBody;
          }
          
          const newCampaign = await createCampaign.mutateAsync(createPayload);
          // Store the campaign ID for subsequent steps - now all future saves will be UPDATE
          if (newCampaign?.id) {
            setCampaignId(newCampaign.id);
            console.log("✅ Campaign created with ID:", newCampaign.id);
          }
        }
      }
      // Only move to next step if save was successful
      onNext();
    } catch (error) {
      console.error("Failed to save draft:", error);
      // Don't navigate on error - let user retry
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    updateContacts(selectedContacts);

    try {
      if (campaignId) {
        // UPDATE: Campaign exists, use PUT to update - send ALL current wizard data
        console.log("🔄 Updating existing campaign:", campaignId);
        const updatePayload: any = {
          // Basic info from previous steps
          name: wizardData.basicInfo.name,
          channelCode: wizardData.basicInfo.channelCode,
          apiProvider: wizardData.basicInfo.apiProvider,
          subject: wizardData.basicInfo.subject,
          // Current step data
          contacts: selectedContacts,
          status: "DRAFT", // Always keep status as DRAFT when updating
        };
        // Include email content from previous steps
        if (wizardData.emailContent.htmlBody && wizardData.emailContent.htmlBody.trim() !== "") {
          updatePayload.htmlBody = wizardData.emailContent.htmlBody;
        }
        if (wizardData.emailContent.textBody && wizardData.emailContent.textBody.trim() !== "") {
          updatePayload.textBody = wizardData.emailContent.textBody;
        }
        
        await updateCampaign.mutateAsync({
          id: campaignId,
          payload: updatePayload,
        });
      } else {
        // CREATE: First time only, use POST to create
        console.log("✨ Creating new campaign (first time)");
        const createPayload: any = {
          ...wizardData.basicInfo,
          contacts: selectedContacts,
          status: "DRAFT", // Always set status to DRAFT for new campaigns
        };
        // Only include htmlBody if it exists
        if (wizardData.emailContent.htmlBody && wizardData.emailContent.htmlBody.trim() !== "") {
          createPayload.htmlBody = wizardData.emailContent.htmlBody;
        }
        // Only include textBody if it exists
        if (wizardData.emailContent.textBody && wizardData.emailContent.textBody.trim() !== "") {
          createPayload.textBody = wizardData.emailContent.textBody;
        }
        
        const newCampaign = await createCampaign.mutateAsync(createPayload);
        // Store the campaign ID for subsequent steps - now all future saves will be UPDATE
        if (newCampaign?.id) {
          setCampaignId(newCampaign.id);
          console.log("✅ Campaign created with ID:", newCampaign.id);
        }
      }
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setIsSavingDraft(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Contacts</h2>
            <p className="text-gray-600">Select contacts to receive this campaign</p>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-blue-600">{selectedContacts.length}</span> selected
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Select All */}
        {filteredContacts.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {selectedContacts.length === filteredContacts.length ? "Deselect All" : "Select All"}
            </button>
          </div>
        )}

        {/* Contacts List */}
        <div className="border border-gray-200 rounded-lg max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p>No contacts found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredContacts.map((contact) => {
                const isSelected = selectedContacts.includes(contact.id);
                return (
                  <div
                    key={contact.id}
                    className={cn(
                      "p-4 hover:bg-gray-50 transition-colors cursor-pointer",
                      isSelected && "bg-blue-50"
                    )}
                    onClick={() => handleToggleContact(contact.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                          isSelected
                            ? "bg-blue-600 border-blue-600"
                            : "border-gray-300 bg-white"
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-600">{contact.email}</p>
                        {contact.phone && (
                          <p className="text-sm text-gray-500">{contact.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleSaveDraft}
            isLoading={isSavingDraft}
          >
            Save Draft
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={selectedContacts.length === 0 || isSavingDraft}
            isLoading={isSavingDraft}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

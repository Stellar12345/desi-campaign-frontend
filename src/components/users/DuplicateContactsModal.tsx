import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ConfirmModal from "./ConfirmModal";
import { Trash2, AlertTriangle } from "lucide-react";

interface DuplicateRecord {
  id: string;
  firstName: string;
  title?: string | null;
  companyName?: string | null;
  email: string;
  corporatePhone: string;
  city?: string | null;
  state?: string | null;
  companyCity?: string | null;
  companyState?: string | null;
  companyCountry?: string | null;
  companyPhone?: string | null;
  secondaryEmail?: string | null;
  secondaryEmailSource?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DuplicateGroup {
  email: string;
  count: number;
  keepRecord: DuplicateRecord;
  duplicateRecords: DuplicateRecord[];
}

interface DuplicateContactsResponse {
  data?: {
    items?: DuplicateGroup[];
    pageInfo?: unknown;
  };
  items?: DuplicateGroup[];
}

interface DuplicateContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  duplicates: unknown;
  onDelete: () => void;
  isDeleting?: boolean;
}

export default function DuplicateContactsModal({
  isOpen,
  onClose,
  duplicates,
  onDelete,
  isDeleting = false,
}: DuplicateContactsModalProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Parse duplicates - handle API response structure
  const parseDuplicates = (): DuplicateGroup[] => {
    if (!duplicates || typeof duplicates !== "object") return [];

    const response = duplicates as DuplicateContactsResponse;
    
    // Check for data.items structure (API response format)
    if (response.data?.items && Array.isArray(response.data.items)) {
      return response.data.items;
    }
    
    // Check for direct items structure
    if (response.items && Array.isArray(response.items)) {
      return response.items;
    }
    
    return [];
  };

  const duplicateGroups = parseDuplicates();
  const totalDuplicates = duplicateGroups.reduce(
    (sum, group) => sum + group.duplicateRecords.length,
    0
  );
  const hasDuplicates = duplicateGroups.length > 0;

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowConfirmDelete(false);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Duplicate Contacts" size="xl">
        <div className="space-y-4">
          {hasDuplicates ? (
            <>
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 mb-1">
                    Duplicate Contacts Found
                  </h3>
                  <p className="text-sm text-yellow-800">
                    Found {duplicateGroups.length} email{duplicateGroups.length !== 1 ? 's' : ''} with {totalDuplicates} duplicate contact{totalDuplicates !== 1 ? 's' : ''}. 
                    The oldest record will be kept, and duplicates will be deleted.
                  </p>
                </div>
              </div>

              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {duplicateGroups.map((group, index) => (
                  <div
                    key={group.email || index}
                    className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {group.email}
                          </h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 whitespace-nowrap flex-shrink-0">
                            {group.duplicateRecords.length} duplicate{group.duplicateRecords.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Name:</span>
                            <span className="ml-2 text-gray-900 font-medium">
                              {group.keepRecord.firstName || "N/A"}
                              {group.keepRecord.title && (
                                <span className="text-gray-500 ml-1">
                                  ({group.keepRecord.title})
                                </span>
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Company:</span>
                            <span className="ml-2 text-gray-900">
                              {group.keepRecord.companyName || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Phone:</span>
                            <span className="ml-2 text-gray-900">
                              {group.keepRecord.corporatePhone || group.keepRecord.companyPhone || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={onClose} disabled={isDeleting}>
                  Close
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteClick}
                  isLoading={isDeleting}
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Duplicates
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Duplicates Found
              </h3>
              <p className="text-gray-600">
                All contacts are unique. No duplicate contacts detected.
              </p>
              <div className="mt-6">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Duplicate Contacts"
        message="Are you sure you want to delete all duplicate contacts? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}

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

interface DuplicatePageInfo {
  totalResults: number;
  pageCount: number;
  resultsPerPage: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

interface DuplicateContactsResponse {
  data?: {
    items?: DuplicateGroup[];
    pageInfo?: DuplicatePageInfo;
  };
  items?: DuplicateGroup[];
  pageInfo?: DuplicatePageInfo;
}

interface DuplicateContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  duplicates: unknown;
  onDelete: () => void;
  isDeleting?: boolean;
  onPageChange?: (page: number) => void;
}

export default function DuplicateContactsModal({
  isOpen,
  onClose,
  duplicates,
  onDelete,
  isDeleting = false,
  onPageChange,
}: DuplicateContactsModalProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  // Parse duplicates - handle API response structure
  const parseDuplicates = (): {
    groups: DuplicateGroup[];
    pageInfo?: DuplicatePageInfo;
  } => {
    if (!duplicates || typeof duplicates !== "object") {
      return { groups: [], pageInfo: undefined };
    }

    const response = duplicates as DuplicateContactsResponse;
    
    // Check for data.items structure (API response format)
    if (response.data?.items && Array.isArray(response.data.items)) {
      return {
        groups: response.data.items,
        pageInfo: response.data.pageInfo,
      };
    }
    
    // Check for direct items structure
    if (response.items && Array.isArray(response.items)) {
      return {
        groups: response.items,
        pageInfo: response.pageInfo,
      };
    }
    
    return { groups: [], pageInfo: undefined };
  };

  const { groups: duplicateGroups, pageInfo } = parseDuplicates();
  const pageDuplicates = duplicateGroups.reduce(
    (sum, group) => sum + Math.max(0, group.count - 1),
    0
  );
  const totalEmailsWithDuplicates = pageInfo?.totalResults ?? duplicateGroups.length;
  const hasDuplicates = duplicateGroups.length > 0;

  const currentPage = pageInfo?.currentPage ?? 1;
  const totalPages = pageInfo?.totalPages ?? 1;

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowConfirmDelete(false);
  };

  const handleRequestClose = () => {
    if (hasDuplicates && !isDeleting) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleRequestClose} title="Duplicate Contacts" size="xl">
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
                    Found {totalEmailsWithDuplicates} email
                    {totalEmailsWithDuplicates !== 1 ? "s" : ""} with duplicate contacts.
                    You are viewing {duplicateGroups.length} email
                    {duplicateGroups.length !== 1 ? "s" : ""} and {pageDuplicates} duplicate
                    contact{pageDuplicates !== 1 ? "s" : ""} on this page. The oldest record
                    will be kept, and duplicates will be deleted.
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

              {/* Pagination & actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>
                    Page <span className="font-semibold">{currentPage}</span> of{" "}
                    <span className="font-semibold">{totalPages}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isDeleting || !pageInfo?.hasPrevPage || !onPageChange}
                      onClick={() => {
                        if (onPageChange && pageInfo?.prevPage) {
                          onPageChange(pageInfo.prevPage);
                        }
                      }}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isDeleting || !pageInfo?.hasNextPage || !onPageChange}
                      onClick={() => {
                        if (onPageChange && pageInfo?.nextPage) {
                          onPageChange(pageInfo.nextPage);
                        }
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button variant="outline" onClick={handleRequestClose} disabled={isDeleting}>
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

      <ConfirmModal
        isOpen={showConfirmClose}
        onClose={() => setShowConfirmClose(false)}
        onConfirm={() => {
          setShowConfirmClose(false);
          onClose();
        }}
        title="Close Without Deleting?"
        message="Duplicate contacts still exist. Are you sure you want to close this window without deleting them?"
        confirmText="Close Anyway"
        variant="default"
        isLoading={false}
      />
    </>
  );
}

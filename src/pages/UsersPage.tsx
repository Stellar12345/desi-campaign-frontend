import { useMemo, useRef, useState } from "react";
import { Plus, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import UserTable from "@/components/users/UserTable";
import UserForm from "@/components/users/UserForm";
import ConfirmModal from "@/components/users/ConfirmModal";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useRestoreUser,
  useHardDeleteUser,
  useImportUsers,
} from "@/hooks/useUsers";
import { useToastContext } from "@/contexts/ToastContext";
import { getErrorMessage } from "@/utils/format";
import type { User, CreateUserPayload, UpdateUserPayload } from "@/types";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [resultsPerPage] = useState(8);

  const searchFilters = useMemo(() => {
    const term = searchTerm.trim();
    if (!term) return {};

    // Decide which field to search on:
    // - If contains '@' → email
    // - If looks like a phone number → phoneNo
    // - Otherwise → firstName
    if (term.includes("@")) {
      return { email: term };
    }

    if (/^[+\d][\d\s-]*$/.test(term)) {
      return { phoneNo: term };
    }

    return { firstName: term };
  }, [searchTerm]);

  const {
    data: usersData,
    isLoading,
    isFetching,
  } = useUsers(page, resultsPerPage, searchFilters);

  const users = Array.isArray(usersData?.items) ? usersData?.items : [];
  const pageInfo = usersData?.pageInfo;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const restoreUser = useRestoreUser();
  const hardDeleteUser = useHardDeleteUser();
  const importUsers = useImportUsers();
  const { showSuccess, showError } = useToastContext();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "restore" | "hard";
    userId: string;
  }>({
    isOpen: false,
    type: "hard",
    userId: "",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCreate = () => {
    setEditingUser(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsDrawerOpen(true);
  };

  const handleSubmit = (data: CreateUserPayload | UpdateUserPayload) => {
    if (editingUser) {
      updateUser.mutate(
        { id: editingUser.id, payload: data as UpdateUserPayload },
        {
          onSuccess: () => {
            showSuccess("User Updated", "User has been updated successfully.");
            setIsDrawerOpen(false);
            setEditingUser(null);
          },
          onError: (error) => {
            const errorMessage = getErrorMessage(error);
            showError(
              "Update Failed",
              errorMessage,
              6000
            );
          },
        }
      );
    } else {
      createUser.mutate(data as CreateUserPayload, {
        onSuccess: () => {
          showSuccess("User Created", "User has been created successfully.");
          setIsDrawerOpen(false);
        },
        onError: (error) => {
          const errorMessage = getErrorMessage(error);
          showError(
            "Creation Failed",
            errorMessage,
            6000
          );
        },
      });
    }
  };

  const handleRestore = (id: string) => {
    setConfirmModal({ isOpen: true, type: "restore", userId: id });
  };

  const handleHardDelete = (id: string) => {
    setConfirmModal({ isOpen: true, type: "hard", userId: id });
  };

  const handleConfirm = () => {
    const { type, userId } = confirmModal;
    if (type === "restore") {
      restoreUser.mutate(userId, {
        onSuccess: () => {
          showSuccess("User Restored", "User has been restored successfully.");
          setConfirmModal({ isOpen: false, type: "restore", userId: "" });
        },
        onError: (error) => {
          const errorMessage = getErrorMessage(error);
          showError("Restore Failed", errorMessage, 6000);
        },
      });
    } else if (type === "hard") {
      hardDeleteUser.mutate(userId, {
        onSuccess: () => {
          showSuccess("User Deleted", "User has been permanently deleted.");
          setConfirmModal({ isOpen: false, type: "hard", userId: "" });
        },
        onError: (error) => {
          const errorMessage = getErrorMessage(error);
          showError("Delete Failed", errorMessage, 6000);
        },
      });
    }
  };

  const handleBulkImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleBulkImportChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    importUsers.mutate(file, {
      onSuccess: (data) => {
        showSuccess("Import Successful", "Users CSV imported successfully.");
        console.log("Bulk import response:", data);
        scrollToTop();
        // reset input so same file can be selected again if needed
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      onError: (error) => {
        const errorMessage = getErrorMessage(error);
        showError("Import Failed", errorMessage, 8000);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
    });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const getConfirmModalProps = () => {
    switch (confirmModal.type) {
      case "restore":
        return {
          title: "Restore User",
          message: "Are you sure you want to restore this user?",
          confirmText: "Restore",
          variant: "default" as const,
          isLoading: restoreUser.isPending,
        };
      case "hard":
        return {
          title: "Delete User",
          message:
            "Are you sure you want to permanently delete this user? This action cannot be undone.",
          confirmText: "Delete",
          variant: "danger" as const,
          isLoading: hardDeleteUser.isPending,
        };
      default:
        return {
          title: "Confirm",
          message: "Are you sure?",
          confirmText: "Confirm",
          variant: "default" as const,
          isLoading: false,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="mt-2 text-gray-600">Manage all users and their contacts</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleBulkImportChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleBulkImportClick}
            isLoading={importUsers.isPending}
            disabled={importUsers.isPending}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="w-5 h-5 mr-2" />
            Create User
          </Button>
        </div>
      </div>

      {/* Table */}
      <UserTable
        users={users}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onEdit={handleEdit}
        onRestore={handleRestore}
        onHardDelete={handleHardDelete}
      />

      {/* Pagination */}
      {pageInfo && (
        <div className="flex items-center justify-between px-2 py-3 text-sm text-gray-600">
          <div>
            Page <span className="font-medium">{pageInfo.currentPage}</span> of{" "}
            <span className="font-medium">{pageInfo.totalPages}</span>
            {isFetching && <span className="ml-2 text-xs text-gray-400">Updating…</span>}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                scrollToTop();
              }}
              disabled={!pageInfo.hasPrevPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPage((p) => p + 1);
                scrollToTop();
              }}
              disabled={!pageInfo.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? "Edit User" : "Create New User"}
      >
        <UserForm
          user={editingUser || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsDrawerOpen(false);
            setEditingUser(null);
          }}
          isLoading={createUser.isPending || updateUser.isPending}
        />
      </Drawer>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: "hard", userId: "" })}
        onConfirm={handleConfirm}
        {...getConfirmModalProps()}
      />
    </div>
  );
}

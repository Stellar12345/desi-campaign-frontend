import { useState } from "react";
import { Plus } from "lucide-react";
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
} from "@/hooks/useUsers";
import type { User, CreateUserPayload, UpdateUserPayload } from "@/types";

export default function UsersPage() {
  const { data: usersData, isLoading } = useUsers();
  // Ensure users is always an array
  const users = Array.isArray(usersData) ? usersData : [];
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const restoreUser = useRestoreUser();
  const hardDeleteUser = useHardDeleteUser();

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
            setIsDrawerOpen(false);
            setEditingUser(null);
          },
        }
      );
    } else {
      createUser.mutate(data as CreateUserPayload, {
        onSuccess: () => {
          setIsDrawerOpen(false);
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
          setConfirmModal({ isOpen: false, type: "restore", userId: "" });
        },
      });
    } else if (type === "hard") {
      hardDeleteUser.mutate(userId, {
        onSuccess: () => {
          setConfirmModal({ isOpen: false, type: "hard", userId: "" });
        },
      });
    }
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
        <Button onClick={handleCreate}>
          <Plus className="w-5 h-5 mr-2" />
          Create User
        </Button>
      </div>

      {/* Table */}
      <UserTable
        users={users}
        isLoading={isLoading}
        onEdit={handleEdit}
        onRestore={handleRestore}
        onHardDelete={handleHardDelete}
      />

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

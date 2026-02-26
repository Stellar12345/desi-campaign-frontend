import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/services/users";
import type { User, CreateUserPayload, UpdateUserPayload } from "@/types";

const QUERY_KEYS = {
  users: ["users"] as const,
  user: (id: string) => ["users", id] as const,
};

// Get all users with pagination (optionally filtered by firstName, email, or phoneNo)
export function useUsers(
  page: number,
  limit: number,
  filters?: { firstName?: string; email?: string; phoneNo?: string }
) {
  return useQuery({
    queryKey: [...QUERY_KEYS.users, page, limit, filters] as const,
    queryFn: () => usersApi.getAll(page, limit, filters),
    placeholderData: (previousData) => previousData,
  });
}

// Get single user
export function useUser(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.user(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
}

// Create user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    },
  });
}

// Update user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersApi.update(id, payload),
    onSuccess: (_data: User, variables: { id: string; payload: UpdateUserPayload }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(variables.id) });
    },
  });
}

// Soft delete user
export function useSoftDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.softDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    },
  });
}

// Restore user
export function useRestoreUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    },
  });
}

// Hard delete user
export function useHardDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.hardDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    },
  });
}

// Delete contact
export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactId: string) => usersApi.deleteContact(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    },
  });
}

// Bulk import users from CSV
export function useImportUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => usersApi.importBulk(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
    },
  });
}

// Get duplicate contacts (paginated)
export function useDuplicateContacts(page: number, limit: number, enabled: boolean = false) {
  return useQuery({
    queryKey: ["duplicate-contacts", page, limit] as const,
    queryFn: () => usersApi.getDuplicateContacts(page, limit),
    enabled,
  });
}

// Delete duplicate contacts
export function useDeleteDuplicateContacts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usersApi.deleteDuplicateContacts(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      queryClient.invalidateQueries({ queryKey: ["duplicate-contacts"] });
    },
  });
}
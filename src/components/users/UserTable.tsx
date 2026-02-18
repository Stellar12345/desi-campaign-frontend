import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Edit, Trash2, RotateCcw } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import type { User } from "@/types";

interface UserTableProps {
  users: User[];
  isLoading?: boolean;
  onEdit: (user: User) => void;
  onRestore: (id: string) => void;
  onHardDelete: (id: string) => void;
}

export default function UserTable({
  users,
  isLoading,
  onEdit,
  onRestore,
  onHardDelete,
}: UserTableProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Ensure users is always an array
  const usersArray = Array.isArray(users) ? users : [];

  const filteredUsers = usersArray.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNo.includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (usersArray.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">Get started by creating a new user.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="font-medium">
                  {user.firstName} {user.lastName}
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phoneNo}</TableCell>
              <TableCell>
                {user.isDeleted ? (
                  <Badge variant="danger">Deleted</Badge>
                ) : (
                  <Badge variant="success">Active</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  {/* View Button */}
                  <button
                    onClick={() => navigate(`/users/${user.id}`)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors group relative"
                  >
                    <Eye className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                      <div className="px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
                        View
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </button>

                  {/* Edit/Restore Button */}
                  {user.isDeleted ? (
                    <button
                      onClick={() => onRestore(user.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors group relative"
                    >
                      <RotateCcw className="w-4 h-4 text-gray-600 group-hover:text-green-600" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                        <div className="px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
                          Restore
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                          <div className="border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => onEdit(user)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors group relative"
                    >
                      <Edit className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                        <div className="px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
                          Edit
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                          <div className="border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => onHardDelete(user.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors group relative"
                  >
                    <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                      <div className="px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
                        Delete
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filteredUsers.length === 0 && searchTerm && (
        <div className="p-8 text-center text-gray-500">
          No users found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
}

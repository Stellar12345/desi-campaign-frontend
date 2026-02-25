import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Calendar, User as UserIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useUser } from "@/hooks/useUsers";
import { formatDateTime } from "@/utils/format";
import Skeleton from "@/components/ui/Skeleton";

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useUser(id || "");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load user details</p>
        <Button onClick={() => navigate("/users")}>Back to Users</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/users")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              {user.isDeleted && <Badge variant="danger">Deleted</Badge>}
            </div>
            <p className="mt-1 text-gray-600">User Details</p>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="text-base font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              {user.title && (
                <p className="text-sm text-gray-500 mt-1">{user.title}</p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-base font-medium text-gray-900">{user.email}</p>
              {user.secondaryEmail && (
                <p className="text-xs text-gray-500 mt-1">
                  Secondary: {user.secondaryEmail}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="text-base font-medium text-gray-900">
                {user.corporatePhone || user.phoneNo}
              </p>
              {user.companyPhone && (
                <p className="text-xs text-gray-500 mt-1">
                  Company Phone: {user.companyPhone}
                </p>
              )}
            </div>
          </div>
          {(user.city || user.state) && (
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-5" />
              <div>
                <p className="text-sm text-gray-500">Person Location</p>
                <p className="text-base font-medium text-gray-900">
                  {user.city}
                  {user.state ? `, ${user.state}` : ""}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="text-base font-medium text-gray-900">
                {formatDateTime(user.createdAt)}
              </p>
            </div>
          </div>
          {user.companyName && (
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-5" />
              <div>
                <p className="text-sm text-gray-500">Company</p>
                <p className="text-base font-medium text-gray-900">
                  {user.companyName}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {user.companyCity || user.city}
                  {user.companyState || user.state
                    ? `, ${user.companyState || user.state}`
                    : ""}
                  {user.companyCountry
                    ? `, ${user.companyCountry}`
                    : ""}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metadata Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">User ID</p>
            <p className="text-gray-900 font-mono">{user.id}</p>
          </div>
          <div>
            <p className="text-gray-500">Last Updated</p>
            <p className="text-gray-900">{formatDateTime(user.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

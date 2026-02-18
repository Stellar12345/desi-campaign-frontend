import { Users, UserPlus, Mail, BarChart3 } from "lucide-react";
import { useCampaignSummary, usePublishedCampaigns } from "@/hooks/useCampaigns";
import { useNavigate } from "react-router-dom";

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Dashboard() {
  // Default to last 3 days for the summary (including today)
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - 2);

  const startDate = formatDate(start);
  const toDate = formatDate(today);

  const { data, isLoading } = useCampaignSummary(startDate, toDate);
  const { data: publishedCampaigns = [] } = usePublishedCampaigns();
  const navigate = useNavigate();

  const stats = [
    {
      name: "Total Users",
      value: data?.users.total ?? 0,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      name: "Total Contacts",
      value: data?.contacts.total ?? 0,
      icon: UserPlus,
      color: "bg-green-500",
    },
    {
      name: "Total Campaigns",
      value: data?.campaigns.total ?? 0,
      icon: Mail,
      color: "bg-purple-500",
    },
    {
      name: "Delivery Rate",
      value: `${data?.rates.deliveryRate?.toFixed?.(2) ?? 0}%`,
      icon: BarChart3,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Overview of your campaigns, users, and engagement
          </p>
        </div>
        <div className="text-sm text-gray-500">
          <span className="font-medium">Summary range: </span>
          {startDate} – {toDate}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {isLoading ? "…" : stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Area */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Campaign Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Today – Campaigns Sent</p>
            <p className="text-2xl font-bold text-gray-900">
              {data?.today.campaignsSent ?? 0}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">This Month – Deliveries Sent</p>
            <p className="text-2xl font-bold text-gray-900">
              {data?.thisMonth.deliveriesSent ?? 0}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total Opens</p>
            <p className="text-2xl font-bold text-gray-900">
              {data?.engagement.totalOpens ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Published Campaigns */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Published Campaigns</h2>
          <span className="text-sm text-gray-500">
            {publishedCampaigns.length} campaign
            {publishedCampaigns.length === 1 ? "" : "s"}
          </span>
        </div>
        {publishedCampaigns.length === 0 ? (
          <p className="text-sm text-gray-500">No published campaigns yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {publishedCampaigns.slice(0, 5).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => navigate(`/campaigns/${c.id}/summary`)}
                className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.subject}</p>
                </div>
                <div className="text-xs text-gray-500">{c.channelCode}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

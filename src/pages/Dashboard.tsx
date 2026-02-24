import { Users, UserPlus, Mail, BarChart3, Calendar } from "lucide-react";
import { useCampaignSummary } from "@/hooks/useCampaigns";
import { useState } from "react";
import DashboardCharts from "@/components/dashboard/DashboardCharts";

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

  const [startDate, setStartDate] = useState(formatDate(start));
  const [toDate, setToDate] = useState(formatDate(today));

  const { data, isLoading } = useCampaignSummary(startDate, toDate);

  const stats = [
    {
      name: "Total Users",
      value: data?.users?.total ?? 0,
      icon: Users,
      color: "bg-[#E9488A]",
    },
    {
      name: "Total Contacts",
      value: data?.contacts?.total ?? 0,
      icon: UserPlus,
      color: "bg-[#FF9E80]",
    },
    {
      name: "Total Campaigns",
      value: data?.campaigns?.total ?? 0,
      icon: Mail,
      color: "bg-[#F3B44C]",
    },
    {
      name: "Delivery Rate",
      value: `${data?.rates?.deliveryRate?.toFixed?.(2) ?? 0}%`,
      icon: BarChart3,
      color: "bg-[#FFD465]",
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Campaign Performance</h2>
          {/* Date Range Selector */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg border border-gray-300 px-4 py-2 shadow-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  const newStartDate = e.target.value;
                  if (newStartDate && newStartDate <= toDate) {
                    setStartDate(newStartDate);
                  }
                }}
                max={toDate}
                className="text-sm border-none outline-none bg-transparent text-gray-700 font-medium cursor-pointer"
                title="Start Date"
              />
              <span className="text-gray-400">–</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  const newToDate = e.target.value;
                  if (newToDate && newToDate >= startDate) {
                    setToDate(newToDate);
                  }
                }}
                min={startDate}
                max={formatDate(today)}
                className="text-sm border-none outline-none bg-transparent text-gray-700 font-medium cursor-pointer"
                title="End Date"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Today – Campaigns Sent</p>
            <p className="text-2xl font-bold text-gray-900">
              {data?.today?.campaignsSent ?? 0}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">This Month – Deliveries Sent</p>
            <p className="text-2xl font-bold text-gray-900">
              {data?.thisMonth?.deliveriesSent ?? 0}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total Opens</p>
            <p className="text-2xl font-bold text-gray-900">
              {data?.engagement?.totalOpens ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Charts Section */}
      <DashboardCharts data={data} isLoading={isLoading} />

    </div>
  );
}

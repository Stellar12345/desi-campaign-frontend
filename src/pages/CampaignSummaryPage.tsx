import { useParams } from "react-router-dom";
import { useCampaignSummaryById } from "@/hooks/useCampaigns";
import Skeleton from "@/components/ui/Skeleton";
import Badge from "@/components/ui/Badge";

export default function CampaignSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useCampaignSummaryById(id || "");

  if (!id) {
    return null;
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { campaignSummary, userStats = [] } = data || {};

  if (!campaignSummary) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Campaign summary not available</h1>
        <p className="text-gray-600 text-sm">
          We couldn't load details for this campaign. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {campaignSummary.campaignName}
          </h1>
          <p className="mt-2 text-gray-600">
            {new Date(campaignSummary.date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">{campaignSummary.campainStatus}</Badge>
        </div>
      </div>

      {/* High-level metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard label="Sent" value={campaignSummary.totalSent} />
        <MetricCard label="Delivered" value={campaignSummary.totalDelivered} />
        <MetricCard label="Opened" value={campaignSummary.totalOpened} />
      </div>

      {/* Delivery metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard label="Clicked" value={campaignSummary.totalClicked} />
        <MetricCard label="Failed" value={campaignSummary.totalFailed} />
        <MetricCard label="Unsubscribed" value={campaignSummary.totalUnsubscribed} />
        <MetricCard label="Date" value={new Date(campaignSummary.date).toLocaleDateString()} />
      </div>

      {/* User stats table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recipient Engagement</h2>
        {userStats.length === 0 ? (
          <p className="text-gray-500 text-sm">No recipient stats available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="py-2 pr-4">Recipient</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4 text-right">Sent</th>
                  <th className="py-2 pr-4 text-right">Delivered</th>
                  <th className="py-2 pr-4 text-right">Opens</th>
                  <th className="py-2 pr-4 text-right">Clicks</th>
                  <th className="py-2 pr-4 text-right">Last Opened</th>
                </tr>
              </thead>
              <tbody>
                {userStats.map((s) => (
                  <tr key={s.userId} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 pr-4 text-gray-900">
                      {s.user.firstName} {s.user.lastName}
                    </td>
                    <td className="py-2 pr-4 text-gray-700">{s.email}</td>
                    <td className="py-2 pr-4 text-right">{s.sent}</td>
                    <td className="py-2 pr-4 text-right">{s.delivered}</td>
                    <td className="py-2 pr-4 text-right">{s.openCount}</td>
                    <td className="py-2 pr-4 text-right">{s.clickCount}</td>
                    <td className="py-2 pr-4 text-right text-gray-500">
                      {s.lastOpenedAt ? new Date(s.lastOpenedAt).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}


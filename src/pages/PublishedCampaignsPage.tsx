import { useState } from "react";
import { Eye, BarChart3 } from "lucide-react";
import { usePublishedCampaignsPaginated } from "@/hooks/useCampaigns";
import type { Campaign } from "@/types";
import Skeleton from "@/components/ui/Skeleton";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { formatDateString } from "@/utils/format";
import { useNavigate } from "react-router-dom";

const RESULTS_PER_PAGE = 10;

export default function PublishedCampaignsPage() {
  const [page, setPage] = useState(1);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const navigate = useNavigate();

  const { data, isLoading, isFetching } = usePublishedCampaignsPaginated(page, RESULTS_PER_PAGE);

  const items = data?.items ?? [];
  const pageInfo = data?.pageInfo;

  const handlePrev = () => {
    if (pageInfo?.hasPrevPage && pageInfo.prevPage) {
      setPage(pageInfo.prevPage);
    }
  };

  const handleNext = () => {
    if (pageInfo?.hasNextPage && pageInfo.nextPage) {
      setPage(pageInfo.nextPage);
    }
  };

  const renderStatusBadge = (status: Campaign["status"]) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge variant="success">Published</Badge>;
      case "SENT":
        return <Badge variant="info">Sent</Badge>;
      case "FAILED":
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge variant="default">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Published Campaigns</h1>
          <p className="mt-2 text-gray-600">
            View all published email campaigns, with full HTML previews.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 text-sm">No published campaigns found.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell>{campaign.subject}</TableCell>
                    <TableCell>{campaign.channelCode}</TableCell>
                    <TableCell>{renderStatusBadge(campaign.status)}</TableCell>
                    <TableCell>
                      {campaign.sentAt
                        ? formatDateString(campaign.sentAt)
                        : formatDateString(campaign.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCampaign(campaign)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Mail
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/campaigns/${campaign.id}/summary`)}
                        >
                          <BarChart3 className="w-4 h-4 mr-1" />
                          Metrics
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pageInfo && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
                <div>
                  Page <span className="font-medium">{pageInfo.currentPage}</span> of{" "}
                  <span className="font-medium">{pageInfo.totalPages}</span>
                  {isFetching && <span className="ml-2 text-xs text-gray-400">Updating…</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrev}
                    disabled={!pageInfo.hasPrevPage}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={!pageInfo.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* HTML Preview Modal */}
      <Modal
        isOpen={!!selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
        title={selectedCampaign ? `Preview: ${selectedCampaign.name}` : ""}
        size="xl"
      >
        {selectedCampaign?.htmlBody ? (
          <div className="border rounded-lg overflow-hidden" style={{ height: "70vh" }}>
            <iframe
              title="Campaign HTML Preview"
              srcDoc={selectedCampaign.htmlBody}
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          </div>
        ) : (
          <p className="text-sm text-gray-600">No HTML content available for this campaign.</p>
        )}
      </Modal>
    </div>
  );
}


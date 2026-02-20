import { useState, useEffect } from "react";
import { Eye, BarChart3 } from "lucide-react";
import { usePublishedCampaignsPaginated, useCampaign } from "@/hooks/useCampaigns";
import type { Campaign, PaginatedCampaignsResponse } from "@/types";
import Skeleton from "@/components/ui/Skeleton";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { formatDateString } from "@/utils/format";
import { useNavigate, useSearchParams } from "react-router-dom";

const RESULTS_PER_PAGE = 10;

export default function PublishedCampaignsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get("page");
  const initialPage = pageParam ? parseInt(pageParam, 10) : 1;
  const [page, setPage] = useState(initialPage);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Sync page state with URL param when it changes externally (e.g., coming back from metrics)
  useEffect(() => {
    const urlPage = pageParam ? parseInt(pageParam, 10) : 1;
    if (urlPage !== page && urlPage >= 1) {
      setPage(urlPage);
    }
  }, [pageParam]); // Only depend on pageParam

  // Update URL when page changes internally (user clicks prev/next)
  const updatePage = (newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams);
    if (newPage > 1) {
      params.set("page", newPage.toString());
    } else {
      params.delete("page");
    }
    setSearchParams(params, { replace: true });
  };
  
  // Fetch full campaign details when a campaign is selected
  const { data: selectedCampaign, isLoading: isLoadingCampaign } = useCampaign(selectedCampaignId || "");

  const { data, isLoading, isFetching } = usePublishedCampaignsPaginated(page, RESULTS_PER_PAGE);

  const campaignData = data as PaginatedCampaignsResponse | undefined;
  const items = campaignData?.items ?? [];
  const pageInfo = campaignData?.pageInfo;

  const handlePrev = () => {
    if (pageInfo?.hasPrevPage && pageInfo.prevPage) {
      updatePage(pageInfo.prevPage);
    }
  };

  const handleNext = () => {
    if (pageInfo?.hasNextPage && pageInfo.nextPage) {
      updatePage(pageInfo.nextPage);
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
                {items.map((campaign: Campaign) => (
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
                          onClick={() => setSelectedCampaignId(campaign.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Mail
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/campaigns/${campaign.id}/summary?returnPage=${page}`)}
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

      {/* Campaign Details Modal */}
      <Modal
        isOpen={!!selectedCampaignId}
        onClose={() => setSelectedCampaignId(null)}
        title={selectedCampaign ? `Campaign Details: ${selectedCampaign.name}` : "Campaign Details"}
        size="xl"
      >
        {isLoadingCampaign ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : selectedCampaign ? (
          <div className="space-y-4 md:space-y-6">
            {/* Campaign Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Campaign Name</p>
                <p className="text-base text-gray-900">{selectedCampaign.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Subject</p>
                <p className="text-base text-gray-900">{selectedCampaign.subject}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Channel</p>
                <p className="text-base text-gray-900">{selectedCampaign.channelCode}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Provider</p>
                <p className="text-base text-gray-900">{selectedCampaign.apiProvider}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                <div>{renderStatusBadge(selectedCampaign.status)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Created At</p>
                <p className="text-base text-gray-900">{formatDateString(selectedCampaign.createdAt)}</p>
              </div>
              {selectedCampaign.sentAt && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Sent At</p>
                  <p className="text-base text-gray-900">{formatDateString(selectedCampaign.sentAt)}</p>
                </div>
              )}
              {selectedCampaign.scheduledAt && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Scheduled At</p>
                  <p className="text-base text-gray-900">{formatDateString(selectedCampaign.scheduledAt)}</p>
                </div>
              )}
            </div>

            {/* HTML Preview */}
            {selectedCampaign.htmlBody && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Email Preview</h3>
                <div className="border rounded-lg overflow-hidden h-[50vh] min-h-[300px] md:h-[60vh]">
                  <iframe
                    title="Campaign HTML Preview"
                    srcDoc={selectedCampaign.htmlBody}
                    className="w-full h-full border-none"
                  />
                </div>
              </div>
            )}

            {/* Text Body (if available) */}
            {selectedCampaign.textBody && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Text Content</h3>
                <div className="p-3 md:p-4 bg-gray-50 rounded-lg overflow-x-auto">
                  <pre className="text-xs md:text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {selectedCampaign.textBody}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-600">Failed to load campaign details.</p>
        )}
      </Modal>
    </div>
  );
}


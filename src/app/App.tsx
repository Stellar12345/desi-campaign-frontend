import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CampaignWizardProvider } from "@/contexts/CampaignWizardContext";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import UsersPage from "@/pages/UsersPage";
import UserDetailsPage from "@/pages/UserDetailsPage";
import CampaignWizard from "@/components/campaigns/wizard/CampaignWizard";
import CampaignsPage from "@/pages/CampaignsPage";
import CampaignSummaryPage from "@/pages/CampaignSummaryPage";
import { useCampaign } from "@/hooks/useCampaigns";
import Skeleton from "@/components/ui/Skeleton";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function CampaignWizardWrapper() {
  const { id } = useParams<{ id?: string }>();
  const { data: campaign, isLoading } = useCampaign(id || "");

  if (id && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full max-w-6xl" />
        </div>
      </div>
    );
  }

  return (
    <CampaignWizardProvider campaignId={id} initialCampaign={campaign}>
      <div className="min-h-screen bg-gray-50">
        <CampaignWizard campaignId={id} />
      </div>
    </CampaignWizardProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/campaigns/new" element={<CampaignWizardWrapper />} />
          <Route path="/campaigns/:id/edit" element={<CampaignWizardWrapper />} />
          <Route
            path="/*"
            element={
              <CampaignWizardProvider>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/users/:id" element={<UserDetailsPage />} />
                    <Route path="/campaigns" element={<CampaignsPage />} />
                          <Route path="/campaigns/:id/summary" element={<CampaignSummaryPage />} />
                  </Routes>
                </Layout>
              </CampaignWizardProvider>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

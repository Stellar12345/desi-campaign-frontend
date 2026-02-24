import { BrowserRouter, Routes, Route, useParams, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CampaignWizardProvider } from "@/contexts/CampaignWizardContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import UsersPage from "@/pages/UsersPage";
import UserDetailsPage from "@/pages/UserDetailsPage";
import CampaignWizard from "@/components/campaigns/wizard/CampaignWizard";
import CampaignsPage from "@/pages/CampaignsPage";
import CampaignSummaryPage from "@/pages/CampaignSummaryPage";
import PublishedCampaignsPage from "@/pages/PublishedCampaignsPage";
import LoginPage from "@/pages/LoginPage";
import { useCampaign } from "@/hooks/useCampaigns";
import Skeleton from "@/components/ui/Skeleton";
import { ToastProvider } from "@/contexts/ToastContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: unknown) => {
        // Don't retry on 401 - will redirect to login
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 401) return false;
        return failureCount < 1;
      },
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

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
    <ToastProvider>
      <CampaignWizardProvider campaignId={id} initialCampaign={campaign}>
        <div className="min-h-screen bg-gray-50">
          <CampaignWizard campaignId={id} />
        </div>
      </CampaignWizardProvider>
    </ToastProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/campaigns/new"
                element={
                  <ProtectedRoute>
                    <CampaignWizardWrapper />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/campaigns/:id/edit"
                element={
                  <ProtectedRoute>
                    <CampaignWizardWrapper />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <CampaignWizardProvider>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/users" element={<UsersPage />} />
                          <Route path="/users/:id" element={<UserDetailsPage />} />
                          <Route path="/campaigns" element={<CampaignsPage />} />
                          <Route path="/campaigns/published" element={<PublishedCampaignsPage />} />
                          <Route path="/campaigns/:id/summary" element={<CampaignSummaryPage />} />
                        </Routes>
                      </Layout>
                    </CampaignWizardProvider>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

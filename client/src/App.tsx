import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPageTemp from "@/pages/auth-page-temp";
import SimpleAuthPage from "@/pages/simple-auth-page";
import DashboardPageTemp from "@/pages/dashboard-page-temp";
import SubscriptionPageTemp from "@/pages/subscription-page-temp";
import ReceiptHistoryPage from "@/pages/receipt-history-page";
import ReportsPage from "@/pages/reports-page";
import AdminDashboard from "@/pages/admin-dashboard";
import MaintenancePage from "@/pages/maintenance-page";
import PropertiesPage from "@/pages/properties-page";
import PropertyDetailPage from "@/pages/property-detail-page";
import ValuationPage from "@/pages/valuation-page";
import { Footer } from "@/components/layout/footer";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={SimpleAuthPage} />
      <ProtectedRoute path="/" component={DashboardPageTemp} />
      <ProtectedRoute path="/subscription" component={SubscriptionPageTemp} />
      <ProtectedRoute path="/receipts" component={ReceiptHistoryPage} />
      <ProtectedRoute path="/reports" component={ReportsPage} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/maintenance" component={MaintenancePage} />
      <ProtectedRoute path="/valuation" component={ValuationPage} />
      <ProtectedRoute path="/properties" component={PropertiesPage} />
      <ProtectedRoute path="/properties/:id" component={PropertyDetailPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow">
            <Router />
          </div>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;

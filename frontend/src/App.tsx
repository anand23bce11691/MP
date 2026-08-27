import React from 'react';
import { TelemetryProvider, useTelemetry } from './context/TelemetryContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TelemetryStrip } from './components/TelemetryStrip';
import { DashboardView } from './views/DashboardView';
import { ShopEasyView } from './views/ShopEasyView';
import { LiveMonitoringView } from './views/LiveMonitoringView';
import { IncidentsView } from './views/IncidentsView';
import { ServicesTopologyView } from './views/ServicesTopologyView';
import { LogsMetricsView } from './views/LogsMetricsView';
import { SimulationsView } from './views/SimulationsView';
import { ReportsView } from './views/ReportsView';
import { DistributedTracingView } from './views/DistributedTracingView';
import { SreSloManagementView } from './views/SreSloManagementView';
import { RemediationPlaybooksView } from './views/RemediationPlaybooksView';
import { ExecutivePostMortemView } from './views/ExecutivePostMortemView';
import { SecurityAuditView } from './views/SecurityAuditView';
import { PerformanceBenchmarkView } from './views/PerformanceBenchmarkView';
import { ServiceSlideOver } from './components/ServiceSlideOver';
import { MetricDrilldownModal } from './components/MetricDrilldownModal';
import { LogoutModal } from './components/LogoutModal';
import { ShopEasyCartDrawer } from './components/ShopEasyCartDrawer';
import { ShopEasyProductDetailModal } from './components/ShopEasyProductDetailModal';
import { ShopEasyAiAssistant } from './components/ShopEasyAiAssistant';
import { ShopEasyWishlistDrawer } from './components/ShopEasyWishlistDrawer';
import { ShopEasyOrderHistoryModal } from './components/ShopEasyOrderHistoryModal';
import { ShopEasyOrderSuccessModal } from './components/ShopEasyOrderSuccessModal';
import { Toast } from './components/Toast';

const MainLayout: React.FC = () => {
  const { activeRoute } = useTelemetry();

  const renderActiveView = () => {
    switch (activeRoute) {
      case 'dashboard': return <DashboardView />;
      case 'shopeasy': return <ShopEasyView />;
      case 'live-monitoring': return <LiveMonitoringView />;
      case 'tracing': return <DistributedTracingView />;
      case 'slo': return <SreSloManagementView />;
      case 'remediation': return <RemediationPlaybooksView />;
      case 'security': return <SecurityAuditView />;
      case 'benchmark': return <PerformanceBenchmarkView />;
      case 'postmortem': return <ExecutivePostMortemView />;
      case 'incidents': return <IncidentsView />;
      case 'services': return <ServicesTopologyView />;
      case 'logs': return <LogsMetricsView />;
      case 'simulations': return <SimulationsView />;
      case 'reports': return <ReportsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased">
      {/* Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <Header />
        <TelemetryStrip />

        <main className="p-8 flex-1 bg-slate-50 space-y-6">
          {renderActiveView()}
        </main>
      </div>

      {/* Observability Drawers & Modals */}
      <ServiceSlideOver />
      <MetricDrilldownModal />
      <LogoutModal />
      
      {/* ShopEasy E-Commerce Core Drawers & Modals */}
      <ShopEasyCartDrawer />
      <ShopEasyProductDetailModal />
      <ShopEasyAiAssistant />
      <ShopEasyWishlistDrawer />
      <ShopEasyOrderHistoryModal />
      <ShopEasyOrderSuccessModal />

      {/* System Toast Notification */}
      <Toast />
    </div>
  );
};

export function App() {
  return (
    <TelemetryProvider>
      <MainLayout />
    </TelemetryProvider>
  );
}

export default App;

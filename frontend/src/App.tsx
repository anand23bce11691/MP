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
import { ServiceSlideOver } from './components/ServiceSlideOver';
import { MetricDrilldownModal } from './components/MetricDrilldownModal';
import { LogoutModal } from './components/LogoutModal';
import { ShopEasyCartDrawer } from './components/ShopEasyCartDrawer';
import { Toast } from './components/Toast';

const MainLayout: React.FC = () => {
  const { activeRoute } = useTelemetry();

  const renderActiveView = () => {
    switch (activeRoute) {
      case 'dashboard': return <DashboardView />;
      case 'shopeasy': return <ShopEasyView />;
      case 'live-monitoring': return <LiveMonitoringView />;
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

      {/* Drawers & Modals */}
      <ServiceSlideOver />
      <MetricDrilldownModal />
      <LogoutModal />
      <ShopEasyCartDrawer />
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

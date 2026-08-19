import React from 'react';
import { ServiceHealthGrid } from '../components/ServiceHealthGrid';
import { MetricKpiStrip } from '../components/MetricKpiStrip';
import { RechartsSection } from '../components/RechartsSection';
import { ActiveIncidentsSection } from '../components/ActiveIncidentsSection';

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 1. Metric KPI Cards */}
      <MetricKpiStrip />

      {/* 2. Microservice Health Grid */}
      <ServiceHealthGrid />

      {/* 3. Recharts Section */}
      <RechartsSection />

      {/* 4. Active Incidents & Root Cause Remediation */}
      <ActiveIncidentsSection />
    </div>
  );
};

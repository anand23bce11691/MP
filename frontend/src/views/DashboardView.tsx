import React from 'react';
import { ConnectedApplicationsCard } from '../components/ConnectedApplicationsCard';
import { ServiceHealthGrid } from '../components/ServiceHealthGrid';
import { MetricKpiStrip } from '../components/MetricKpiStrip';
import { RechartsSection } from '../components/RechartsSection';
import { ActiveIncidentsSection } from '../components/ActiveIncidentsSection';
import { GeminiAiAdvisorCard } from '../components/GeminiAiAdvisorCard';

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 1. Metric KPI Cards */}
      <MetricKpiStrip />

      {/* 2. Connected Target Applications Hub */}
      <ConnectedApplicationsCard />

      {/* 3. Distributed Microservice Health Grid */}
      <ServiceHealthGrid />

      {/* 4. Recharts Section */}
      <RechartsSection />

      {/* 5. Google Gemini AI SRE Advisor */}
      <GeminiAiAdvisorCard />

      {/* 6. Active Incidents & Root Cause Remediation */}
      <ActiveIncidentsSection />
    </div>
  );
};

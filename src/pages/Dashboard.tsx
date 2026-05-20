import { 
  AlertTriangle, 
  FileCheck, 
  TreePine, 
  Users,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentComplaints } from "@/components/dashboard/RecentComplaints";
import { LicenseOverview } from "@/components/dashboard/LicenseOverview";
import { EnvironmentalChart } from "@/components/dashboard/EnvironmentalChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { ProtectedAreasMap } from "@/components/dashboard/ProtectedAreasMap";

export const Dashboard = () => {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Denúncias Ativas"
          value={47}
          change="+12% este mês"
          changeType="negative"
          icon={AlertTriangle}
          iconColor="destructive"
        />
        <StatCard
          title="Licenças em Análise"
          value={28}
          change="-5% este mês"
          changeType="positive"
          icon={FileCheck}
          iconColor="primary"
        />
        <StatCard
          title="Áreas Monitoradas"
          value={156}
          change="+3 novas áreas"
          changeType="positive"
          icon={TreePine}
          iconColor="success"
        />
        <StatCard
          title="Colaboradores Ativos"
          value={42}
          change="2 em treinamento"
          changeType="neutral"
          icon={Users}
          iconColor="accent"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Chart */}
        <div className="md:col-span-2 lg:col-span-2">
          <EnvironmentalChart />
        </div>

        {/* Right Column - Quick Actions & License Overview */}
        <div className="space-y-4 sm:space-y-6">
          <QuickActions />
          <LicenseOverview />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <RecentComplaints />
        <div className="space-y-4 sm:space-y-6">
          <ProtectedAreasMap />
        </div>
      </div>

      {/* Events */}
      <UpcomingEvents />
    </div>
  );
};

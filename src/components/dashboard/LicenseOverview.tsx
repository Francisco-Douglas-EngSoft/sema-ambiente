import { FileCheck, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LicenseStats {
  label: string;
  value: number;
  total: number;
  color: string;
  icon: React.ElementType;
}

const licenseStats: LicenseStats[] = [
  {
    label: "Aprovadas",
    value: 45,
    total: 100,
    color: "bg-success",
    icon: CheckCircle,
  },
  {
    label: "Em Análise",
    value: 28,
    total: 100,
    color: "bg-accent",
    icon: Clock,
  },
  {
    label: "Pendentes",
    value: 15,
    total: 100,
    color: "bg-warning",
    icon: AlertCircle,
  },
  {
    label: "Negadas",
    value: 12,
    total: 100,
    color: "bg-destructive",
    icon: XCircle,
  },
];

export const LicenseOverview = () => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Licenças Ambientais</h3>
          <p className="text-sm text-muted-foreground">Visão geral do status</p>
        </div>
      </div>

      <div className="space-y-5">
        {licenseStats.map((stat) => {
          const Icon = stat.icon;
          const percentage = (stat.value / stat.total) * 100;
          
          return (
            <div key={stat.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${stat.color.replace('bg-', 'text-')}`} />
                  <span className="text-sm font-medium text-foreground">{stat.label}</span>
                </div>
                <span className="text-sm font-bold text-foreground">{stat.value}</span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`absolute inset-y-0 left-0 ${stat.color} rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total de Licenças</span>
          <span className="font-bold text-foreground">100</span>
        </div>
      </div>
    </div>
  );
};

import { AlertTriangle, MapPin, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Complaint {
  id: string;
  type: string;
  location: string;
  date: string;
  status: "pending" | "processing" | "resolved";
  priority: "low" | "medium" | "high";
}

const complaints: Complaint[] = [
  {
    id: "DEN-2024-001",
    type: "Desmatamento Ilegal",
    location: "Serra do Roncador, MT",
    date: "Há 2 horas",
    status: "pending",
    priority: "high",
  },
  {
    id: "DEN-2024-002",
    type: "Poluição Hídrica",
    location: "Rio Cuiabá, MT",
    date: "Há 5 horas",
    status: "processing",
    priority: "high",
  },
  {
    id: "DEN-2024-003",
    type: "Queimada",
    location: "Chapada dos Guimarães",
    date: "Há 1 dia",
    status: "processing",
    priority: "medium",
  },
  {
    id: "DEN-2024-004",
    type: "Descarte Irregular",
    location: "Várzea Grande, MT",
    date: "Há 2 dias",
    status: "resolved",
    priority: "low",
  },
];

const statusLabels = {
  pending: "Pendente",
  processing: "Em Análise",
  resolved: "Resolvido",
};

const statusClasses = {
  pending: "badge-pending",
  processing: "badge-processing",
  resolved: "badge-approved",
};

const priorityClasses = {
  low: "border-l-success",
  medium: "border-l-warning",
  high: "border-l-destructive",
};

export const RecentComplaints = () => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm animate-slide-up">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Denúncias Recentes</h3>
              <p className="text-sm text-muted-foreground">Últimas ocorrências registradas</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-primary">
            Ver todas
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      <div className="divide-y divide-border">
        {complaints.map((complaint) => (
          <div 
            key={complaint.id}
            className={cn(
              "p-4 hover:bg-muted/50 transition-colors cursor-pointer border-l-4",
              priorityClasses[complaint.priority]
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">{complaint.type}</span>
                  <span className={cn("badge-status", statusClasses[complaint.status])}>
                    {statusLabels[complaint.status]}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {complaint.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {complaint.date}
                  </span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground font-mono">{complaint.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

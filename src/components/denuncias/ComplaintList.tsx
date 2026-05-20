import { 
  MapPin, 
  Clock, 
  User, 
  ChevronRight,
  AlertTriangle,
  Flame,
  Droplets,
  Wind,
  Trash2,
  Target,
  Mountain,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Complaint } from "@/types/complaint";

interface ComplaintListProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  selectedId?: string;
}

const typeIcons: Record<string, React.ElementType> = {
  desmatamento: AlertTriangle,
  queimada: Flame,
  poluicao_hidrica: Droplets,
  poluicao_ar: Wind,
  descarte_irregular: Trash2,
  caca_ilegal: Target,
  mineracao_ilegal: Mountain,
  outros: HelpCircle,
};

const typeLabels: Record<string, string> = {
  desmatamento: "Desmatamento Ilegal",
  queimada: "Queimada",
  poluicao_hidrica: "Poluição Hídrica",
  poluicao_ar: "Poluição do Ar",
  descarte_irregular: "Descarte Irregular",
  caca_ilegal: "Caça Ilegal",
  mineracao_ilegal: "Mineração Ilegal",
  outros: "Outros",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  under_analysis: "Em Análise",
  in_progress: "Em Andamento",
  resolved: "Resolvido",
  archived: "Arquivado",
};

const statusClasses: Record<string, string> = {
  pending: "badge-pending",
  under_analysis: "badge-processing",
  in_progress: "bg-accent/15 text-accent",
  resolved: "badge-approved",
  archived: "bg-muted text-muted-foreground",
};

const priorityClasses: Record<string, string> = {
  low: "border-l-success",
  medium: "border-l-warning",
  high: "border-l-destructive",
};

export const ComplaintList = ({ complaints, onSelectComplaint, selectedId }: ComplaintListProps) => {
  if (complaints.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Nenhuma denúncia encontrada
        </h3>
        <p className="text-muted-foreground">
          Tente ajustar os filtros ou registre uma nova denúncia.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="divide-y divide-border">
        {complaints.map((complaint) => {
          const TypeIcon = typeIcons[complaint.type] || HelpCircle;
          
          return (
            <div
              key={complaint.id}
              onClick={() => onSelectComplaint(complaint)}
              className={cn(
                "p-4 hover:bg-muted/50 transition-colors cursor-pointer border-l-4",
                priorityClasses[complaint.priority],
                selectedId === complaint.id && "bg-muted/50"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                  "p-2.5 rounded-lg flex-shrink-0",
                  complaint.priority === "high" ? "bg-destructive/10" : 
                  complaint.priority === "medium" ? "bg-warning/10" : "bg-success/10"
                )}>
                  <TypeIcon className={cn(
                    "w-5 h-5",
                    complaint.priority === "high" ? "text-destructive" : 
                    complaint.priority === "medium" ? "text-warning" : "text-success"
                  )} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">
                      {typeLabels[complaint.type]}
                    </span>
                    <span className={cn("badge-status", statusClasses[complaint.status])}>
                      {statusLabels[complaint.status]}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {complaint.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {complaint.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {complaint.createdAt}
                    </span>
                    {complaint.assignedTo && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {complaint.assignedTo}
                      </span>
                    )}
                  </div>
                </div>

                {/* ID & Arrow */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground font-mono">
                    {complaint.id}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

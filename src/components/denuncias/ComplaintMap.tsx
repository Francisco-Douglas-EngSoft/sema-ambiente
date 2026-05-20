import { MapPin, Maximize2, Layers, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Complaint } from "@/types/complaint";

interface ComplaintMapProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  selectedId?: string;
}

const priorityColors = {
  high: "bg-destructive",
  medium: "bg-warning",
  low: "bg-success",
};

const typeLabels: Record<string, string> = {
  desmatamento: "Desmatamento",
  queimada: "Queimada",
  poluicao_hidrica: "Poluição Hídrica",
  poluicao_ar: "Poluição do Ar",
  descarte_irregular: "Descarte Irregular",
  caca_ilegal: "Caça Ilegal",
  mineracao_ilegal: "Mineração Ilegal",
  outros: "Outros",
};

// Simulated marker positions for demo
const getMarkerPosition = (index: number, total: number) => {
  const positions = [
    { top: "20%", left: "30%" },
    { top: "35%", left: "60%" },
    { top: "50%", left: "25%" },
    { top: "45%", left: "75%" },
    { top: "65%", left: "45%" },
    { top: "25%", left: "80%" },
    { top: "70%", left: "20%" },
    { top: "55%", left: "55%" },
    { top: "40%", left: "40%" },
    { top: "75%", left: "70%" },
  ];
  return positions[index % positions.length];
};

export const ComplaintMap = ({ complaints, onSelectComplaint, selectedId }: ComplaintMapProps) => {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Map Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Mapa de Ocorrências</h3>
            <p className="text-sm text-muted-foreground">{complaints.length} denúncias no mapa</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Layers className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Maximize2 className="w-4 h-4" />
            Ampliar
          </Button>
        </div>
      </div>

      {/* Map Area */}
      <div className="relative h-[500px] bg-gradient-to-br from-primary/5 via-success/10 to-accent/5">
        {/* Simulated map background with grid */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" className="text-border">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Map Labels */}
        <div className="absolute top-4 left-4 text-xs text-muted-foreground/60 font-mono">
          MATO GROSSO - BR
        </div>

        {/* Complaint Markers */}
        {complaints.map((complaint, index) => {
          const position = getMarkerPosition(index, complaints.length);
          const isSelected = selectedId === complaint.id;
          
          return (
            <div
              key={complaint.id}
              className="absolute group cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
              style={{ top: position.top, left: position.left }}
              onClick={() => onSelectComplaint(complaint)}
            >
              {/* Pulse animation for high priority */}
              {complaint.priority === "high" && (
                <div className="absolute inset-0 rounded-full bg-destructive/30 animate-ping" />
              )}
              
              {/* Marker */}
              <div className={cn(
                "relative w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg",
                priorityColors[complaint.priority],
                isSelected && "ring-4 ring-foreground/20 scale-125"
              )}>
                <MapPin className="w-4 h-4 text-white" />
              </div>

              {/* Tooltip */}
              <div className={cn(
                "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10",
                "bg-card border border-border rounded-lg shadow-xl p-3 min-w-[200px]"
              )}>
                <div className="text-sm font-semibold text-foreground mb-1">
                  {typeLabels[complaint.type]}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {complaint.location}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground">{complaint.id}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-full",
                    complaint.priority === "high" ? "bg-destructive/10 text-destructive" :
                    complaint.priority === "medium" ? "bg-warning/10 text-warning" :
                    "bg-success/10 text-success"
                  )}>
                    {complaint.priority === "high" ? "Alta" : complaint.priority === "medium" ? "Média" : "Baixa"}
                  </span>
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-card" />
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="text-xs font-semibold text-foreground mb-2">Prioridade</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Alta</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-muted-foreground">Média</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-muted-foreground">Baixa</span>
            </div>
          </div>
        </div>

        {/* Map attribution */}
        <div className="absolute bottom-4 right-4 text-xs text-muted-foreground/50">
          Integração com API de georreferenciamento
        </div>
      </div>
    </div>
  );
};

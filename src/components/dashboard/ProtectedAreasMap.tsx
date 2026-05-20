import { MapPin, TreePine, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedArea {
  id: string;
  name: string;
  type: string;
  area: string;
  status: "active" | "warning" | "critical";
}

const areas: ProtectedArea[] = [
  { id: "1", name: "Parque Estadual da Serra Azul", type: "Parque Estadual", area: "15.240 ha", status: "active" },
  { id: "2", name: "Reserva do Rio Claro", type: "Reserva Particular", area: "8.500 ha", status: "warning" },
  { id: "3", name: "APA do Cerrado", type: "APA", area: "45.000 ha", status: "active" },
  { id: "4", name: "Estação Ecológica Norte", type: "Estação Ecológica", area: "12.800 ha", status: "critical" },
];

const statusColors = {
  active: "bg-success",
  warning: "bg-warning",
  critical: "bg-destructive",
};

const statusLabels = {
  active: "Normal",
  warning: "Atenção",
  critical: "Crítico",
};

export const ProtectedAreasMap = () => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-slide-up">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TreePine className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Áreas Protegidas</h3>
              <p className="text-sm text-muted-foreground">Monitoramento em tempo real</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Maximize2 className="w-4 h-4" />
            Ampliar Mapa
          </Button>
        </div>
      </div>

      {/* Placeholder for map - in real app would use a mapping library */}
      <div className="relative h-48 bg-gradient-to-br from-primary/5 via-success/10 to-accent/5">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-primary/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Mapa interativo</p>
            <p className="text-xs text-muted-foreground/70">Integração com georreferenciamento</p>
          </div>
        </div>
        
        {/* Decorative dots representing areas */}
        <div className="absolute top-8 left-12 w-3 h-3 bg-success rounded-full animate-pulse" />
        <div className="absolute top-16 right-20 w-3 h-3 bg-warning rounded-full animate-pulse" />
        <div className="absolute bottom-12 left-1/3 w-3 h-3 bg-success rounded-full animate-pulse" />
        <div className="absolute bottom-8 right-1/4 w-3 h-3 bg-destructive rounded-full animate-pulse" />
      </div>

      <div className="divide-y divide-border">
        {areas.map((area) => (
          <div 
            key={area.id}
            className="p-4 hover:bg-muted/50 transition-colors cursor-pointer flex items-center gap-4"
          >
            <div className={`w-2.5 h-2.5 rounded-full ${statusColors[area.status]}`} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm truncate">{area.name}</p>
              <p className="text-xs text-muted-foreground">{area.type} • {area.area}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              area.status === 'active' ? 'bg-success/10 text-success' :
              area.status === 'warning' ? 'bg-warning/10 text-warning' :
              'bg-destructive/10 text-destructive'
            }`}>
              {statusLabels[area.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

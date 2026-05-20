import { 
  Plus, 
  FileText, 
  MapPin, 
  Users, 
  Calendar,
  AlertTriangle,
  FileCheck,
  TreePine
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickAction {
  label: string;
  icon: React.ElementType;
  color: string;
  onClick?: () => void;
}

const actions: QuickAction[] = [
  {
    label: "Nova Denúncia",
    icon: AlertTriangle,
    color: "bg-destructive/10 text-destructive hover:bg-destructive/20",
  },
  {
    label: "Nova Licença",
    icon: FileCheck,
    color: "bg-primary/10 text-primary hover:bg-primary/20",
  },
  {
    label: "Novo Projeto",
    icon: TreePine,
    color: "bg-success/10 text-success hover:bg-success/20",
  },
  {
    label: "Agendar Visita",
    icon: Calendar,
    color: "bg-accent/10 text-accent hover:bg-accent/20",
  },
];

export const QuickActions = () => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-warning/10">
          <Plus className="w-5 h-5 text-warning" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Ações Rápidas</h3>
          <p className="text-sm text-muted-foreground">Acesso direto às principais funções</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant="ghost"
              className={`h-auto py-4 flex flex-col items-center gap-2 ${action.color} transition-all`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

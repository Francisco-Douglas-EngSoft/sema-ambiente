import {
  LayoutDashboard,
  AlertTriangle,
  FileCheck,
  Users,
  Settings,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileBottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const primaryItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Início" },
  { id: "denuncias", icon: AlertTriangle, label: "Denúncias" },
  { id: "licencas", icon: FileCheck, label: "Licenças" },
  { id: "equipe", icon: Users, label: "Equipe" },
];

const moreItems = [
  { id: "relatorios", label: "Relatórios" },
  { id: "projetos", label: "Projetos" },
  { id: "areas", label: "Áreas Protegidas" },
  { id: "agenda", label: "Agenda" },
  { id: "seed", label: "Seed de Dados" },
  { id: "configuracoes", label: "Configurações" },
];

export const MobileBottomNav = ({ currentPage, onNavigate }: MobileBottomNavProps) => {
  const isMoreActive = moreItems.some((i) => i.id === currentPage);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-sidebar-foreground/60 transition-colors",
                active && "text-primary"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </button>
          );
        })}

        {/* More menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-sidebar-foreground/60 transition-colors",
                isMoreActive && "text-primary"
              )}
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-tight">Mais</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-48 mb-2">
            {moreItems.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(currentPage === item.id && "bg-accent")}
              >
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

import { 
  LayoutDashboard, 
  AlertTriangle, 
  FileCheck, 
  FolderKanban, 
  Users, 
  MapPin, 
  Calendar, 
  Settings,
  Leaf,
  ChevronLeft,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
  badge?: number;
}

const NavItem = ({ icon: Icon, label, active, collapsed, onClick, badge }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "nav-link w-full group relative",
      active && "active"
    )}
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    {!collapsed && (
      <>
        <span className="flex-1 text-left">{label}</span>
        {badge && badge > 0 && (
          <span className="bg-warning text-warning-foreground text-xs font-bold px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </>
    )}
    {collapsed && badge && badge > 0 && (
      <span className="absolute -top-1 -right-1 bg-warning text-warning-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
        {badge}
      </span>
    )}
  </button>
);

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar = ({ currentPage, onNavigate, mobileOpen, onMobileClose }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "denuncias", icon: AlertTriangle, label: "Denúncias", badge: 12 },
    { id: "licencas", icon: FileCheck, label: "Licenças", badge: 5 },
    { id: "relatorios", icon: LayoutDashboard, label: "Relatórios" },
    { id: "projetos", icon: FolderKanban, label: "Projetos" },
    { id: "areas", icon: MapPin, label: "Áreas Protegidas" },
    { id: "equipe", icon: Users, label: "Equipe" },
    { id: "agenda", icon: Calendar, label: "Agenda" },
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    onMobileClose?.();
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onMobileClose?.();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onMobileClose]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-nature flex items-center justify-center shadow-lg">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-sidebar-foreground text-sm truncate">SEMA</h1>
                <p className="text-xs text-sidebar-foreground/60 truncate">Meio Ambiente</p>
              </div>
            )}
          </div>
          {/* Close button for tablet/mobile slide-out */}
          {mobileOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileClose}
              className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={currentPage === item.id}
            collapsed={collapsed}
            onClick={() => handleNavigate(item.id)}
            badge={item.badge}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <NavItem
          icon={Settings}
          label="Configurações"
          collapsed={collapsed}
          onClick={() => handleNavigate("configuracoes")}
          active={currentPage === "configuracoes"}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent hidden lg:flex"
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Overlay for tablet slide-out (md–lg) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Desktop sidebar – visible only on lg+ */}
      <aside
        className={cn(
          "bg-sidebar h-screen flex flex-col border-r border-sidebar-border transition-all duration-300",
          "hidden lg:flex",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Tablet/Mobile slide-out sidebar – hidden on mobile (bottom nav used), shown as hamburger on md */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-72 bg-sidebar flex flex-col border-r border-sidebar-border z-50 transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

import { Eye, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export const GuestModeBanner = () => {
  const { isGuest, exitGuestMode } = useAuth();

  if (!isGuest) return null;

  return (
    <div className="bg-accent/10 border-b border-accent/20 px-4 py-2">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-accent">
          <Eye className="w-4 h-4" />
          <span className="font-medium">Modo Visitante</span>
          <span className="text-accent/70 hidden sm:inline">
            — Visualização somente leitura. Nenhuma ação será salva.
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exitGuestMode}
          className="gap-2 border-accent/30 text-accent hover:bg-accent/10"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Fazer Login</span>
        </Button>
      </div>
    </div>
  );
};

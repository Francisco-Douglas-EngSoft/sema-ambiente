import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { GuestModeBanner } from "@/components/GuestModeBanner";
import { Dashboard } from "@/pages/Dashboard";
import { Denuncias } from "@/pages/Denuncias";
import { Licencas } from "@/pages/Licencas";
import { Equipe } from "@/pages/Equipe";
import { Relatorios } from "@/pages/Relatorios";
import { Projetos } from "@/pages/Projetos";
import { AreasProtegidas } from "@/pages/AreasProtegidas";
import { Agenda } from "@/pages/Agenda";
import { Configuracoes } from "@/pages/Configuracoes";

import { LoginPage } from "@/pages/LoginPage";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const pageConfig: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Visão geral das atividades ambientais" },
  denuncias: { title: "Denúncias", subtitle: "Gestão de ocorrências ambientais" },
  licencas: { title: "Licenças Ambientais", subtitle: "Controle e emissão de licenças" },
  relatorios: { title: "Relatórios", subtitle: "Análise estatística e exportação de dados" },
  projetos: { title: "Projetos", subtitle: "Projetos ambientais em andamento" },
  areas: { title: "Áreas Protegidas", subtitle: "Monitoramento de unidades de conservação" },
  equipe: { title: "Equipe", subtitle: "Gestão de colaboradores" },
  agenda: { title: "Agenda", subtitle: "Eventos e compromissos" },
  configuracoes: { title: "Configurações", subtitle: "Configurações do sistema" },
  
};

const Index = () => {
  const { user, isLoading, isGuest } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const config = pageConfig[currentPage] || pageConfig.dashboard;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && !isGuest) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "denuncias":
        return <Denuncias />;
      case "licencas":
        return <Licencas />;
      case "relatorios":
        return <Relatorios />;
      case "equipe":
        return <Equipe />;
      case "projetos":
        return <Projetos />;
      case "areas":
        return <AreasProtegidas />;
      case "agenda":
        return <Agenda />;
      case "configuracoes":
        return <Configuracoes />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <GuestModeBanner />
        <Header
          title={config.title}
          subtitle={config.subtitle}
          onMenuToggle={() => setMobileMenuOpen(true)}
        />
        
        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <MobileBottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
};

export default Index;

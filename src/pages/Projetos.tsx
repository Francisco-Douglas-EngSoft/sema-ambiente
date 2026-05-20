import { useState } from "react";
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "planning" | "in_progress" | "completed" | "paused";
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  progress: number;
  team: string[];
  budget: number;
  spent: number;
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Reflorestamento da Serra do Mar",
    description: "Programa de recuperação de áreas degradadas na Serra do Mar com plantio de espécies nativas.",
    status: "in_progress",
    category: "Reflorestamento",
    location: "Serra do Mar - Região Norte",
    startDate: "2025-01-15",
    endDate: "2026-06-30",
    progress: 45,
    team: ["Ana Silva", "Carlos Mendes", "Julia Rocha"],
    budget: 250000,
    spent: 112500,
  },
  {
    id: "2",
    name: "Monitoramento Hídrico do Rio Taquari",
    description: "Instalação de sensores e monitoramento contínuo da qualidade da água.",
    status: "in_progress",
    category: "Monitoramento",
    location: "Bacia do Rio Taquari",
    startDate: "2025-03-01",
    endDate: "2025-12-31",
    progress: 30,
    team: ["Pedro Santos", "Mariana Lima"],
    budget: 180000,
    spent: 54000,
  },
  {
    id: "3",
    name: "Educação Ambiental nas Escolas",
    description: "Programa de conscientização ambiental em 50 escolas do município.",
    status: "planning",
    category: "Educação",
    location: "Município - Zona Urbana",
    startDate: "2026-02-01",
    endDate: "2026-11-30",
    progress: 10,
    team: ["Fernanda Oliveira"],
    budget: 95000,
    spent: 9500,
  },
  {
    id: "4",
    name: "Recuperação de Nascentes",
    description: "Identificação e recuperação de 30 nascentes degradadas na região rural.",
    status: "completed",
    category: "Recuperação",
    location: "Zona Rural - Distrito Sul",
    startDate: "2024-06-01",
    endDate: "2025-05-31",
    progress: 100,
    team: ["Ricardo Alves", "Beatriz Nunes", "Lucas Ferreira"],
    budget: 320000,
    spent: 298000,
  },
  {
    id: "5",
    name: "Inventário Florestal Municipal",
    description: "Levantamento completo da cobertura florestal do município com uso de drones.",
    status: "paused",
    category: "Inventário",
    location: "Todo o Município",
    startDate: "2025-04-01",
    endDate: "2025-10-31",
    progress: 60,
    team: ["Thiago Costa", "Amanda Reis"],
    budget: 150000,
    spent: 90000,
  },
];

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  planning: { label: "Planejamento", variant: "outline" },
  in_progress: { label: "Em Andamento", variant: "default" },
  completed: { label: "Concluído", variant: "secondary" },
  paused: { label: "Pausado", variant: "destructive" },
};

export const Projetos = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filtered = mockProjects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && p.status === activeTab;
  });

  const stats = {
    total: mockProjects.length,
    active: mockProjects.filter((p) => p.status === "in_progress").length,
    completed: mockProjects.filter((p) => p.status === "completed").length,
    totalBudget: mockProjects.reduce((s, p) => s + p.budget, 0),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Projetos</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Concluídos</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Orçamento Total</p>
              <p className="text-2xl font-bold">
                {(stats.totalBudget / 1000).toFixed(0)}k
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar projetos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" /> Filtros
        </Button>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Novo Projeto
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="in_progress">Em Andamento</TabsTrigger>
          <TabsTrigger value="planning">Planejamento</TabsTrigger>
          <TabsTrigger value="completed">Concluídos</TabsTrigger>
          <TabsTrigger value="paused">Pausados</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((project) => {
              const sc = statusConfig[project.status];
              return (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                      <Badge variant={sc.variant}>{sc.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{project.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(project.endDate).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{project.team.length} membros</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {project.category}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    <div className="flex justify-between items-center text-sm pt-2 border-t">
                      <span className="text-muted-foreground">
                        Orçamento: R$ {project.spent.toLocaleString("pt-BR")} / R$ {project.budget.toLocaleString("pt-BR")}
                      </span>
                      <Button variant="ghost" size="sm">
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum projeto encontrado.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

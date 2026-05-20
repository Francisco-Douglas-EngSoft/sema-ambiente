import { useState } from "react";
import {
  MapPin,
  Search,
  Filter,
  TreePine,
  Waves,
  Mountain,
  Eye,
  Shield,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProtectedArea {
  id: string;
  name: string;
  type: "park" | "reserve" | "apa" | "rppn";
  category: string;
  area: number;
  location: string;
  status: "active" | "alert" | "critical";
  biodiversityIndex: number;
  lastInspection: string;
  threats: string[];
  species: number;
  coordinates: string;
}

const mockAreas: ProtectedArea[] = [
  {
    id: "1",
    name: "Parque Municipal da Serra Verde",
    type: "park",
    category: "Parque Natural",
    area: 1250,
    location: "Serra Verde - Região Norte",
    status: "active",
    biodiversityIndex: 8.7,
    lastInspection: "2026-01-20",
    threats: ["Invasão", "Queimadas"],
    species: 342,
    coordinates: "-22.9068, -43.1729",
  },
  {
    id: "2",
    name: "Reserva Biológica do Taquari",
    type: "reserve",
    category: "Reserva Biológica",
    area: 3400,
    location: "Vale do Taquari",
    status: "alert",
    biodiversityIndex: 7.2,
    lastInspection: "2025-12-05",
    threats: ["Desmatamento", "Mineração ilegal", "Caça"],
    species: 518,
    coordinates: "-23.1234, -44.5678",
  },
  {
    id: "3",
    name: "APA da Lagoa Azul",
    type: "apa",
    category: "Área de Proteção Ambiental",
    area: 890,
    location: "Litoral Sul",
    status: "active",
    biodiversityIndex: 6.9,
    lastInspection: "2026-02-01",
    threats: ["Poluição hídrica"],
    species: 215,
    coordinates: "-24.0012, -45.2345",
  },
  {
    id: "4",
    name: "RPPN Fazenda Esperança",
    type: "rppn",
    category: "Reserva Particular",
    area: 450,
    location: "Distrito Rural Oeste",
    status: "active",
    biodiversityIndex: 7.8,
    lastInspection: "2025-11-15",
    threats: [],
    species: 178,
    coordinates: "-22.5678, -43.9876",
  },
  {
    id: "5",
    name: "Parque Estadual das Cachoeiras",
    type: "park",
    category: "Parque Estadual",
    area: 5200,
    location: "Serra das Cachoeiras",
    status: "critical",
    biodiversityIndex: 5.4,
    lastInspection: "2025-10-28",
    threats: ["Incêndio florestal", "Desmatamento", "Espécies invasoras"],
    species: 623,
    coordinates: "-23.4567, -44.1234",
  },
];

const typeIcons: Record<string, React.ElementType> = {
  park: TreePine,
  reserve: Shield,
  apa: Waves,
  rppn: Mountain,
};

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Normal", color: "bg-green-500" },
  alert: { label: "Alerta", color: "bg-yellow-500" },
  critical: { label: "Crítico", color: "bg-red-500" },
};

export const AreasProtegidas = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filtered = mockAreas.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && a.status === activeTab;
  });

  const totalArea = mockAreas.reduce((s, a) => s + a.area, 0);
  const totalSpecies = mockAreas.reduce((s, a) => s + a.species, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Áreas Cadastradas</p>
              <p className="text-2xl font-bold">{mockAreas.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TreePine className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Área Total</p>
              <p className="text-2xl font-bold">{totalArea.toLocaleString("pt-BR")} ha</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Espécies Registradas</p>
              <p className="text-2xl font-bold">{totalSpecies.toLocaleString("pt-BR")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Em Alerta</p>
              <p className="text-2xl font-bold">
                {mockAreas.filter((a) => a.status !== "active").length}
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
            placeholder="Buscar áreas protegidas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" /> Filtros
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="active">Normal</TabsTrigger>
          <TabsTrigger value="alert">Alerta</TabsTrigger>
          <TabsTrigger value="critical">Crítico</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((area) => {
              const Icon = typeIcons[area.type] || MapPin;
              const sc = statusConfig[area.status];
              return (
                <Card key={area.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{area.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{area.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${sc.color}`} />
                        <span className="text-xs font-medium">{sc.label}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{area.location}</span>
                      </div>
                      <div className="text-muted-foreground">
                        Área: <span className="font-medium text-foreground">{area.area.toLocaleString("pt-BR")} ha</span>
                      </div>
                      <div className="text-muted-foreground">
                        Biodiversidade: <span className="font-medium text-foreground">{area.biodiversityIndex}/10</span>
                      </div>
                      <div className="text-muted-foreground">
                        Espécies: <span className="font-medium text-foreground">{area.species}</span>
                      </div>
                    </div>

                    {area.threats.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {area.threats.map((t) => (
                          <Badge key={t} variant="destructive" className="text-xs">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm pt-2 border-t">
                      <span className="text-muted-foreground">
                        Última inspeção: {new Date(area.lastInspection).toLocaleDateString("pt-BR")}
                      </span>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Eye className="w-4 h-4" /> Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma área encontrada.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

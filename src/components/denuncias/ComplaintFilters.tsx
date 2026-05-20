import { Search, Filter, X, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export interface ComplaintFiltersState {
  search: string;
  type: string;
  status: string;
  priority: string;
  dateRange: string;
}

interface ComplaintFiltersProps {
  filters: ComplaintFiltersState;
  onFiltersChange: (filters: ComplaintFiltersState) => void;
  resultCount: number;
}

const complaintTypes = [
  { value: "all", label: "Todos os tipos" },
  { value: "desmatamento", label: "Desmatamento Ilegal" },
  { value: "queimada", label: "Queimada" },
  { value: "poluicao_hidrica", label: "Poluição Hídrica" },
  { value: "poluicao_ar", label: "Poluição do Ar" },
  { value: "descarte_irregular", label: "Descarte Irregular" },
  { value: "caca_ilegal", label: "Caça Ilegal" },
  { value: "mineracao_ilegal", label: "Mineração Ilegal" },
];

const statusOptions = [
  { value: "all", label: "Todos os status" },
  { value: "pending", label: "Pendente" },
  { value: "under_analysis", label: "Em Análise" },
  { value: "in_progress", label: "Em Andamento" },
  { value: "resolved", label: "Resolvido" },
  { value: "archived", label: "Arquivado" },
];

const priorityOptions = [
  { value: "all", label: "Todas as prioridades" },
  { value: "high", label: "Alta" },
  { value: "medium", label: "Média" },
  { value: "low", label: "Baixa" },
];

const dateRangeOptions = [
  { value: "all", label: "Todo período" },
  { value: "today", label: "Hoje" },
  { value: "week", label: "Última semana" },
  { value: "month", label: "Último mês" },
  { value: "quarter", label: "Último trimestre" },
  { value: "year", label: "Último ano" },
];

export const ComplaintFilters = ({ filters, onFiltersChange, resultCount }: ComplaintFiltersProps) => {
  const activeFiltersCount = [
    filters.type !== "all" && filters.type,
    filters.status !== "all" && filters.status,
    filters.priority !== "all" && filters.priority,
    filters.dateRange !== "all" && filters.dateRange,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      type: "all",
      status: "all",
      priority: "all",
      dateRange: "all",
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID, localização ou descrição..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
        
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="w-4 h-4" />
            Limpar filtros
            <Badge variant="secondary" className="ml-1">{activeFiltersCount}</Badge>
          </Button>
        )}
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Select
          value={filters.type}
          onValueChange={(value) => onFiltersChange({ ...filters, type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {complaintTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(value) => onFiltersChange({ ...filters, priority: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((priority) => (
              <SelectItem key={priority.value} value={priority.value}>
                {priority.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.dateRange}
          onValueChange={(value) => onFiltersChange({ ...filters, dateRange: value })}
        >
          <SelectTrigger>
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            {dateRangeOptions.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground">{resultCount}</span> denúncias encontradas
        </span>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Filtros aplicados: {activeFiltersCount}</span>
        </div>
      </div>
    </div>
  );
};

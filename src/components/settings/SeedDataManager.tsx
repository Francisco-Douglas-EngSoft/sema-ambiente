import { useState } from "react";
import {
  Database,
  Play,
  Trash2,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Sprout,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SEED_TYPES = [
  { id: "users", label: "Usuários", icon: "👤", description: "Usuários fictícios com roles (admin, analyst, inspector, viewer)" },
  { id: "complaints", label: "Denúncias", icon: "🔴", description: "Denúncias ambientais com dados realistas" },
  { id: "licenses", label: "Licenças", icon: "📄", description: "Licenças ambientais em diversos status" },
  { id: "trainings", label: "Treinamentos", icon: "🎓", description: "Capacitações e cursos para equipe" },
  { id: "performance_goals", label: "Metas", icon: "🎯", description: "Metas de desempenho individuais" },
];

const QUANTITY_OPTIONS = [
  { value: "10", label: "10 registros" },
  { value: "50", label: "50 registros" },
  { value: "100", label: "100 registros" },
  { value: "250", label: "250 registros" },
  { value: "500", label: "500 registros" },
  { value: "1000", label: "1.000 registros" },
];

export const SeedDataManager = () => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [quantity, setQuantity] = useState("100");
  const [isSeeding, setIsSeeding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [results, setResults] = useState<Record<string, number | string> | null>(null);

  function toggleType(id: string) {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  function selectAll() {
    if (selectedTypes.length === SEED_TYPES.length) {
      setSelectedTypes([]);
    } else {
      setSelectedTypes(SEED_TYPES.map((t) => t.id));
    }
  }

  async function handleSeed() {
    if (selectedTypes.length === 0) {
      toast.error("Selecione pelo menos um tipo de dado");
      return;
    }

    setIsSeeding(true);
    setProgress(0);
    setResults(null);

    const qty = parseInt(quantity);
    const totalBatches = selectedTypes.length * Math.ceil(qty / 100);
    let completedBatches = 0;

    // Simulate progress while waiting for the edge function
    const progressInterval = setInterval(() => {
      completedBatches++;
      const pct = Math.min((completedBatches / totalBatches) * 100, 95);
      setProgress(pct);
      setStatusMessage(
        `Criando dados... ${Math.min(completedBatches * 100, qty * selectedTypes.length)} registros processados`
      );
    }, 5500);

    try {
      setStatusMessage("Iniciando criação de dados fictícios...");

      const { data, error } = await supabase.functions.invoke("seed-data", {
        body: { action: "seed", types: selectedTypes, quantity: qty },
      });

      clearInterval(progressInterval);

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setProgress(100);
      setResults(data.results);
      setStatusMessage("Seed concluído com sucesso!");
      toast.success("Dados criados com sucesso!", {
        description: `${Object.values(data.results as Record<string, number>).reduce((a: number, b: number) => a + b, 0)} registros criados.`,
      });
    } catch (error: any) {
      clearInterval(progressInterval);
      setStatusMessage(`Erro: ${error.message}`);
      toast.error("Erro ao criar dados", { description: error.message });
    } finally {
      setIsSeeding(false);
    }
  }

  async function handleDelete() {
    if (selectedTypes.length === 0) {
      toast.error("Selecione pelo menos um tipo de dado para excluir");
      return;
    }

    setIsDeleting(true);
    setProgress(0);
    setResults(null);
    setStatusMessage("Excluindo dados...");

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 15, 90));
    }, 2000);

    try {
      const { data, error } = await supabase.functions.invoke("seed-data", {
        body: { action: "delete", types: selectedTypes, quantity: 0 },
      });

      clearInterval(progressInterval);

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setProgress(100);
      setResults(data.results);
      setStatusMessage("Dados excluídos com sucesso!");
      toast.success("Dados excluídos com sucesso!");
    } catch (error: any) {
      clearInterval(progressInterval);
      setStatusMessage(`Erro: ${error.message}`);
      toast.error("Erro ao excluir dados", { description: error.message });
    } finally {
      setIsDeleting(false);
    }
  }

  const isWorking = isSeeding || isDeleting;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sprout className="w-5 h-5 text-primary" />
          Seed de Dados
        </CardTitle>
        <CardDescription>
          Crie dados fictícios realistas para testar o sistema. A cada 100 registros,
          o processo faz uma pausa de 5 segundos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Type Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Tipos de Dados</Label>
            <Button variant="ghost" size="sm" onClick={selectAll}>
              {selectedTypes.length === SEED_TYPES.length
                ? "Desmarcar Todos"
                : "Selecionar Todos"}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SEED_TYPES.map((type) => (
              <label
                key={type.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedTypes.includes(type.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                } ${isWorking ? "opacity-50 pointer-events-none" : ""}`}
              >
                <Checkbox
                  checked={selectedTypes.includes(type.id)}
                  onCheckedChange={() => toggleType(type.id)}
                  disabled={isWorking}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span>{type.icon}</span>
                    <span className="font-medium text-sm">{type.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <Separator />

        {/* Quantity Selection */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Quantidade por Tipo</Label>
          <Select value={quantity} onValueChange={setQuantity} disabled={isWorking}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUANTITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Total estimado:{" "}
            <span className="font-medium">
              {(selectedTypes.length * parseInt(quantity)).toLocaleString("pt-BR")} registros
            </span>
            {parseInt(quantity) > 100 && (
              <span>
                {" "}
                · Tempo estimado:{" "}
                {Math.ceil(parseInt(quantity) / 100) * 5 * selectedTypes.length}s
              </span>
            )}
          </p>
        </div>

        <Separator />

        {/* Progress */}
        {isWorking && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>{statusMessage}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">
              {Math.round(progress)}%
            </p>
          </div>
        )}

        {/* Results */}
        {results && !isWorking && (
          <div className="space-y-2 p-4 rounded-lg bg-muted/50 animate-in fade-in">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>{statusMessage}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(results).map(([key, value]) => {
                const type = SEED_TYPES.find((t) => t.id === key);
                return (
                  <Badge key={key} variant="secondary" className="gap-1">
                    {type?.icon} {type?.label}: {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSeed}
            disabled={isWorking || selectedTypes.length === 0}
            className="gap-2 flex-1"
          >
            {isSeeding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isSeeding ? "Criando Dados..." : "Criar Dados"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isWorking || selectedTypes.length === 0}
                className="gap-2 flex-1"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {isDeleting ? "Excluindo..." : "Excluir Dados"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Confirmar Exclusão
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação irá excluir <strong>TODOS</strong> os registros dos tipos selecionados:
                  <span className="block mt-2 font-medium">
                    {selectedTypes
                      .map((id) => SEED_TYPES.find((t) => t.id === id)?.label)
                      .join(", ")}
                  </span>
                  <span className="block mt-2 text-destructive">
                    Esta ação não pode ser desfeita!
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Sim, Excluir Tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Use apenas em ambiente de teste. Os dados são fictícios e podem sobrescrever protocolos existentes.
        </p>
      </CardContent>
    </Card>
  );
};

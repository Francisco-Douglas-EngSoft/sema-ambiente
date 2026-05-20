import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  Download, 
  RefreshCw, 
  FileCheck, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  User,
  MapPin,
  Building,
  ChevronRight,
  Loader2,
  Upload,
  Eye,
  FileDown,
  Printer
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getLicenses, 
  createLicense, 
  updateLicense, 
  addLicenseTimeline,
  type LicenseRow, 
  type LicenseStatus 
} from "@/services/licenseService";
import { demoLicenses } from "@/data/demoData";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const licenseSchema = z.object({
  type: z.enum(["previa", "instalacao", "operacao", "simplificada", "autorizacao"] as const),
  applicant_name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(200),
  applicant_document: z.string().min(11, "CPF/CNPJ inválido").max(18),
  applicant_email: z.string().email("E-mail inválido"),
  applicant_phone: z.string().max(20).optional(),
  enterprise_name: z.string().min(3, "Nome do empreendimento obrigatório").max(200),
  enterprise_activity: z.string().min(3, "Atividade obrigatória").max(500),
  enterprise_address: z.string().min(10, "Endereço obrigatório").max(500),
  enterprise_coordinates: z.string().optional(),
  description: z.string().max(2000).optional(),
  area_size: z.string().optional(),
});

type LicenseFormData = z.infer<typeof licenseSchema>;

const licenseTypes = [
  { value: "previa", label: "Licença Prévia (LP)" },
  { value: "instalacao", label: "Licença de Instalação (LI)" },
  { value: "operacao", label: "Licença de Operação (LO)" },
  { value: "simplificada", label: "Licença Simplificada" },
  { value: "autorizacao", label: "Autorização Ambiental" },
];

const statusConfig: Record<LicenseStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: "Rascunho", color: "bg-muted text-muted-foreground", icon: FileText },
  submitted: { label: "Submetido", color: "bg-accent/10 text-accent", icon: Clock },
  documentation: { label: "Documentação", color: "bg-warning/10 text-warning", icon: FileCheck },
  technical_analysis: { label: "Análise Técnica", color: "bg-primary/10 text-primary", icon: User },
  approved: { label: "Aprovado", color: "bg-success/10 text-success", icon: CheckCircle },
  rejected: { label: "Indeferido", color: "bg-destructive/10 text-destructive", icon: XCircle },
  expired: { label: "Vencido", color: "bg-muted text-muted-foreground", icon: Clock },
};

const typeLabels: Record<string, string> = {
  previa: "Licença Prévia",
  instalacao: "Licença de Instalação",
  operacao: "Licença de Operação",
  simplificada: "Licença Simplificada",
  autorizacao: "Autorização Ambiental",
};

const workflowSteps = [
  { status: "submitted", label: "Protocolo" },
  { status: "documentation", label: "Documentos" },
  { status: "technical_analysis", label: "Análise" },
  { status: "approved", label: "Decisão" },
];

// Guest action button wrapper
const GuestActionButton = ({ 
  children, 
  isGuest 
}: { 
  children: React.ReactNode; 
  isGuest: boolean;
}) => {
  if (!isGuest) return <>{children}</>;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-not-allowed">{children}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Ação indisponível no modo visitante</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const Licencas = () => {
  const { user, profile, isStaff, isGuest } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<LicenseRow | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleGeneratePdf = async (license: LicenseRow) => {
    if (license.status !== "approved") {
      toast.error("Apenas licenças aprovadas podem gerar PDF");
      return;
    }
    
    setIsGeneratingPdf(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-license-pdf", {
        body: { licenseId: license.id },
      });

      if (error) throw error;

      // Open in new window for printing
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(data);
        printWindow.document.close();
      }
      
      toast.success("PDF gerado com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao gerar PDF", { description: error.message });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const form = useForm<LicenseFormData>({
    resolver: zodResolver(licenseSchema),
    defaultValues: {
      type: "simplificada",
      applicant_name: "",
      applicant_document: "",
      applicant_email: "",
      applicant_phone: "",
      enterprise_name: "",
      enterprise_activity: "",
      enterprise_address: "",
      enterprise_coordinates: "",
      description: "",
      area_size: "",
    },
  });

  // Use demo data for guest mode
  const { data: realLicenses = [], isLoading, refetch } = useQuery({
    queryKey: ["licenses"],
    queryFn: getLicenses,
    enabled: isStaff && !isGuest,
  });

  const licenses = isGuest ? (demoLicenses as unknown as LicenseRow[]) : realLicenses;

  const createMutation = useMutation({
    mutationFn: async (data: LicenseFormData) => {
      const license = await createLicense({
        type: data.type,
        applicant_name: data.applicant_name,
        applicant_document: data.applicant_document,
        applicant_email: data.applicant_email,
        applicant_phone: data.applicant_phone || null,
        enterprise_name: data.enterprise_name,
        enterprise_activity: data.enterprise_activity,
        enterprise_address: data.enterprise_address,
        enterprise_coordinates: data.enterprise_coordinates || null,
        description: data.description || null,
        area_size: data.area_size ? parseFloat(data.area_size) : null,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      });
      if (!license) throw new Error("Falha ao criar licença");
      
      await addLicenseTimeline(
        license.id,
        user?.id || null,
        profile?.full_name || "Sistema",
        "Licença protocolada"
      );
      
      return license;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      toast.success("Licença protocolada com sucesso!");
      setIsFormOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error("Erro ao protocolar licença", { description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LicenseStatus }) => {
      const updates: any = { status };
      if (status === "approved") {
        updates.approved_at = new Date().toISOString();
        // Set expiration to 1 year from now
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        updates.expires_at = expiresAt.toISOString();
      }
      
      const updated = await updateLicense(id, updates);
      await addLicenseTimeline(
        id,
        user?.id || null,
        profile?.full_name || "Sistema",
        `Status alterado para "${statusConfig[status].label}"`
      );
      return updated;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      setSelectedLicense(data);
      toast.success("Status atualizado");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar", { description: error.message });
    },
  });

  const filteredLicenses = useMemo(() => {
    return licenses.filter((license) => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matches =
          license.protocol.toLowerCase().includes(search) ||
          license.enterprise_name.toLowerCase().includes(search) ||
          license.applicant_name.toLowerCase().includes(search);
        if (!matches) return false;
      }
      if (statusFilter !== "all" && license.status !== statusFilter) return false;
      return true;
    });
  }, [licenses, searchTerm, statusFilter]);

  const handleSubmit = (data: LicenseFormData) => {
    createMutation.mutate(data);
  };

  if (isLoading && !isGuest) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <GuestActionButton isGuest={isGuest}>
            <Button 
              onClick={() => !isGuest && setIsFormOpen(true)} 
              className="gap-2"
              disabled={isGuest}
            >
              <Plus className="w-4 h-4" />
              Nova Licença
            </Button>
          </GuestActionButton>
          <GuestActionButton isGuest={isGuest}>
            <Button variant="outline" className="gap-2" disabled={isGuest}>
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </GuestActionButton>
          {!isGuest && (
            <Button variant="ghost" size="icon" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por protocolo, empreendimento ou requerente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {Object.entries(statusConfig).map(([value, config]) => (
                <SelectItem key={value} value={value}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          <span className="font-semibold text-foreground">{filteredLicenses.length}</span> licenças encontradas
        </p>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className={selectedLicense ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {filteredLicenses.length === 0 ? (
              <div className="p-12 text-center">
                <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma licença encontrada
                </h3>
                <p className="text-muted-foreground">
                  Ajuste os filtros ou crie uma nova licença.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredLicenses.map((license) => {
                  const StatusIcon = statusConfig[license.status].icon;
                  return (
                    <div
                      key={license.id}
                      onClick={() => setSelectedLicense(license)}
                      className={cn(
                        "p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                        selectedLicense?.id === license.id && "bg-muted/50"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-lg bg-primary/10">
                          <FileCheck className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground">
                              {license.enterprise_name}
                            </span>
                            <Badge className={statusConfig[license.status].color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig[license.status].label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {typeLabels[license.type]} • {license.enterprise_activity}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {license.applicant_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(license.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-mono">
                            {license.protocol}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Detail */}
        {selectedLicense && (
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <Badge className={statusConfig[selectedLicense.status].color}>
                    {statusConfig[selectedLicense.status].label}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedLicense(null)}>
                    ✕
                  </Button>
                </div>
                <h3 className="font-bold text-foreground text-lg mb-1">
                  {selectedLicense.enterprise_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {typeLabels[selectedLicense.type]}
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-2">
                  {selectedLicense.protocol}
                </p>
              </div>

              {/* Workflow */}
              <div className="px-6 py-4 bg-muted/30 border-b border-border">
                <div className="flex items-center justify-between">
                  {workflowSteps.map((step, index) => {
                    const statusOrder = ["submitted", "documentation", "technical_analysis", "approved"];
                    const currentIndex = statusOrder.indexOf(selectedLicense.status);
                    const stepIndex = statusOrder.indexOf(step.status);
                    const isCompleted = stepIndex <= currentIndex && selectedLicense.status !== "rejected";
                    
                    return (
                      <div key={step.status} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold",
                            isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          )}>
                            {isCompleted ? <CheckCircle className="w-3 h-3" /> : index + 1}
                          </div>
                          <span className="text-[10px] mt-1 text-muted-foreground">{step.label}</span>
                        </div>
                        {index < workflowSteps.length - 1 && (
                          <div className={cn(
                            "flex-1 h-0.5 mx-1 mt-[-12px]",
                            stepIndex < currentIndex ? "bg-primary" : "bg-border"
                          )} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Requerente</p>
                  <p className="text-sm text-foreground">{selectedLicense.applicant_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedLicense.applicant_document}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Atividade</p>
                  <p className="text-sm text-foreground">{selectedLicense.enterprise_activity}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Endereço</p>
                  <p className="text-sm text-foreground">{selectedLicense.enterprise_address}</p>
                </div>
                {selectedLicense.area_size && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Área</p>
                    <p className="text-sm text-foreground">{selectedLicense.area_size} ha</p>
                  </div>
                )}

                {/* Status Update */}
                {!isGuest && (
                  <div className="pt-4 border-t border-border">
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Atualizar Status
                    </label>
                    <Select
                      value={selectedLicense.status}
                      onValueChange={(value) => updateMutation.mutate({ 
                        id: selectedLicense.id, 
                        status: value as LicenseStatus 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([value, config]) => (
                          <SelectItem key={value} value={value}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <GuestActionButton isGuest={isGuest}>
                    <Button variant="outline" size="sm" className="flex-1 gap-1" disabled={isGuest}>
                      <Upload className="w-3 h-3" />
                      Documentos
                    </Button>
                  </GuestActionButton>
                  {selectedLicense.status === "approved" ? (
                    <GuestActionButton isGuest={isGuest}>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1 gap-1"
                        onClick={() => !isGuest && handleGeneratePdf(selectedLicense)}
                        disabled={isGeneratingPdf || isGuest}
                      >
                        {isGeneratingPdf ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Printer className="w-3 h-3" />
                        )}
                        Gerar PDF
                      </Button>
                    </GuestActionButton>
                  ) : (
                    <Button variant="outline" size="sm" className="flex-1 gap-1" disabled>
                      <FileDown className="w-3 h-3" />
                      PDF (Aprovar)
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New License Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileCheck className="w-5 h-5 text-primary" />
              </div>
              Nova Licença Ambiental
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Licença *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {licenseTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Dados do Requerente
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="applicant_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome / Razão Social *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome completo ou razão social" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="applicant_document"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF / CNPJ *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="000.000.000-00" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="applicant_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail *</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="email@exemplo.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="applicant_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="(00) 00000-0000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Dados do Empreendimento
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="enterprise_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Empreendimento *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Fazenda São João" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="area_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área (hectares)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="0.00" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="enterprise_activity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Atividade Principal *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Pecuária extensiva, Agricultura, Indústria..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="enterprise_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço Completo *</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Endereço, município, estado, CEP"
                          className="min-h-[80px] resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="enterprise_coordinates"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coordenadas GPS</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: -15.5989, -56.0949" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição do Projeto</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Descreva brevemente o projeto ou atividade..."
                        className="min-h-[100px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Protocolando...
                    </>
                  ) : (
                    "Protocolar Licença"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

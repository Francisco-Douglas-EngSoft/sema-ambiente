import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Leaf, Search, MapPin, Clock, CheckCircle, AlertTriangle, FileText, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { createComplaint, createComplaintTracking, getComplaintByTrackingCode, uploadComplaintAttachment } from "@/services/complaintService";
import { cn } from "@/lib/utils";
import type { ComplaintType, ComplaintPriority } from "@/services/complaintService";

const complaintSchema = z.object({
  type: z.enum(["desmatamento", "queimada", "poluicao_hidrica", "poluicao_ar", "descarte_irregular", "caca_ilegal", "mineracao_ilegal", "outros"] as const),
  priority: z.enum(["low", "medium", "high"] as const),
  location: z.string().min(5, "Informe a localização com mais detalhes").max(500),
  coordinates: z.string().optional(),
  description: z.string().min(20, "Descrição deve ter no mínimo 20 caracteres").max(2000),
  anonymous: z.boolean().default(true),
  reporter_name: z.string().max(100).optional(),
  reporter_email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  reporter_phone: z.string().max(20).optional(),
});

const trackingSchema = z.object({
  trackingCode: z.string().min(8, "Código deve ter 8 caracteres").max(8),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;
type TrackingFormData = z.infer<typeof trackingSchema>;

const complaintTypes = [
  { value: "desmatamento", label: "Desmatamento Ilegal" },
  { value: "queimada", label: "Queimada" },
  { value: "poluicao_hidrica", label: "Poluição Hídrica" },
  { value: "poluicao_ar", label: "Poluição do Ar" },
  { value: "descarte_irregular", label: "Descarte Irregular de Resíduos" },
  { value: "caca_ilegal", label: "Caça Ilegal" },
  { value: "mineracao_ilegal", label: "Mineração Ilegal" },
  { value: "outros", label: "Outros" },
];

const typeLabels: Record<string, string> = {
  desmatamento: "Desmatamento Ilegal",
  queimada: "Queimada",
  poluicao_hidrica: "Poluição Hídrica",
  poluicao_ar: "Poluição do Ar",
  descarte_irregular: "Descarte Irregular",
  caca_ilegal: "Caça Ilegal",
  mineracao_ilegal: "Mineração Ilegal",
  outros: "Outros",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  under_analysis: "Em Análise",
  in_progress: "Em Andamento",
  resolved: "Resolvido",
  archived: "Arquivado",
};

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/30",
  under_analysis: "bg-accent/10 text-accent border-accent/30",
  in_progress: "bg-primary/10 text-primary border-primary/30",
  resolved: "bg-success/10 text-success border-success/30",
  archived: "bg-muted text-muted-foreground border-border",
};

export const PublicPortal = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [submissionResult, setSubmissionResult] = useState<{ protocol: string; trackingCode: string } | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const complaintForm = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      type: "outros",
      priority: "medium",
      location: "",
      coordinates: "",
      description: "",
      anonymous: true,
      reporter_name: "",
      reporter_email: "",
      reporter_phone: "",
    },
  });

  const trackingForm = useForm<TrackingFormData>({
    resolver: zodResolver(trackingSchema),
    defaultValues: { trackingCode: "" },
  });

  const isAnonymous = complaintForm.watch("anonymous");

  async function handleSubmitComplaint(data: ComplaintFormData) {
    setIsSubmitting(true);
    try {
      const complaint = await createComplaint({
        type: data.type,
        priority: data.priority,
        location: data.location,
        coordinates: data.coordinates || null,
        description: data.description,
        anonymous: data.anonymous,
        reporter_name: data.anonymous ? null : data.reporter_name || null,
        reporter_email: data.anonymous ? null : data.reporter_email || null,
        reporter_phone: data.anonymous ? null : data.reporter_phone || null,
      });
      if (!complaint) throw new Error("Falha ao criar denúncia");

      // Upload attachments
      for (const file of files) {
        await uploadComplaintAttachment(complaint.id, file);
      }

      // Create tracking code
      const tracking = await createComplaintTracking(
        complaint.id,
        data.anonymous ? undefined : data.reporter_email || undefined
      );
      if (!tracking) throw new Error("Falha ao criar código de rastreamento");

      setSubmissionResult({
        protocol: complaint.protocol,
        trackingCode: tracking.tracking_code,
      });

      toast.success("Denúncia registrada com sucesso!");
      complaintForm.reset();
      setFiles([]);
    } catch (error: any) {
      toast.error("Erro ao registrar denúncia", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSearch(data: TrackingFormData) {
    setIsSearching(true);
    setTrackingResult(null);
    try {
      const result = await getComplaintByTrackingCode(data.trackingCode);
      if (result) {
        setTrackingResult(result);
      } else {
        toast.error("Código não encontrado", { description: "Verifique o código e tente novamente." });
      }
    } catch (error: any) {
      toast.error("Erro na busca", { description: error.message });
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Leaf className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">SEMA</h1>
              <p className="text-white/80">Secretaria de Meio Ambiente</p>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Portal do Cidadão</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Registre denúncias ambientais e acompanhe o andamento. Sua participação é fundamental para a preservação do meio ambiente.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 -mt-8">
        <div className="max-w-3xl mx-auto">
          <Tabs defaultValue="report" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="report" className="gap-2">
                <AlertTriangle className="w-4 h-4" />
                Nova Denúncia
              </TabsTrigger>
              <TabsTrigger value="track" className="gap-2">
                <Search className="w-4 h-4" />
                Acompanhar
              </TabsTrigger>
            </TabsList>

            {/* New Complaint Tab */}
            <TabsContent value="report">
              {submissionResult ? (
                <div className="bg-card rounded-xl border border-border p-8 text-center animate-scale-in">
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Denúncia Registrada!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Sua denúncia foi recebida e será analisada pela equipe.
                  </p>

                  <div className="bg-muted/50 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div>
                        <p className="text-sm text-muted-foreground">Protocolo</p>
                        <p className="font-mono font-bold text-foreground">{submissionResult.protocol}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Código de Rastreamento</p>
                        <p className="font-mono font-bold text-primary text-lg">{submissionResult.trackingCode}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    Guarde o código de rastreamento para acompanhar o andamento da sua denúncia.
                  </p>

                  <Button onClick={() => setSubmissionResult(null)} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Fazer Nova Denúncia
                  </Button>
                </div>
              ) : (
                <div className="bg-card rounded-xl border border-border p-6">
                  <Form {...complaintForm}>
                    <form onSubmit={complaintForm.handleSubmit(handleSubmitComplaint)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={complaintForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Ocorrência *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {complaintTypes.map((type) => (
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

                        <FormField
                          control={complaintForm.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Urgência *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Baixa</SelectItem>
                                  <SelectItem value="medium">Média</SelectItem>
                                  <SelectItem value="high">Alta - Urgente</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={complaintForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Localização *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                <Textarea
                                  {...field}
                                  placeholder="Descreva o endereço ou ponto de referência com detalhes (rua, bairro, cidade, pontos de referência)"
                                  className="pl-10 min-h-[80px] resize-none"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={complaintForm.control}
                        name="coordinates"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Coordenadas GPS (opcional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: -15.5989, -56.0949" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={complaintForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição da Ocorrência *</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Descreva detalhadamente o que está acontecendo: o que você observou, há quanto tempo, extensão do problema, etc."
                                className="min-h-[120px] resize-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* File Upload */}
                      <div>
                        <label className="text-sm font-medium text-foreground block mb-2">
                          Anexar Evidências (opcional)
                        </label>
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files) {
                                setFiles(Array.from(e.target.files));
                              }
                            }}
                            className="hidden"
                            id="file-upload"
                          />
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Clique para selecionar fotos
                            </p>
                          </label>
                          {files.length > 0 && (
                            <p className="text-sm text-primary mt-2">
                              {files.length} arquivo(s) selecionado(s)
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Anonymous Toggle */}
                      <FormField
                        control={complaintForm.control}
                        name="anonymous"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="w-4 h-4 rounded border-border"
                                id="anonymous"
                              />
                              <label htmlFor="anonymous" className="text-sm">
                                <span className="font-medium text-foreground">Denúncia Anônima</span>
                                <p className="text-muted-foreground text-xs mt-0.5">
                                  Seus dados não serão armazenados
                                </p>
                              </label>
                            </div>
                          </FormItem>
                        )}
                      />

                      {!isAnonymous && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                          <FormField
                            control={complaintForm.control}
                            name="reporter_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Seu Nome</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Nome completo" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={complaintForm.control}
                            name="reporter_email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>E-mail</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" placeholder="seu@email.com" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={complaintForm.control}
                            name="reporter_phone"
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
                      )}

                      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? "Enviando..." : "Enviar Denúncia"}
                      </Button>
                    </form>
                  </Form>
                </div>
              )}
            </TabsContent>

            {/* Track Tab */}
            <TabsContent value="track">
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Acompanhe sua Denúncia
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Digite o código de rastreamento recebido ao fazer a denúncia
                  </p>
                </div>

                <Form {...trackingForm}>
                  <form onSubmit={trackingForm.handleSubmit(handleSearch)} className="space-y-4">
                    <FormField
                      control={trackingForm.control}
                      name="trackingCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input
                                {...field}
                                placeholder="Ex: ABC12345"
                                className="text-center font-mono text-lg tracking-widest uppercase"
                                maxLength={8}
                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                              />
                              <Button type="submit" disabled={isSearching}>
                                <Search className="w-4 h-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>

                {trackingResult && (
                  <div className="mt-6 p-6 bg-muted/50 rounded-lg animate-fade-in">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Protocolo</p>
                        <p className="font-mono font-bold text-foreground">{trackingResult.protocol}</p>
                      </div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium border",
                        statusColors[trackingResult.status]
                      )}>
                        {statusLabels[trackingResult.status]}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Tipo:</span>
                        <span className="text-foreground">{typeLabels[trackingResult.type]}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Local:</span>
                        <span className="text-foreground">{trackingResult.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Registrada em:</span>
                        <span className="text-foreground">
                          {new Date(trackingResult.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {trackingResult.updated_at && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Última atualização:</span>
                          <span className="text-foreground">
                            {new Date(trackingResult.updated_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Secretaria de Meio Ambiente - Todos os direitos reservados</p>
          <p className="mt-2">
            <a href="/" className="text-primary hover:underline">
              Acesso Colaboradores
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

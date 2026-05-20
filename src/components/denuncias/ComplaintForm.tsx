import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Upload, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const complaintSchema = z.object({
  type: z.string().min(1, "Selecione o tipo de denúncia"),
  priority: z.string().min(1, "Selecione a prioridade"),
  location: z.string().min(3, "Informe a localização").max(200, "Localização muito longa"),
  coordinates: z.string().optional(),
  description: z.string().min(10, "Descrição deve ter no mínimo 10 caracteres").max(2000, "Descrição muito longa"),
  reporterName: z.string().max(100, "Nome muito longo").optional(),
  reporterContact: z.string().max(100, "Contato muito longo").optional(),
  anonymous: z.boolean().default(false),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

interface ComplaintFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ComplaintFormData) => void;
}

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

const priorityLevels = [
  { value: "low", label: "Baixa", color: "text-success" },
  { value: "medium", label: "Média", color: "text-warning" },
  { value: "high", label: "Alta", color: "text-destructive" },
];

export const ComplaintForm = ({ open, onOpenChange, onSubmit }: ComplaintFormProps) => {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      type: "",
      priority: "",
      location: "",
      coordinates: "",
      description: "",
      reporterName: "",
      reporterContact: "",
      anonymous: false,
    },
  });

  const handleSubmit = async (data: ComplaintFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
      onSubmit({ ...data, anonymous: isAnonymous });
      toast.success("Denúncia registrada com sucesso!", {
        description: "Você receberá atualizações sobre o andamento.",
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao registrar denúncia", {
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            Nova Denúncia Ambiental
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Denúncia *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
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
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <span className={level.color}>{level.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localização *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        {...field} 
                        placeholder="Ex: Rodovia MT-358, Km 45, próximo ao Rio Cuiabá"
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coordinates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coordenadas GPS (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Ex: -15.5989, -56.0949"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Detalhada *</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descreva a ocorrência com o máximo de detalhes possível: o que está acontecendo, há quanto tempo, extensão do dano, etc."
                      className="min-h-[120px] resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload Placeholder */}
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Arraste imagens ou clique para anexar
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG até 10MB
              </p>
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <label htmlFor="anonymous" className="text-sm">
                <span className="font-medium">Denúncia Anônima</span>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Seus dados de contato não serão registrados
                </p>
              </label>
            </div>

            {!isAnonymous && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="reporterName"
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
                  control={form.control}
                  name="reporterContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contato</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Telefone ou e-mail" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar Denúncia"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

import { 
  MapPin, 
  Clock, 
  User, 
  Calendar,
  FileText,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flame,
  Droplets,
  ArrowLeft,
  Send,
  Paperclip,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Complaint, ComplaintStatus } from "@/types/complaint";
import { useState } from "react";
import { toast } from "sonner";

interface ComplaintDetailProps {
  complaint: Complaint;
  onBack: () => void;
  onStatusChange: (id: string, status: ComplaintStatus) => void;
}

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

const statusConfig: Record<ComplaintStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pendente", color: "bg-warning/10 text-warning border-warning/30", icon: Clock },
  under_analysis: { label: "Em Análise", color: "bg-accent/10 text-accent border-accent/30", icon: FileText },
  in_progress: { label: "Em Andamento", color: "bg-primary/10 text-primary border-primary/30", icon: User },
  resolved: { label: "Resolvido", color: "bg-success/10 text-success border-success/30", icon: CheckCircle },
  archived: { label: "Arquivado", color: "bg-muted text-muted-foreground border-border", icon: XCircle },
};

const priorityLabels: Record<string, { label: string; color: string }> = {
  low: { label: "Baixa", color: "text-success" },
  medium: { label: "Média", color: "text-warning" },
  high: { label: "Alta", color: "text-destructive" },
};

const workflowSteps = [
  { status: "pending", label: "Registrada" },
  { status: "under_analysis", label: "Análise" },
  { status: "in_progress", label: "Fiscalização" },
  { status: "resolved", label: "Concluída" },
];

export const ComplaintDetail = ({ complaint, onBack, onStatusChange }: ComplaintDetailProps) => {
  const [newComment, setNewComment] = useState("");
  const currentStepIndex = workflowSteps.findIndex(s => s.status === complaint.status);
  const StatusIcon = statusConfig[complaint.status].icon;

  const handleAddComment = () => {
    if (newComment.trim()) {
      toast.success("Comentário adicionado");
      setNewComment("");
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Exportar PDF</DropdownMenuItem>
              <DropdownMenuItem>Imprimir</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Arquivar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-destructive/10">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-foreground">
                {typeLabels[complaint.type]}
              </h2>
              <span className={cn(
                "badge-status border",
                statusConfig[complaint.status].color
              )}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig[complaint.status].label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-mono">{complaint.id}</span>
              <span className={priorityLabels[complaint.priority].color}>
                Prioridade {priorityLabels[complaint.priority].label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Progress */}
      <div className="px-6 py-4 bg-muted/30 border-b border-border">
        <div className="flex items-center justify-between">
          {workflowSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div key={step.status} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    isCompleted 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground",
                    isCurrent && "ring-4 ring-primary/20"
                  )}>
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className={cn(
                    "text-xs mt-1.5 font-medium",
                    isCompleted ? "text-primary" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </span>
                </div>
                {index < workflowSteps.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-2 mt-[-12px]",
                    index < currentStepIndex ? "bg-primary" : "bg-border"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Localização
            </h3>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-foreground">{complaint.location}</p>
              {complaint.coordinates && (
                <p className="text-sm text-muted-foreground mt-1">
                  GPS: {complaint.coordinates}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Informações
            </h3>
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Registrada em:</span>
                <span className="text-foreground">{complaint.createdAt}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Última atualização:</span>
                <span className="text-foreground">{complaint.updatedAt || complaint.createdAt}</span>
              </div>
              {complaint.assignedTo && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Responsável:</span>
                  <span className="text-foreground">{complaint.assignedTo}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Descrição
          </h3>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-foreground whitespace-pre-wrap">{complaint.description}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Atualizar Status
            </label>
            <Select
              value={complaint.status}
              onValueChange={(value) => onStatusChange(complaint.id, value as ComplaintStatus)}
            >
              <SelectTrigger className="w-full md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="under_analysis">Em Análise</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="resolved">Resolvido</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="gap-2">
            <User className="w-4 h-4" />
            Atribuir
          </Button>
        </div>

        {/* Comments */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Histórico e Comentários
          </h3>

          {/* Timeline */}
          <div className="space-y-4">
            {complaint.timeline?.map((item, index) => (
              <div key={index} className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {item.user.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-foreground">{item.user}</span>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.action}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add Comment */}
          <div className="flex gap-3 mt-4">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                AM
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Adicionar comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-between">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Paperclip className="w-4 h-4" />
                  Anexar
                </Button>
                <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Users,
  GraduationCap,
  Target,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  User,
  Mail,
  Phone,
  Award,
  TrendingUp,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  getTeamMembers,
  getTrainings,
  getPerformanceGoals,
  createTraining,
  createPerformanceGoal,
  type TeamMember,
  type Training,
  type PerformanceGoal,
} from "@/services/teamService";
import { demoTeamMembers, demoTrainings, demoGoals } from "@/data/demoData";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const trainingSchema = z.object({
  title: z.string().min(3, "Título obrigatório"),
  description: z.string().optional(),
  type: z.enum(["course", "workshop", "certification", "webinar"]),
  instructor: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  duration_hours: z.string().optional(),
  max_participants: z.string().optional(),
});

const goalSchema = z.object({
  user_id: z.string().min(1, "Selecione um colaborador"),
  title: z.string().min(3, "Título obrigatório"),
  description: z.string().optional(),
  target_value: z.string().optional(),
  unit: z.string().optional(),
  category: z.enum(["productivity", "quality", "training", "attendance", "other"]),
  period_start: z.string().min(1, "Data inicial obrigatória"),
  period_end: z.string().min(1, "Data final obrigatória"),
});

type TrainingFormData = z.infer<typeof trainingSchema>;
type GoalFormData = z.infer<typeof goalSchema>;

const typeLabels: Record<string, string> = {
  course: "Curso",
  workshop: "Workshop",
  certification: "Certificação",
  webinar: "Webinar",
};

const categoryLabels: Record<string, string> = {
  productivity: "Produtividade",
  quality: "Qualidade",
  training: "Capacitação",
  attendance: "Assiduidade",
  other: "Outros",
};

const statusColors: Record<string, string> = {
  scheduled: "bg-accent/10 text-accent",
  in_progress: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  cancelled: "bg-muted text-muted-foreground",
  active: "bg-primary/10 text-primary",
};

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  analyst: "Analista",
  inspector: "Fiscal",
  viewer: "Visualizador",
};

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

export const Equipe = () => {
  const { user, isAdmin, isGuest } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("members");
  const [searchTerm, setSearchTerm] = useState("");
  const [isTrainingFormOpen, setIsTrainingFormOpen] = useState(false);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const trainingForm = useForm<TrainingFormData>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "course",
      instructor: "",
      start_date: "",
      end_date: "",
      duration_hours: "",
      max_participants: "",
    },
  });

  const goalForm = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      user_id: "",
      title: "",
      description: "",
      target_value: "",
      unit: "",
      category: "productivity",
      period_start: "",
      period_end: "",
    },
  });

  // Use demo data for guest mode
  const { data: realMembers = [], isLoading: membersLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: getTeamMembers,
    enabled: !isGuest,
  });

  const { data: realTrainings = [], isLoading: trainingsLoading } = useQuery({
    queryKey: ["trainings"],
    queryFn: getTrainings,
    enabled: !isGuest,
  });

  const { data: realGoals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ["performance-goals"],
    queryFn: () => getPerformanceGoals(),
    enabled: !isGuest,
  });

  const members = isGuest ? (demoTeamMembers as unknown as TeamMember[]) : realMembers;
  const trainings = isGuest ? (demoTrainings as unknown as Training[]) : realTrainings;
  const goals = isGuest ? (demoGoals as unknown as PerformanceGoal[]) : realGoals;

  const createTrainingMutation = useMutation({
    mutationFn: (data: TrainingFormData) =>
      createTraining({
        title: data.title,
        description: data.description || null,
        type: data.type,
        instructor: data.instructor || null,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        duration_hours: data.duration_hours ? parseInt(data.duration_hours) : null,
        max_participants: data.max_participants ? parseInt(data.max_participants) : null,
        status: "scheduled",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      toast.success("Treinamento criado!");
      setIsTrainingFormOpen(false);
      trainingForm.reset();
    },
    onError: (error: any) => {
      toast.error("Erro ao criar treinamento", { description: error.message });
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: (data: GoalFormData) =>
      createPerformanceGoal({
        user_id: data.user_id,
        title: data.title,
        description: data.description || null,
        target_value: data.target_value ? parseFloat(data.target_value) : null,
        current_value: 0,
        unit: data.unit || null,
        category: data.category,
        period_start: data.period_start,
        period_end: data.period_end,
        status: "active",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-goals"] });
      toast.success("Meta criada!");
      setIsGoalFormOpen(false);
      goalForm.reset();
    },
    onError: (error: any) => {
      toast.error("Erro ao criar meta", { description: error.message });
    },
  });

  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members;
    const search = searchTerm.toLowerCase();
    return members.filter(
      (m) =>
        m.full_name.toLowerCase().includes(search) ||
        m.email.toLowerCase().includes(search) ||
        m.department?.toLowerCase().includes(search)
    );
  }, [members, searchTerm]);

  const isLoading = membersLoading || trainingsLoading || goalsLoading;

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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="members" className="gap-2">
              <Users className="w-4 h-4" />
              Colaboradores
            </TabsTrigger>
            <TabsTrigger value="trainings" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              Treinamentos
            </TabsTrigger>
            <TabsTrigger value="goals" className="gap-2">
              <Target className="w-4 h-4" />
              Metas
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {(isAdmin || isGuest) && (
          <div className="flex gap-2">
            {activeTab === "trainings" && (
              <GuestActionButton isGuest={isGuest}>
                <Button 
                  onClick={() => !isGuest && setIsTrainingFormOpen(true)} 
                  className="gap-2"
                  disabled={isGuest}
                >
                  <Plus className="w-4 h-4" />
                  Novo Treinamento
                </Button>
              </GuestActionButton>
            )}
            {activeTab === "goals" && (
              <GuestActionButton isGuest={isGuest}>
                <Button 
                  onClick={() => !isGuest && setIsGoalFormOpen(true)} 
                  className="gap-2"
                  disabled={isGuest}
                >
                  <Plus className="w-4 h-4" />
                  Nova Meta
                </Button>
              </GuestActionButton>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      {activeTab === "members" && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar colaborador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Members Tab */}
      {activeTab === "members" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const initials = member.full_name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {member.full_name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {member.position || "Colaborador"}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.roles.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {roleLabels[role] || role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  {member.department && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      <span>{member.department}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trainings Tab */}
      {activeTab === "trainings" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {trainings.length === 0 ? (
            <div className="col-span-full bg-card rounded-xl border border-border p-12 text-center">
              <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum treinamento cadastrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Crie treinamentos para capacitar a equipe.
              </p>
              {(isAdmin || isGuest) && (
                <GuestActionButton isGuest={isGuest}>
                  <Button onClick={() => !isGuest && setIsTrainingFormOpen(true)} disabled={isGuest}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Treinamento
                  </Button>
                </GuestActionButton>
              )}
            </div>
          ) : (
            trainings.map((training) => (
              <div
                key={training.id}
                className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10">
                      <GraduationCap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{training.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {typeLabels[training.type]}
                      </p>
                    </div>
                  </div>
                  <Badge className={statusColors[training.status]}>
                    {training.status === "scheduled" && "Agendado"}
                    {training.status === "in_progress" && "Em Andamento"}
                    {training.status === "completed" && "Concluído"}
                    {training.status === "cancelled" && "Cancelado"}
                  </Badge>
                </div>

                {training.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {training.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {training.instructor && (
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {training.instructor}
                    </div>
                  )}
                  {training.start_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(training.start_date).toLocaleDateString("pt-BR")}
                    </div>
                  )}
                  {training.duration_hours && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {training.duration_hours}h
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === "goals" && (
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma meta cadastrada
              </h3>
              <p className="text-muted-foreground mb-4">
                Defina metas para acompanhar o desempenho da equipe.
              </p>
              {(isAdmin || isGuest) && (
                <GuestActionButton isGuest={isGuest}>
                  <Button onClick={() => !isGuest && setIsGoalFormOpen(true)} disabled={isGuest}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Meta
                  </Button>
                </GuestActionButton>
              )}
            </div>
          ) : (
            goals.map((goal) => {
              const progress = goal.target_value
                ? Math.min(100, ((goal.current_value || 0) / goal.target_value) * 100)
                : 0;
              const member = members.find((m) => m.user_id === goal.user_id);

              return (
                <div
                  key={goal.id}
                  className="bg-card rounded-xl border border-border p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-accent/10">
                        <Target className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {member?.full_name || "Colaborador"} •{" "}
                          {categoryLabels[goal.category]}
                        </p>
                      </div>
                    </div>
                    <Badge className={statusColors[goal.status]}>
                      {goal.status === "active" ? "Ativa" : "Concluída"}
                    </Badge>
                  </div>

                  {goal.target_value && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium text-foreground">
                          {goal.current_value || 0} / {goal.target_value} {goal.unit}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                    <span>
                      Período: {new Date(goal.period_start).toLocaleDateString("pt-BR")} -{" "}
                      {new Date(goal.period_end).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Member Detail Modal */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Colaborador</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                    {selectedMember.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-foreground text-lg">
                    {selectedMember.full_name}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedMember.position || "Colaborador"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{selectedMember.email}</span>
                </div>
                {selectedMember.phone && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{selectedMember.phone}</span>
                  </div>
                )}
                {selectedMember.department && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{selectedMember.department}</span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">Permissões</p>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.roles.map((role) => (
                    <Badge key={role} className="bg-primary/10 text-primary">
                      {roleLabels[role] || role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Training Form Modal */}
      <Dialog open={isTrainingFormOpen} onOpenChange={setIsTrainingFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Novo Treinamento
            </DialogTitle>
          </DialogHeader>
          <Form {...trainingForm}>
            <form
              onSubmit={trainingForm.handleSubmit((data) =>
                createTrainingMutation.mutate(data)
              )}
              className="space-y-4"
            >
              <FormField
                control={trainingForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome do treinamento" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={trainingForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="course">Curso</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="certification">Certificação</SelectItem>
                        <SelectItem value="webinar">Webinar</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={trainingForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Descrição do treinamento" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={trainingForm.control}
                  name="instructor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instrutor</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={trainingForm.control}
                  name="duration_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração (horas)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="8" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={trainingForm.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Início</FormLabel>
                      <FormControl>
                        <Input {...field} type="datetime-local" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={trainingForm.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Fim</FormLabel>
                      <FormControl>
                        <Input {...field} type="datetime-local" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTrainingFormOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createTrainingMutation.isPending}>
                  {createTrainingMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Criar Treinamento
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Goal Form Modal */}
      <Dialog open={isGoalFormOpen} onOpenChange={setIsGoalFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              Nova Meta
            </DialogTitle>
          </DialogHeader>
          <Form {...goalForm}>
            <form
              onSubmit={goalForm.handleSubmit((data) => createGoalMutation.mutate(data))}
              className="space-y-4"
            >
              <FormField
                control={goalForm.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Colaborador *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {members.map((m) => (
                          <SelectItem key={m.user_id} value={m.user_id}>
                            {m.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={goalForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Meta *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Processar 50 licenças" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={goalForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="productivity">Produtividade</SelectItem>
                        <SelectItem value="quality">Qualidade</SelectItem>
                        <SelectItem value="training">Capacitação</SelectItem>
                        <SelectItem value="attendance">Assiduidade</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={goalForm.control}
                  name="target_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Alvo</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={goalForm.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidade</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="licenças, %" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={goalForm.control}
                  name="period_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Início *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={goalForm.control}
                  name="period_end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fim *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsGoalFormOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createGoalMutation.isPending}>
                  {createGoalMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Criar Meta
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

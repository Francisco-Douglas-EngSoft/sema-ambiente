import { useState, useMemo } from "react";
import { Plus, List, Map, Download, RefreshCw, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComplaintForm } from "@/components/denuncias/ComplaintForm";
import { ComplaintFilters, ComplaintFiltersState } from "@/components/denuncias/ComplaintFilters";
import { ComplaintList } from "@/components/denuncias/ComplaintList";
import { ComplaintDetail } from "@/components/denuncias/ComplaintDetail";
import { ComplaintMap } from "@/components/denuncias/ComplaintMap";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getComplaints, 
  createComplaint, 
  updateComplaint, 
  addComplaintTimeline,
  uploadComplaintAttachment,
  type ComplaintRow, 
  type ComplaintStatus 
} from "@/services/complaintService";
import { demoComplaints } from "@/data/demoData";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Denuncias = () => {
  const { user, profile, isStaff, isGuest } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("list");
  const [filters, setFilters] = useState<ComplaintFiltersState>({
    search: "",
    type: "all",
    status: "all",
    priority: "all",
    dateRange: "all",
  });

  const { data: complaints = [], isLoading, refetch } = useQuery({
    queryKey: ["complaints"],
    queryFn: getComplaints,
    enabled: isStaff && !isGuest,
  });

  // Use demo data for guest mode
  const displayComplaints = isGuest ? demoComplaints : complaints;

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const complaint = await createComplaint(data);
      if (!complaint) throw new Error("Falha ao criar denúncia");
      
      // Upload attachments if any
      if (data.files?.length > 0) {
        for (const file of data.files) {
          await uploadComplaintAttachment(complaint.id, file, user?.id);
        }
      }
      
      // Add timeline entry
      await addComplaintTimeline(
        complaint.id,
        user?.id || null,
        profile?.full_name || "Sistema",
        "Denúncia registrada"
      );
      
      return complaint;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Denúncia registrada com sucesso!");
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error("Erro ao registrar denúncia", { description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ComplaintStatus }) => {
      const updated = await updateComplaint(id, { status });
      await addComplaintTimeline(
        id,
        user?.id || null,
        profile?.full_name || "Sistema",
        `Status alterado para "${status}"`
      );
      return updated;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      setSelectedComplaint(data);
      toast.success("Status atualizado");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar status", { description: error.message });
    },
  });

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return displayComplaints.filter((complaint) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          complaint.protocol.toLowerCase().includes(searchLower) ||
          complaint.location.toLowerCase().includes(searchLower) ||
          complaint.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.type !== "all" && complaint.type !== filters.type) return false;
      if (filters.status !== "all" && complaint.status !== filters.status) return false;
      if (filters.priority !== "all" && complaint.priority !== filters.priority) return false;

      return true;
    });
  }, [displayComplaints, filters]);

  const handleNewComplaint = (data: any) => {
    if (isGuest) {
      toast.error("Modo Visitante", { description: "Ação não permitida no modo de visualização." });
      return;
    }
    createMutation.mutate({
      type: data.type,
      priority: data.priority,
      location: data.location,
      coordinates: data.coordinates || null,
      description: data.description,
      anonymous: data.anonymous,
      reporter_name: data.anonymous ? null : data.reporterName || null,
      reporter_email: data.anonymous ? null : data.reporterContact || null,
      files: data.files || [],
    });
  };

  const handleStatusChange = (id: string, newStatus: ComplaintStatus) => {
    if (isGuest) {
      toast.error("Modo Visitante", { description: "Ação não permitida no modo de visualização." });
      return;
    }
    updateMutation.mutate({ id, status: newStatus });
  };

  // Transform data for components
  const transformedComplaints = filteredComplaints.map((c) => ({
    id: c.id,
    protocol: c.protocol,
    type: c.type,
    priority: c.priority,
    status: c.status,
    location: c.location,
    coordinates: c.coordinates,
    description: c.description,
    createdAt: new Date(c.created_at).toLocaleString("pt-BR"),
    updatedAt: c.updated_at ? new Date(c.updated_at).toLocaleString("pt-BR") : undefined,
    assignedTo: (c as any).assigned_profile?.full_name,
    anonymous: c.anonymous,
    timeline: [],
  }));

  const selectedTransformed = selectedComplaint ? {
    id: selectedComplaint.id,
    protocol: selectedComplaint.protocol,
    type: selectedComplaint.type,
    priority: selectedComplaint.priority,
    status: selectedComplaint.status,
    location: selectedComplaint.location,
    coordinates: selectedComplaint.coordinates,
    description: selectedComplaint.description,
    createdAt: new Date(selectedComplaint.created_at).toLocaleString("pt-BR"),
    updatedAt: selectedComplaint.updated_at ? new Date(selectedComplaint.updated_at).toLocaleString("pt-BR") : undefined,
    assignedTo: (selectedComplaint as any).assigned_profile?.full_name,
    anonymous: selectedComplaint.anonymous,
    timeline: [],
  } : null;

  if (isLoading && !isGuest) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const GuestActionButton = ({ children, ...props }: any) => {
    if (isGuest) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button {...props} disabled className="gap-2 opacity-60">
              <Lock className="w-3.5 h-3.5" />
              {children}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ação não disponível no modo visitante</p>
          </TooltipContent>
        </Tooltip>
      );
    }
    return <Button {...props}>{children}</Button>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <GuestActionButton onClick={() => !isGuest && setIsFormOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Denúncia
          </GuestActionButton>
          <GuestActionButton variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </GuestActionButton>
          <Button variant="ghost" size="icon" onClick={() => !isGuest && refetch()} disabled={isGuest}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <List className="w-4 h-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <Map className="w-4 h-4" />
              Mapa
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filters */}
      <ComplaintFilters
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={filteredComplaints.length}
      />

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={selectedComplaint ? "lg:col-span-2" : "lg:col-span-3"}>
          {activeTab === "list" ? (
            <ComplaintList
              complaints={transformedComplaints as any}
              onSelectComplaint={(c) => {
                const original = complaints.find((x) => x.id === c.id);
                setSelectedComplaint(original || null);
              }}
              selectedId={selectedComplaint?.id}
            />
          ) : (
            <ComplaintMap
              complaints={transformedComplaints as any}
              onSelectComplaint={(c) => {
                const original = complaints.find((x) => x.id === c.id);
                setSelectedComplaint(original || null);
              }}
              selectedId={selectedComplaint?.id}
            />
          )}
        </div>

        {selectedTransformed && (
          <div className="lg:col-span-1">
            <ComplaintDetail
              complaint={selectedTransformed as any}
              onBack={() => setSelectedComplaint(null)}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}
      </div>

      <ComplaintForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleNewComplaint}
      />
    </div>
  );
};

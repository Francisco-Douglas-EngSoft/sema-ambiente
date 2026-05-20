import { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  Video,
  FileCheck,
  AlertTriangle,
  TreePine,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime: string;
  type: "inspection" | "meeting" | "training" | "hearing" | "deadline";
  location: string;
  participants: string[];
  description: string;
  isOnline?: boolean;
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Vistoria - Licença LP-2026-00012",
    date: "2026-02-12",
    time: "08:00",
    endTime: "12:00",
    type: "inspection",
    location: "Fazenda São José, Km 42",
    participants: ["Carlos Mendes", "Ana Silva"],
    description: "Vistoria técnica para análise de licença de operação.",
  },
  {
    id: "2",
    title: "Reunião de Equipe Semanal",
    date: "2026-02-12",
    time: "14:00",
    endTime: "15:30",
    type: "meeting",
    location: "Sala de Reuniões 3",
    participants: ["Toda a equipe"],
    description: "Alinhamento semanal sobre denúncias e licenças em andamento.",
    isOnline: true,
  },
  {
    id: "3",
    title: "Capacitação em Geoprocessamento",
    date: "2026-02-13",
    time: "09:00",
    endTime: "17:00",
    type: "training",
    location: "Auditório Principal",
    participants: ["Pedro Santos", "Mariana Lima", "Julia Rocha"],
    description: "Treinamento prático em ferramentas de geoprocessamento ambiental.",
  },
  {
    id: "4",
    title: "Audiência Pública - Projeto Mineração",
    date: "2026-02-14",
    time: "19:00",
    endTime: "21:00",
    type: "hearing",
    location: "Câmara Municipal",
    participants: ["Diretor", "Analistas", "Comunidade"],
    description: "Apresentação e discussão do EIA/RIMA do projeto de mineração.",
  },
  {
    id: "5",
    title: "Prazo Final - Relatório Trimestral",
    date: "2026-02-15",
    time: "23:59",
    endTime: "23:59",
    type: "deadline",
    location: "",
    participants: ["Fernanda Oliveira"],
    description: "Entrega do relatório trimestral de atividades ao Conselho.",
  },
  {
    id: "6",
    title: "Vistoria de Denúncia DEN-2026-00045",
    date: "2026-02-17",
    time: "07:30",
    endTime: "11:00",
    type: "inspection",
    location: "Rio Taquari - Ponto 7",
    participants: ["Ricardo Alves", "Beatriz Nunes"],
    description: "Verificação de denúncia de poluição hídrica no Rio Taquari.",
  },
];

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  inspection: { label: "Vistoria", icon: AlertTriangle, color: "bg-orange-500" },
  meeting: { label: "Reunião", icon: Users, color: "bg-blue-500" },
  training: { label: "Capacitação", icon: TreePine, color: "bg-green-500" },
  hearing: { label: "Audiência", icon: FileCheck, color: "bg-purple-500" },
  deadline: { label: "Prazo", icon: Clock, color: "bg-red-500" },
};

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const Agenda = () => {
  const [currentDate] = useState(new Date(2026, 1, 12)); // Feb 12, 2026
  const [selectedDate, setSelectedDate] = useState("2026-02-12");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const eventsForDate = mockEvents.filter((e) => e.date === selectedDate);
  const eventDates = new Set(mockEvents.map((e) => e.date));

  const formatDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {months[month]} {year}
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (day === null)
                  return <div key={`empty-${i}`} className="h-9" />;
                const dateStr = formatDateStr(day);
                const hasEvent = eventDates.has(dateStr);
                const isSelected = dateStr === selectedDate;
                const isToday = day === 12;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-9 rounded-md text-sm relative transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-bold"
                        : isToday
                        ? "bg-accent/20 font-semibold"
                        : "hover:bg-muted"
                    }`}
                  >
                    {day}
                    {hasEvent && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Upcoming summary */}
            <div className="mt-4 pt-4 border-t space-y-2">
              <h4 className="text-sm font-medium">Próximos eventos</h4>
              {mockEvents.slice(0, 3).map((ev) => {
                const cfg = typeConfig[ev.type];
                return (
                  <div key={ev.id} className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${cfg.color}`} />
                    <span className="truncate flex-1">{ev.title}</span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(ev.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h3>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Novo Evento
            </Button>
          </div>

          {eventsForDate.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum evento nesta data.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {eventsForDate.map((ev) => {
                const cfg = typeConfig[ev.type];
                const Icon = cfg.icon;
                return (
                  <Card key={ev.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-1 min-w-[60px]">
                          <span className="text-lg font-bold">{ev.time}</span>
                          <span className="text-xs text-muted-foreground">{ev.endTime}</span>
                        </div>

                        <div className={`w-1 rounded-full ${cfg.color}`} />

                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{ev.title}</h4>
                              <p className="text-sm text-muted-foreground">{ev.description}</p>
                            </div>
                            <Badge variant="outline" className="gap-1 text-xs">
                              <Icon className="w-3 h-3" />
                              {cfg.label}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            {ev.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {ev.location}
                              </span>
                            )}
                            {ev.isOnline && (
                              <span className="flex items-center gap-1">
                                <Video className="w-3.5 h-3.5" />
                                Online
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {ev.participants.join(", ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

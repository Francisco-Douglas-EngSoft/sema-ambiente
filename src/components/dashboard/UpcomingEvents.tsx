import { Calendar, MapPin, Users, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: "meeting" | "inspection" | "campaign" | "training";
  participants?: number;
}

const events: Event[] = [
  {
    id: "1",
    title: "Reunião de Fiscalização",
    date: "Hoje",
    time: "14:00",
    location: "Sala de Reuniões A",
    type: "meeting",
    participants: 8,
  },
  {
    id: "2",
    title: "Vistoria - Fazenda São João",
    date: "Amanhã",
    time: "09:00",
    location: "Zona Rural, MT-358",
    type: "inspection",
  },
  {
    id: "3",
    title: "Campanha Dia da Árvore",
    date: "15 Jan",
    time: "08:00",
    location: "Praça Central",
    type: "campaign",
    participants: 50,
  },
  {
    id: "4",
    title: "Treinamento GIS",
    date: "18 Jan",
    time: "14:00",
    location: "Auditório Principal",
    type: "training",
    participants: 15,
  },
];

const typeColors = {
  meeting: "bg-accent/10 border-accent/30 text-accent",
  inspection: "bg-warning/10 border-warning/30 text-warning",
  campaign: "bg-success/10 border-success/30 text-success",
  training: "bg-primary/10 border-primary/30 text-primary",
};

const typeLabels = {
  meeting: "Reunião",
  inspection: "Vistoria",
  campaign: "Campanha",
  training: "Treinamento",
};

export const UpcomingEvents = () => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm animate-slide-up">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Calendar className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Próximos Eventos</h3>
              <p className="text-sm text-muted-foreground">Agenda da semana</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-primary">
            Ver agenda
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      <div className="divide-y divide-border">
        {events.map((event) => (
          <div 
            key={event.id}
            className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="text-center min-w-[48px]">
                <p className="text-sm font-bold text-primary">{event.date}</p>
                <p className="text-xs text-muted-foreground">{event.time}</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-medium text-foreground truncate">{event.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[event.type]}`}>
                    {typeLabels[event.type]}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {event.location}
                  </span>
                  {event.participants && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {event.participants} participantes
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

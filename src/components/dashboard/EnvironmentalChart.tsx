import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

const data = [
  { month: "Jan", denuncias: 45, licencas: 32, fiscalizacoes: 28 },
  { month: "Fev", denuncias: 52, licencas: 45, fiscalizacoes: 35 },
  { month: "Mar", denuncias: 48, licencas: 38, fiscalizacoes: 42 },
  { month: "Abr", denuncias: 61, licencas: 52, fiscalizacoes: 38 },
  { month: "Mai", denuncias: 55, licencas: 48, fiscalizacoes: 45 },
  { month: "Jun", denuncias: 67, licencas: 55, fiscalizacoes: 52 },
  { month: "Jul", denuncias: 72, licencas: 62, fiscalizacoes: 48 },
];

export const EnvironmentalChart = () => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Atividades Ambientais</h3>
            <p className="text-sm text-muted-foreground">Evolução mensal de 2024</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Denúncias</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Licenças</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-muted-foreground">Fiscalizações</span>
          </div>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDenuncias" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLicencas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(152, 45%, 28%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(152, 45%, 28%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorFiscalizacoes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(198, 65%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(198, 65%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(145, 20%, 88%)" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(150, 15%, 45%)', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(150, 15%, 45%)', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(145, 20%, 88%)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Area 
              type="monotone" 
              dataKey="denuncias" 
              stroke="hsl(0, 72%, 51%)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorDenuncias)" 
            />
            <Area 
              type="monotone" 
              dataKey="licencas" 
              stroke="hsl(152, 45%, 28%)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorLicencas)" 
            />
            <Area 
              type="monotone" 
              dataKey="fiscalizacoes" 
              stroke="hsl(198, 65%, 45%)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorFiscalizacoes)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

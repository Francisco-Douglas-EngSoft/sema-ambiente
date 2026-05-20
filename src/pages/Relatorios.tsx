import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  FileText, 
  FileSpreadsheet,
  Calendar,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { demoComplaints, demoLicenses } from "@/data/demoData";

// Demo data for charts
const complaintsMonthlyData = [
  { month: "Jan", denuncias: 45, resolvidas: 32 },
  { month: "Fev", denuncias: 52, resolvidas: 41 },
  { month: "Mar", denuncias: 38, resolvidas: 35 },
  { month: "Abr", denuncias: 65, resolvidas: 48 },
  { month: "Mai", denuncias: 48, resolvidas: 42 },
  { month: "Jun", denuncias: 55, resolvidas: 50 },
  { month: "Jul", denuncias: 42, resolvidas: 38 },
  { month: "Ago", denuncias: 58, resolvidas: 45 },
  { month: "Set", denuncias: 47, resolvidas: 40 },
  { month: "Out", denuncias: 63, resolvidas: 52 },
  { month: "Nov", denuncias: 51, resolvidas: 46 },
  { month: "Dez", denuncias: 44, resolvidas: 39 },
];

const complaintsByTypeData = [
  { name: "Desmatamento", value: 35, color: "hsl(var(--destructive))" },
  { name: "Queimada", value: 25, color: "hsl(var(--warning))" },
  { name: "Poluição Hídrica", value: 20, color: "hsl(var(--primary))" },
  { name: "Descarte Irregular", value: 12, color: "hsl(var(--accent))" },
  { name: "Outros", value: 8, color: "hsl(var(--muted-foreground))" },
];

const licensesByStatusData = [
  { name: "Aprovadas", value: 45, color: "hsl(var(--success))" },
  { name: "Em Análise", value: 28, color: "hsl(var(--accent))" },
  { name: "Pendentes", value: 15, color: "hsl(var(--warning))" },
  { name: "Negadas", value: 12, color: "hsl(var(--destructive))" },
];

const licensesMonthlyData = [
  { month: "Jan", solicitadas: 25, aprovadas: 18, negadas: 3 },
  { month: "Fev", solicitadas: 32, aprovadas: 24, negadas: 4 },
  { month: "Mar", solicitadas: 28, aprovadas: 21, negadas: 2 },
  { month: "Abr", solicitadas: 35, aprovadas: 28, negadas: 5 },
  { month: "Mai", solicitadas: 30, aprovadas: 23, negadas: 3 },
  { month: "Jun", solicitadas: 38, aprovadas: 30, negadas: 4 },
  { month: "Jul", solicitadas: 33, aprovadas: 26, negadas: 3 },
  { month: "Ago", solicitadas: 40, aprovadas: 32, negadas: 5 },
  { month: "Set", solicitadas: 36, aprovadas: 28, negadas: 4 },
  { month: "Out", solicitadas: 42, aprovadas: 35, negadas: 3 },
  { month: "Nov", solicitadas: 38, aprovadas: 30, negadas: 4 },
  { month: "Dez", solicitadas: 35, aprovadas: 28, negadas: 3 },
];

const performanceTrendData = [
  { month: "Jan", eficiencia: 72 },
  { month: "Fev", eficiencia: 78 },
  { month: "Mar", eficiencia: 82 },
  { month: "Abr", eficiencia: 75 },
  { month: "Mai", eficiencia: 85 },
  { month: "Jun", eficiencia: 88 },
  { month: "Jul", eficiencia: 90 },
  { month: "Ago", eficiencia: 85 },
  { month: "Set", eficiencia: 87 },
  { month: "Out", eficiencia: 92 },
  { month: "Nov", eficiencia: 89 },
  { month: "Dez", eficiencia: 91 },
];

interface GuestActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const GuestActionButton = ({ children, onClick, disabled, className, variant, size }: GuestActionButtonProps) => {
  const { isGuest } = useAuth();
  
  if (isGuest) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block">
            <Button 
              variant={variant} 
              size={size} 
              className={className} 
              disabled
            >
              {children}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Ação não disponível no modo visitante</p>
        </TooltipContent>
      </Tooltip>
    );
  }
  
  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className} 
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

export const Relatorios = () => {
  const { isGuest } = useAuth();
  const [period, setPeriod] = useState("year");
  const [reportType, setReportType] = useState("all");

  const exportToPDF = (reportName: string) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(34, 139, 34);
    doc.text("SEMA - Relatório Ambiental", 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Relatório: ${reportName}`, 20, 30);
    doc.text(`Data de geração: ${new Date().toLocaleDateString("pt-BR")}`, 20, 37);
    doc.text(`Período: ${period === "year" ? "Ano atual" : period === "semester" ? "Último semestre" : "Último mês"}`, 20, 44);
    
    // Summary Stats
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Resumo Estatístico", 20, 58);
    
    autoTable(doc, {
      startY: 65,
      head: [["Indicador", "Valor", "Variação"]],
      body: [
        ["Total de Denúncias", "608", "+12%"],
        ["Denúncias Resolvidas", "508", "+15%"],
        ["Taxa de Resolução", "83.5%", "+3%"],
        ["Tempo Médio de Resolução", "12 dias", "-2 dias"],
        ["Licenças Emitidas", "323", "+8%"],
        ["Licenças Aprovadas", "280", "+10%"],
      ],
      theme: "striped",
      headStyles: { fillColor: [34, 139, 34] },
    });
    
    // Complaints by type
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Denúncias por Tipo", 20, 20);
    
    autoTable(doc, {
      startY: 27,
      head: [["Tipo", "Quantidade", "Percentual"]],
      body: complaintsByTypeData.map(item => [
        item.name,
        item.value.toString(),
        `${((item.value / 100) * 100).toFixed(1)}%`
      ]),
      theme: "striped",
      headStyles: { fillColor: [34, 139, 34] },
    });
    
    // Monthly data
    doc.setFontSize(14);
    doc.text("Evolução Mensal de Denúncias", 20, 100);
    
    autoTable(doc, {
      startY: 107,
      head: [["Mês", "Denúncias", "Resolvidas", "Taxa"]],
      body: complaintsMonthlyData.map(item => [
        item.month,
        item.denuncias.toString(),
        item.resolvidas.toString(),
        `${((item.resolvidas / item.denuncias) * 100).toFixed(1)}%`
      ]),
      theme: "striped",
      headStyles: { fillColor: [34, 139, 34] },
    });
    
    doc.save(`relatorio-${reportName.toLowerCase().replace(/\s/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("PDF exportado com sucesso!");
  };

  const exportToExcel = (reportName: string) => {
    const wb = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ["SEMA - Relatório Ambiental"],
      [""],
      ["Relatório:", reportName],
      ["Data de geração:", new Date().toLocaleDateString("pt-BR")],
      ["Período:", period === "year" ? "Ano atual" : period === "semester" ? "Último semestre" : "Último mês"],
      [""],
      ["Resumo Estatístico"],
      ["Indicador", "Valor", "Variação"],
      ["Total de Denúncias", 608, "+12%"],
      ["Denúncias Resolvidas", 508, "+15%"],
      ["Taxa de Resolução", "83.5%", "+3%"],
      ["Tempo Médio de Resolução", "12 dias", "-2 dias"],
      ["Licenças Emitidas", 323, "+8%"],
      ["Licenças Aprovadas", 280, "+10%"],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, "Resumo");
    
    // Complaints monthly sheet
    const complaintsData = [
      ["Mês", "Denúncias", "Resolvidas", "Taxa de Resolução"],
      ...complaintsMonthlyData.map(item => [
        item.month,
        item.denuncias,
        item.resolvidas,
        `${((item.resolvidas / item.denuncias) * 100).toFixed(1)}%`
      ])
    ];
    const complaintsSheet = XLSX.utils.aoa_to_sheet(complaintsData);
    XLSX.utils.book_append_sheet(wb, complaintsSheet, "Denúncias Mensal");
    
    // Complaints by type sheet
    const typeData = [
      ["Tipo", "Quantidade", "Percentual"],
      ...complaintsByTypeData.map(item => [
        item.name,
        item.value,
        `${((item.value / 100) * 100).toFixed(1)}%`
      ])
    ];
    const typeSheet = XLSX.utils.aoa_to_sheet(typeData);
    XLSX.utils.book_append_sheet(wb, typeSheet, "Denúncias por Tipo");
    
    // Licenses monthly sheet
    const licensesData = [
      ["Mês", "Solicitadas", "Aprovadas", "Negadas"],
      ...licensesMonthlyData.map(item => [
        item.month,
        item.solicitadas,
        item.aprovadas,
        item.negadas
      ])
    ];
    const licensesSheet = XLSX.utils.aoa_to_sheet(licensesData);
    XLSX.utils.book_append_sheet(wb, licensesSheet, "Licenças Mensal");
    
    // Demo complaints data
    const complaintsList = [
      ["Protocolo", "Tipo", "Localização", "Status", "Prioridade", "Data"],
      ...demoComplaints.map(c => [
        c.id,
        c.type,
        c.location,
        c.status,
        c.priority,
        c.created_at
      ])
    ];
    const complaintsListSheet = XLSX.utils.aoa_to_sheet(complaintsList);
    XLSX.utils.book_append_sheet(wb, complaintsListSheet, "Lista de Denúncias");
    
    // Demo licenses data
    const licensesList = [
      ["Protocolo", "Empresa", "Tipo", "Status", "Data"],
      ...demoLicenses.map(l => [
        l.protocol,
        l.enterprise_name,
        l.type,
        l.status,
        l.created_at
      ])
    ];
    const licensesListSheet = XLSX.utils.aoa_to_sheet(licensesList);
    XLSX.utils.book_append_sheet(wb, licensesListSheet, "Lista de Licenças");
    
    XLSX.writeFile(wb, `relatorio-${reportName.toLowerCase().replace(/\s/g, "-")}-${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("Excel exportado com sucesso!");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Relatórios e Estatísticas</h2>
            <p className="text-sm text-muted-foreground">Análise de dados ambientais</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Último mês</SelectItem>
              <SelectItem value="semester">Último semestre</SelectItem>
              <SelectItem value="year">Ano atual</SelectItem>
            </SelectContent>
          </Select>
          
          <GuestActionButton
            variant="outline"
            onClick={() => exportToPDF("Completo")}
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </GuestActionButton>
          
          <GuestActionButton
            variant="outline"
            onClick={() => exportToExcel("Completo")}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Excel
          </GuestActionButton>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Denúncias</p>
                <p className="text-2xl font-bold text-foreground">608</p>
                <p className="text-sm text-success">+12% vs. ano anterior</p>
              </div>
              <div className="p-3 rounded-xl bg-destructive/10">
                <TrendingUp className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Resolução</p>
                <p className="text-2xl font-bold text-foreground">83.5%</p>
                <p className="text-sm text-success">+3% vs. ano anterior</p>
              </div>
              <div className="p-3 rounded-xl bg-success/10">
                <PieChart className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Licenças Emitidas</p>
                <p className="text-2xl font-bold text-foreground">323</p>
                <p className="text-sm text-success">+8% vs. ano anterior</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio Resolução</p>
                <p className="text-2xl font-bold text-foreground">12 dias</p>
                <p className="text-sm text-success">-2 dias vs. ano anterior</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/10">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="denuncias" className="space-y-6">
        <TabsList className="grid w-full max-w-[600px] grid-cols-3">
          <TabsTrigger value="denuncias">Denúncias</TabsTrigger>
          <TabsTrigger value="licencas">Licenças</TabsTrigger>
          <TabsTrigger value="desempenho">Desempenho</TabsTrigger>
        </TabsList>

        <TabsContent value="denuncias" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Complaints Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Evolução Mensal de Denúncias</CardTitle>
                <GuestActionButton
                  variant="ghost"
                  size="sm"
                  onClick={() => exportToPDF("Denúncias Mensal")}
                >
                  <Download className="w-4 h-4" />
                </GuestActionButton>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={complaintsMonthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                      <Legend />
                      <Bar dataKey="denuncias" name="Recebidas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="resolvidas" name="Resolvidas" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Complaints by Type Pie Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Denúncias por Tipo</CardTitle>
                <GuestActionButton
                  variant="ghost"
                  size="sm"
                  onClick={() => exportToPDF("Denúncias por Tipo")}
                >
                  <Download className="w-4 h-4" />
                </GuestActionButton>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={complaintsByTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {complaintsByTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="licencas" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Licenses Monthly Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Evolução Mensal de Licenças</CardTitle>
                <GuestActionButton
                  variant="ghost"
                  size="sm"
                  onClick={() => exportToPDF("Licenças Mensal")}
                >
                  <Download className="w-4 h-4" />
                </GuestActionButton>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={licensesMonthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="solicitadas" 
                        name="Solicitadas" 
                        stackId="1"
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))" 
                        fillOpacity={0.3}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="aprovadas" 
                        name="Aprovadas" 
                        stackId="2"
                        stroke="hsl(var(--success))" 
                        fill="hsl(var(--success))" 
                        fillOpacity={0.3}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="negadas" 
                        name="Negadas" 
                        stackId="3"
                        stroke="hsl(var(--destructive))" 
                        fill="hsl(var(--destructive))" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Licenses by Status Pie Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Licenças por Status</CardTitle>
                <GuestActionButton
                  variant="ghost"
                  size="sm"
                  onClick={() => exportToPDF("Licenças por Status")}
                >
                  <Download className="w-4 h-4" />
                </GuestActionButton>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={licensesByStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {licensesByStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="desempenho" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Performance Trend Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Tendência de Eficiência Operacional</CardTitle>
                <GuestActionButton
                  variant="ghost"
                  size="sm"
                  onClick={() => exportToPDF("Desempenho")}
                >
                  <Download className="w-4 h-4" />
                </GuestActionButton>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceTrendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-muted-foreground" />
                      <YAxis domain={[60, 100]} className="text-muted-foreground" />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                        formatter={(value: number) => [`${value}%`, "Eficiência"]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="eficiencia" 
                        name="Eficiência %" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Indicadores de Desempenho</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Indicador</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Meta</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Realizado</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4 text-sm text-foreground">Taxa de Resolução de Denúncias</td>
                        <td className="py-3 px-4 text-sm text-foreground">80%</td>
                        <td className="py-3 px-4 text-sm text-foreground">83.5%</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-success/10 text-success">Atingido</span>
                        </td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4 text-sm text-foreground">Tempo Médio de Análise de Licenças</td>
                        <td className="py-3 px-4 text-sm text-foreground">15 dias</td>
                        <td className="py-3 px-4 text-sm text-foreground">12 dias</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-success/10 text-success">Atingido</span>
                        </td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4 text-sm text-foreground">Vistorias Realizadas</td>
                        <td className="py-3 px-4 text-sm text-foreground">500</td>
                        <td className="py-3 px-4 text-sm text-foreground">485</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-warning/10 text-warning">Em andamento</span>
                        </td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4 text-sm text-foreground">Satisfação do Usuário</td>
                        <td className="py-3 px-4 text-sm text-foreground">90%</td>
                        <td className="py-3 px-4 text-sm text-foreground">92%</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-success/10 text-success">Atingido</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

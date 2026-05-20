import { useState } from "react";
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Mail,
  Save,
  Camera,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { SeedDataManager } from "@/components/settings/SeedDataManager";

export const Configuracoes = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Configurações salvas com sucesso!");
    }, 800);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" /> Notificações
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" /> Aparência
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Settings className="w-4 h-4" /> Sistema
          </TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize seus dados de perfil.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" className="gap-2">
                  <Camera className="w-4 h-4" /> Alterar Foto
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input defaultValue="Administrador SEMA" />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input defaultValue={user?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input defaultValue="(11) 99999-0000" />
                </div>
                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <Input defaultValue="Analista Ambiental" />
                </div>
                <div className="space-y-2">
                  <Label>Departamento</Label>
                  <Select defaultValue="licenciamento">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="licenciamento">Licenciamento</SelectItem>
                      <SelectItem value="fiscalizacao">Fiscalização</SelectItem>
                      <SelectItem value="monitoramento">Monitoramento</SelectItem>
                      <SelectItem value="educacao">Educação Ambiental</SelectItem>
                      <SelectItem value="admin">Administração</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  placeholder="Uma breve descrição sobre você..."
                  defaultValue="Analista ambiental com foco em licenciamento e fiscalização."
                />
              </div>

              <Button onClick={handleSave} disabled={saving} className="gap-2">
                <Save className="w-4 h-4" />
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>Controle como e quando receber alertas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "Novas denúncias", desc: "Receber alerta quando uma nova denúncia for registrada", default: true },
                { label: "Atualizações de licenças", desc: "Notificar quando houver mudança de status em licenças", default: true },
                { label: "Prazos próximos", desc: "Lembrete 3 dias antes do vencimento de prazos", default: true },
                { label: "Relatórios semanais", desc: "Resumo semanal de atividades por e-mail", default: false },
                { label: "Alertas de áreas protegidas", desc: "Notificar quando uma área mudar de status", default: true },
                { label: "Novos membros na equipe", desc: "Receber aviso quando um novo colaborador for adicionado", default: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{item.label}</Label>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.default} />
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <Label>E-mail para notificações</Label>
                <Input defaultValue={user?.email || ""} />
              </div>

              <Button onClick={handleSave} disabled={saving} className="gap-2">
                <Save className="w-4 h-4" />
                {saving ? "Salvando..." : "Salvar Preferências"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>Personalize a interface do sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tema</Label>
                <p className="text-sm text-muted-foreground">
                  Use o botão de tema no cabeçalho para alternar entre claro, escuro e automático.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select defaultValue="pt-BR">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Densidade</Label>
                <Select defaultValue="normal">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compacta</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="comfortable">Confortável</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSave} disabled={saving} className="gap-2">
                <Save className="w-4 h-4" />
                {saving ? "Salvando..." : "Salvar Aparência"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System */}
        <TabsContent value="system">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" /> Dados do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Versão do sistema</span>
                  <span className="font-medium">v2.1.0</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Último backup</span>
                  <span className="font-medium">12/02/2026, 03:00</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Espaço utilizado</span>
                  <span className="font-medium">2.4 GB / 10 GB</span>
                </div>
              </CardContent>
            </Card>

            <SeedDataManager />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Shield className="w-4 h-4" /> Alterar Senha
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Mail className="w-4 h-4" /> Configurar Autenticação em 2 Fatores
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

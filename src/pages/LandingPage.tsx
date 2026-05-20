import { Link } from "react-router-dom";
import { 
  Leaf, 
  Shield, 
  FileText, 
  Users, 
  BarChart3, 
  MapPin, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  TreePine,
  Droplets,
  Wind,
  Globe,
  Phone,
  Mail,
  Building2,
  Menu,
  X,
  Linkedin,
  Github,
  Instagram,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const features = [
  {
    icon: Shield,
    title: "Gestão de Denúncias",
    description: "Receba, processe e acompanhe denúncias ambientais de forma organizada, com rastreamento de protocolo e notificações automáticas."
  },
  {
    icon: FileText,
    title: "Licenciamento Ambiental",
    description: "Controle completo do ciclo de licenças ambientais, desde a solicitação até a aprovação, com documentação digital integrada."
  },
  {
    icon: Users,
    title: "Gestão de Equipe",
    description: "Administre colaboradores, capacitações, metas de desempenho e atribuições de tarefas em um único lugar."
  },
  {
    icon: BarChart3,
    title: "Relatórios Estatísticos",
    description: "Dashboards interativos com métricas em tempo real, exportação de dados para PDF e Excel para tomada de decisões."
  },
  {
    icon: MapPin,
    title: "Mapeamento Geográfico",
    description: "Visualização espacial de ocorrências, áreas protegidas e empreendimentos licenciados com integração de mapas."
  },
  {
    icon: Clock,
    title: "Monitoramento em Tempo Real",
    description: "Acompanhe indicadores ambientais, prazos de licenças e status de fiscalizações instantaneamente."
  }
];

const stats = [
  { value: "2.500+", label: "Denúncias Processadas", icon: Shield },
  { value: "850+", label: "Licenças Emitidas", icon: FileText },
  { value: "98%", label: "Taxa de Resolução", icon: CheckCircle2 },
  { value: "45", label: "Municípios Atendidos", icon: MapPin }
];

const modules = [
  {
    icon: TreePine,
    title: "Fiscalização Ambiental",
    items: ["Registro de ocorrências", "Atribuição de fiscais", "Relatórios de vistoria", "Acompanhamento de processos"]
  },
  {
    icon: Droplets,
    title: "Recursos Hídricos",
    items: ["Outorgas de uso", "Monitoramento de qualidade", "Gestão de bacias", "Alertas de escassez"]
  },
  {
    icon: Wind,
    title: "Qualidade do Ar",
    items: ["Monitoramento atmosférico", "Índices de poluição", "Licenças industriais", "Relatórios de emissões"]
  },
  {
    icon: Globe,
    title: "Biodiversidade",
    items: ["Unidades de conservação", "Fauna e flora", "Pesquisas científicas", "Educação ambiental"]
  }
];

export const LandingPage = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, isGuest, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (user || isGuest)) {
      navigate("/login", { replace: true });
    }
  }, [user, isGuest, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-nature flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">SEMA</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Sistema de Gestão Ambiental</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Funcionalidades
            </a>
            <a href="#modules" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Módulos
            </a>
            <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Resultados
            </a>
            <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contato
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/portal" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Portal do Cidadão
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="gap-2">
                <span className="hidden sm:inline">Acessar Sistema</span>
                <span className="sm:hidden">Entrar</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-t border-border"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              <a href="#features" className="text-sm py-2 text-muted-foreground" onClick={() => setMobileNavOpen(false)}>Funcionalidades</a>
              <a href="#modules" className="text-sm py-2 text-muted-foreground" onClick={() => setMobileNavOpen(false)}>Módulos</a>
              <a href="#stats" className="text-sm py-2 text-muted-foreground" onClick={() => setMobileNavOpen(false)}>Resultados</a>
              <a href="#contact" className="text-sm py-2 text-muted-foreground" onClick={() => setMobileNavOpen(false)}>Contato</a>
              <Link to="/portal" className="sm:hidden">
                <Button variant="outline" size="sm" className="w-full">Portal do Cidadão</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4">
        <div className="container mx-auto">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Leaf className="w-4 h-4" />
              <span className="text-sm font-medium">Secretaria de Meio Ambiente</span>
            </motion.div>
            
            <motion.h1 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Gestão Ambiental <br />
              <span className="text-primary">Integrada e Inteligente</span>
            </motion.h1>
            
            <motion.p variants={fadeUp} custom={2} className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Plataforma completa para fiscalização, licenciamento e monitoramento ambiental. 
              Tecnologia a serviço da proteção do meio ambiente.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="gap-2 text-base px-8 w-full sm:w-auto">
                  Acessar o Sistema
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/portal">
                <Button variant="outline" size="lg" className="gap-2 text-base px-8 w-full sm:w-auto">
                  Fazer uma Denúncia
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            className="mt-12 sm:mt-16 relative"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="absolute inset-0 gradient-hero rounded-3xl opacity-10" />
            <div className="relative bg-card border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Funcionalidades Principais
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Ferramentas completas para uma gestão ambiental eficiente e transparente
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 h-full">
                  <CardContent className="p-5 sm:p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-12 sm:py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Módulos do Sistema
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Áreas temáticas integradas para uma visão completa da gestão ambiental
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {modules.map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="relative overflow-hidden group h-full">
                  <div className="absolute top-0 left-0 right-0 h-1 gradient-nature" />
                  <CardContent className="p-5 sm:p-6">
                    <div className="w-14 h-14 rounded-2xl gradient-nature flex items-center justify-center mb-4">
                      <module.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      {module.title}
                    </h3>
                    <ul className="space-y-2">
                      {module.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-12 sm:py-20 px-4 gradient-hero">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Impacto e Resultados
            </h2>
            <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto">
              Números que demonstram nosso compromisso com a proteção ambiental
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { value: "24h", label: "Tempo Médio de Resposta" },
              { value: "15k+", label: "Hectares Protegidos" },
              { value: "120+", label: "Fiscais Ativos" },
              { value: "365", label: "Dias de Operação" },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">{item.value}</p>
                <p className="text-white/80 text-sm sm:text-base">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-2xl gradient-nature flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Faça Parte da Proteção Ambiental
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-8">
              Cidadãos podem registrar denúncias de forma anônima e acompanhar o andamento 
              pelo Portal do Cidadão. Colaboradores acessam o sistema completo de gestão.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/portal">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8 w-full sm:w-auto">
                  Portal do Cidadão
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" className="gap-2 text-base px-8 w-full sm:w-auto">
                  Área do Colaborador
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
                Entre em Contato
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                Estamos à disposição para atender a população
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
              {[
                { icon: Phone, title: "Telefone", line1: "(00) 0000-0000", line2: "Seg a Sex, 8h às 17h" },
                { icon: Mail, title: "E-mail", line1: "contato@sema.gov.br", line2: "Resposta em até 48h" },
                { icon: Building2, title: "Endereço", line1: "Av. Principal, 1000", line2: "Centro - CEP 00000-000" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-5 sm:p-6 text-center">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.line1}</p>
                      <p className="text-sm text-muted-foreground mt-1">{item.line2}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 border-t border-border">
        <div className="container mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-nature flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-foreground">SEMA</span>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} Secretaria de Meio Ambiente. Todos os direitos reservados.
            </p>

            <div className="flex items-center gap-4">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacidade
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Termos
              </a>
            </div>
          </div>

          <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <span className="text-xs text-muted-foreground">Desenvolvido por <span className="font-medium text-foreground">Francisco Douglas</span></span>
            <div className="flex items-center gap-3">
              {[
                { icon: Linkedin, href: "https://www.linkedin.com/in/francisco-douglas-sousa", label: "LinkedIn" },
                { icon: Github, href: "https://github.com/Francisco-Douglas-eng", label: "GitHub" },
                { icon: Instagram, href: "https://www.instagram.com/franciscodouglas77", label: "Instagram" },
                { icon: Globe, href: "https://portfolio-franciscodouglas.vercel.app/", label: "Portfólio" },
                { icon: MessageCircle, href: "https://wa.me/5586981625526", label: "WhatsApp" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-200"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

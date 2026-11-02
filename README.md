<div align="center">

# 🌿 SEMA Ambiente

**Sistema de Gestão Ambiental para Órgãos Públicos**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-2.106-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/Licença-MIT-green?style=flat-square)](LICENSE)

</div>

---

## Visão Geral

O **SEMA Ambiente** é uma plataforma web completa para gestão ambiental de secretarias e órgãos públicos. Centraliza o ciclo de vida de denúncias ambientais, processos de licenciamento, monitoramento de áreas protegidas e a produção de relatórios estatísticos — tudo em uma interface moderna, acessível e responsiva.

O sistema atende dois públicos distintos:

- **Servidores internos** (admins, analistas, inspetores, visualizadores) via autenticação com controle de acesso baseado em papéis (RBAC)
- **Cidadãos** via portal público — sem necessidade de cadastro — para registrar e acompanhar denúncias

---

## Funcionalidades

### 🔔 Módulo de Denúncias
- Registro de ocorrências por categoria: desmatamento, queimada, poluição hídrica, poluição do ar, descarte irregular, caça ilegal, mineração ilegal
- Visualização em lista e mapa georreferenciado
- Filtros avançados por tipo, status, prioridade e data
- Upload de anexos (fotos, documentos)
- Timeline de acompanhamento por denúncia
- Atribuição a fiscal ou analista responsável
- Fluxo de status: `pendente → em análise → em andamento → resolvido → arquivado`

### 📋 Licenciamento Ambiental
- Gestão do ciclo completo de licenças: prévia, instalação, operação, simplificada, autorização
- Fluxo de aprovação: `rascunho → submetido → documentação → análise técnica → aprovado/rejeitado`
- Upload e verificação de documentos comprobatórios
- Histórico de ações e responsáveis

### 🌍 Portal Público
- Registro de denúncias sem cadastro (anônimo ou identificado)
- Rastreamento de protocolo por código único
- Notificação opcional por e-mail ao requerente

### 📊 Dashboard e Relatórios
- Cards de indicadores em tempo real
- Gráficos de barras, linhas e pizza (Recharts)
- Mapa de áreas protegidas
- Exportação de relatórios em **PDF** e **Excel** com múltiplas planilhas

### 👥 Gestão Interna
- Módulo de equipe: colaboradores e papéis
- Agenda de eventos e compromissos
- Projetos ambientais em andamento
- Monitoramento de áreas de conservação
- Log de auditoria completo de ações do sistema

### 🔐 Autenticação e Segurança
- Supabase Auth com sessão persistente
- 4 papéis de acesso: `admin | analyst | inspector | viewer`
- **Modo visitante**: acesso demonstrativo sem cadastro (dados fictícios)
- Funções RPC no banco para geração de protocolos e validação de papéis

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework UI | React 18 + TypeScript |
| Bundler | Vite 5 com SWC |
| Estilização | Tailwind CSS 3 + shadcn/ui + Radix UI |
| Roteamento | React Router DOM 6 |
| Estado assíncrono | TanStack React Query 5 |
| Formulários | React Hook Form + Zod |
| Animações | Framer Motion |
| Gráficos | Recharts |
| Exportação | jsPDF + jspdf-autotable, xlsx |
| Backend/BaaS | Supabase (PostgreSQL, Auth, Storage) |
| Testes | Vitest + Testing Library |

---

## Estrutura do Projeto

```
sema-ambiente/
├── public/                     # Assets estáticos e manifesto PWA
├── src/
│   ├── App.tsx                 # Raiz: providers e roteamento principal
│   ├── main.tsx                # Entry point
│   │
│   ├── pages/                  # Páginas completas
│   │   ├── LandingPage.tsx     # Página pública de apresentação
│   │   ├── Index.tsx           # Shell autenticado (auth guard + navegação interna)
│   │   ├── LoginPage.tsx       # Tela de autenticação
│   │   ├── PublicPortal.tsx    # Portal do cidadão
│   │   ├── Dashboard.tsx       # Painel principal
│   │   ├── Denuncias.tsx       # Módulo de denúncias
│   │   ├── Licencas.tsx        # Licenciamento ambiental
│   │   ├── Relatorios.tsx      # Relatórios e exportações
│   │   ├── AreasProtegidas.tsx # Unidades de conservação
│   │   ├── Equipe.tsx          # Gestão de colaboradores
│   │   ├── Projetos.tsx        # Projetos ambientais
│   │   ├── Agenda.tsx          # Eventos e compromissos
│   │   └── Configuracoes.tsx   # Preferências do sistema
│   │
│   ├── components/
│   │   ├── layout/             # Header, Sidebar, navegação mobile
│   │   ├── dashboard/          # Widgets do painel
│   │   ├── denuncias/          # Componentes do módulo de denúncias
│   │   └── ui/                 # Biblioteca de componentes (shadcn/ui)
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx     # Contexto de autenticação e papéis
│   │
│   ├── services/               # Camada de acesso ao Supabase
│   │   ├── complaintService.ts
│   │   ├── licenseService.ts
│   │   ├── teamService.ts
│   │   └── auditService.ts
│   │
│   ├── integrations/
│   │   └── supabase/           # Cliente e tipos gerados do banco
│   │
│   ├── hooks/                  # Hooks customizados
│   ├── data/                   # Dados de demonstração e mock
│   ├── types/                  # Tipos TypeScript compartilhados
│   └── lib/utils.ts            # Utilitários gerais
│
├── vite.config.ts
├── tailwind.config.ts
├── components.json             # Configuração shadcn/ui
└── package.json
```

---

## Banco de Dados

O backend é 100% gerenciado pelo **Supabase** (PostgreSQL). O schema principal inclui:

| Tabela | Descrição |
|---|---|
| `profiles` | Dados complementares de usuário |
| `user_roles` | Papéis RBAC por usuário |
| `complaints` | Denúncias ambientais |
| `complaint_attachments` | Arquivos anexados às denúncias |
| `complaint_timeline` | Histórico de ações por denúncia |
| `complaint_tracking` | Códigos de rastreio público |
| `licenses` | Licenças ambientais |
| `license_documents` | Documentos das licenças |
| `license_timeline` | Histórico de ações por licença |
| `audit_logs` | Auditoria geral do sistema |
| `trainings` | Capacitações e treinamentos |
| `performance_goals` | Metas de desempenho |

**Funções RPC disponíveis:**
- `generate_protocol(prefix)` — gera número de protocolo único
- `generate_tracking_code()` — gera código de rastreio público
- `has_role(_role, _user_id)` — verifica papel de acesso
- `is_staff(_user_id)` — verifica se o usuário é servidor

---

## Início Rápido

### Pré-requisitos

- [Node.js](https://nodejs.org) 18+ (recomendado: gerenciar via [nvm](https://github.com/nvm-sh/nvm))
- npm 9+ (ou bun)
- Conta no [Supabase](https://supabase.com) (para backend)

### Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd sema-ambiente

# Instale as dependências
npm install
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as credenciais do seu projeto Supabase:

```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<sua-chave-anonima>
```

> As chaves acima são públicas (anon key) e seguras para uso no cliente. Nunca exponha a `service_role` key no frontend.

### Executar em Desenvolvimento

```bash
npm run dev
```

O servidor sobe em `http://localhost:8080` com hot-reload ativo.

---

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (porta 8080) |
| `npm run build` | Build de produção otimizado |
| `npm run preview` | Pré-visualiza o build de produção localmente |
| `npm run lint` | Análise estática de código (ESLint) |
| `npm run test` | Executa a suíte de testes (Vitest) |
| `npm run test:watch` | Testes em modo watch |

---

## Rodando os Testes

```bash
npm run test
```

A suíte utiliza **Vitest** com **Testing Library** para testes de componentes React e lógica de serviços.

---

## Deploy

O projeto gera um bundle estático via `npm run build`. O output é a pasta `dist/`, que pode ser servida por qualquer CDN ou host estático:

- [Vercel](https://vercel.com)
- [Netlify](https://netlify.com)
- [Cloudflare Pages](https://pages.cloudflare.com)
- Nginx / Apache em servidor próprio

Configure as variáveis de ambiente no painel do seu provedor antes do deploy.

---

## Contribuindo

1. Fork o repositório
2. Crie uma branch para sua feature: `git checkout -b feat/minha-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona minha feature'`
4. Push para a branch: `git push origin feat/minha-feature`
5. Abra um Pull Request

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org) para mensagens de commit.

---

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

<div align="center">
  <sub>Desenvolvido para secretarias e órgãos públicos de meio ambiente.</sub>
</div>

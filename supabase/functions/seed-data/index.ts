import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BATCH_SIZE = 100;

// Brazilian names data
const firstNames = [
  "Ana", "Maria", "João", "Pedro", "Carlos", "Fernanda", "Lucas", "Juliana",
  "Rafael", "Camila", "Bruno", "Larissa", "Thiago", "Amanda", "Felipe",
  "Gabriela", "Rodrigo", "Letícia", "Marcelo", "Patrícia", "Diego", "Beatriz",
  "André", "Vanessa", "Eduardo", "Renata", "Gustavo", "Cláudia", "Marcos",
  "Daniela", "Leonardo", "Tatiana", "Vinícius", "Priscila", "Matheus",
  "Aline", "Henrique", "Natália", "Douglas", "Mariana", "Leandro", "Roberta",
  "Alexandre", "Mônica", "Guilherme", "Sandra", "Ricardo", "Jéssica",
  "Fernando", "Adriana",
];

const lastNames = [
  "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves",
  "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho",
  "Araújo", "Melo", "Barbosa", "Rocha", "Nascimento", "Moreira", "Monteiro",
  "Mendes", "Barros", "Freitas", "Cardoso", "Teixeira", "Vieira", "Nunes",
  "Campos", "Lopes",
];

const departments = [
  "Licenciamento", "Fiscalização", "Monitoramento", "Educação Ambiental",
  "Administração", "Jurídico", "Gestão de Resíduos", "Recursos Hídricos",
];

const positions = [
  "Analista Ambiental", "Fiscal Ambiental", "Técnico em Meio Ambiente",
  "Coordenador de Licenciamento", "Engenheiro Florestal", "Biólogo",
  "Geógrafo", "Gestor Ambiental", "Auditor Ambiental", "Consultor Técnico",
];

const cities = [
  "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Porto Alegre",
  "Salvador", "Recife", "Fortaleza", "Manaus", "Belém", "Goiânia", "Brasília",
  "Campinas", "São Luís", "Natal", "João Pessoa", "Teresina", "Macapá",
  "Palmas", "Rio Branco",
];

const streets = [
  "Rua das Flores", "Av. Brasil", "Rua do Comércio", "Av. Paulista",
  "Rua São José", "Av. Getúlio Vargas", "Rua XV de Novembro",
  "Av. Rio Branco", "Rua da Consolação", "Av. Beira Mar",
  "Rua dos Pinheiros", "Av. Atlântica", "Rua Augusta", "Rua da Paz",
];

const complaintDescriptions = [
  "Desmatamento ilegal de área de mata nativa em propriedade rural, com uso de motosserra e queimada para limpeza do terreno.",
  "Empresa despejando efluentes industriais diretamente no rio sem tratamento adequado, causando mortandade de peixes.",
  "Queimada de grande proporção atingindo área de preservação permanente próxima a nascente de rio.",
  "Depósito irregular de resíduos sólidos e entulho em terreno baldio próximo a área residencial.",
  "Caça ilegal de animais silvestres em unidade de conservação, com armadilhas e redes encontradas no local.",
  "Mineração irregular em leito de rio, com uso de dragas e mercúrio para extração de ouro.",
  "Poluição atmosférica causada por indústria sem filtros adequados, gerando fumaça tóxica sobre bairro residencial.",
  "Construção irregular em área de mangue, com aterramento e destruição da vegetação nativa.",
  "Aplicação aérea de agrotóxicos próxima a escola rural e nascente de água potável.",
  "Corte ilegal de árvores em área urbana protegida para construção de estacionamento comercial.",
  "Lançamento de esgoto doméstico sem tratamento em córrego que abastece comunidade ribeirinha.",
  "Extração ilegal de areia em margem de rio, causando erosão e assoreamento do leito.",
  "Criação de porcos em área de APP, com dejetos sendo despejados diretamente no solo.",
  "Incêndio criminoso em reserva ecológica durante período de seca, destruindo fauna e flora.",
  "Empresa de cerâmica emitindo poluentes sem licença de operação válida.",
];

const enterpriseNames = [
  "Mineração Norte Ltda", "Indústria Amazônia S.A.", "Agropecuária Serra Verde",
  "Cerâmica Boa Vista", "Metalúrgica Progresso", "Construtora Horizonte",
  "Madeireira Rio Grande", "Frigorífico Central", "Usina São Francisco",
  "Química Industrial Brasil", "Petroquímica Nordeste", "Cimenteira Atlântica",
  "Siderúrgica Nacional", "Curtume Pantanal", "Têxtil Sul",
];

const enterpriseActivities = [
  "Mineração de calcário", "Processamento de metais", "Pecuária extensiva",
  "Fabricação de cerâmica", "Produção de cimento", "Construção civil",
  "Beneficiamento de madeira", "Abate e processamento de carnes",
  "Produção de etanol", "Fabricação de produtos químicos",
  "Refino de petróleo", "Produção de papel e celulose",
  "Cultivo de soja e milho", "Aquicultura e piscicultura",
  "Produção de energia solar", "Reciclagem de resíduos industriais",
];

const trainingTitles = [
  "Licenciamento Ambiental - Normas e Procedimentos",
  "Fiscalização de Campo - Técnicas Avançadas",
  "Geoprocessamento e Sensoriamento Remoto",
  "Legislação Ambiental Brasileira Atualizada",
  "Manejo de Fauna Silvestre",
  "Recuperação de Áreas Degradadas",
  "Gestão de Resíduos Sólidos",
  "Monitoramento de Qualidade da Água",
  "Prevenção e Combate a Incêndios Florestais",
  "Educação Ambiental em Comunidades",
];

const userRoles: string[] = ["admin", "analyst", "inspector", "viewer"];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(startDays: number, endDays: number): string {
  const now = Date.now();
  const start = now - startDays * 86400000;
  const end = now - endDays * 86400000;
  return new Date(start + Math.random() * (end - start)).toISOString();
}

function randomCoords(): string {
  const lat = -(1 + Math.random() * 32).toFixed(6);
  const lng = -(35 + Math.random() * 38).toFixed(6);
  return `${lat},${lng}`;
}

function generateCPF(): string {
  const n = () => randInt(0, 9);
  return `${n()}${n()}${n()}.${n()}${n()}${n()}.${n()}${n()}${n()}-${n()}${n()}`;
}

function generatePhone(): string {
  return `(${randInt(11, 99)}) 9${randInt(1000, 9999)}-${randInt(1000, 9999)}`;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface SeedRequest {
  action: "seed" | "delete";
  types: string[];
  quantity: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT and check admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userId = claimsData.claims.sub as string;

    // Check admin role using service client
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    // Validate input
    if (!body || !body.action || !Array.isArray(body.types)) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { action, types, quantity } = body as SeedRequest;
    const safeQuantity = Math.min(Math.max(quantity || 1, 1), 500);

    if (action === "delete") {
      return await handleDelete(supabase, types);
    }

    const results: Record<string, number> = {};

    for (const type of types) {
      if (type === "users") {
        const count = await seedUsers(supabase, safeQuantity);
        results[type] = count;
        continue;
      }

      let created = 0;
      while (created < safeQuantity) {
        const batchSize = Math.min(BATCH_SIZE, safeQuantity - created);
        const batch = generateBatch(type, batchSize, created);

        if (batch.length > 0) {
          const { error } = await supabase.from(getTable(type)).insert(batch);
          if (error) {
            console.error(`Error seeding ${type}:`, error);
            return new Response(JSON.stringify({ error: `Erro ao criar ${type}: ${error.message}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
        }

        created += batchSize;
        if (created < safeQuantity && created % BATCH_SIZE === 0) await sleep(5000);
      }

      results[type] = created;
    }

    return new Response(JSON.stringify({ success: true, results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Seed error:", error);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

async function seedUsers(supabase: any, quantity: number): Promise<number> {
  let created = 0;
  while (created < quantity) {
    const batchSize = Math.min(BATCH_SIZE, quantity - created);
    for (let i = 0; i < batchSize; i++) {
      const idx = created + i;
      const firstName = rand(firstNames);
      const lastName = rand(lastNames);
      const fullName = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}.${lastName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}${idx}@sema.gov.br`;
      const role = rand(userRoles);
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({ email, password: "SemaTest@2026", email_confirm: true, user_metadata: { full_name: fullName } });
      if (authError) { console.error(`Error creating user ${email}:`, authError); continue; }
      const userId = authData.user.id;
      await supabase.from("profiles").update({ phone: generatePhone(), position: rand(positions), department: rand(departments) }).eq("user_id", userId);
      if (role !== "viewer") await supabase.from("user_roles").update({ role }).eq("user_id", userId);
    }
    created += batchSize;
    if (created < quantity && created % BATCH_SIZE === 0) await sleep(5000);
  }
  return created;
}

async function handleDelete(supabase: any, types: string[]) {
  const results: Record<string, string> = {};
  for (const type of types) {
    if (type === "users") {
      const { data: profiles } = await supabase.from("profiles").select("user_id, email");
      let deleted = 0;
      if (profiles) {
        for (const p of profiles) {
          if (p.email && !p.email.endsWith("@sema.gov.br")) continue;
          const { error } = await supabase.auth.admin.deleteUser(p.user_id);
          if (!error) deleted++;
          if (deleted > 0 && deleted % BATCH_SIZE === 0) await sleep(5000);
        }
      }
      results[type] = `${deleted} excluídos`;
      continue;
    }
    const table = getTable(type);
    if (!table) continue;
    if (type === "complaints") { await supabase.from("complaint_attachments").delete().neq("id", "00000000-0000-0000-0000-000000000000"); await supabase.from("complaint_timeline").delete().neq("id", "00000000-0000-0000-0000-000000000000"); await supabase.from("complaint_tracking").delete().neq("id", "00000000-0000-0000-0000-000000000000"); }
    if (type === "licenses") { await supabase.from("license_documents").delete().neq("id", "00000000-0000-0000-0000-000000000000"); await supabase.from("license_timeline").delete().neq("id", "00000000-0000-0000-0000-000000000000"); }
    if (type === "trainings") { await supabase.from("training_participants").delete().neq("id", "00000000-0000-0000-0000-000000000000"); }
    const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    results[type] = error ? `Erro: ${error.message}` : "Excluído";
  }
  return new Response(JSON.stringify({ success: true, results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function getTable(type: string): string {
  return ({ complaints: "complaints", licenses: "licenses", trainings: "trainings", performance_goals: "performance_goals" } as Record<string, string>)[type] || type;
}

function generateBatch(type: string, size: number, offset: number): any[] {
  const items: any[] = [];
  for (let i = 0; i < size; i++) {
    const idx = offset + i;
    switch (type) {
      case "complaints": items.push(generateComplaint(idx)); break;
      case "licenses": items.push(generateLicense(idx)); break;
      case "trainings": items.push(generateTraining(idx)); break;
      case "performance_goals": items.push(generatePerformanceGoal(idx)); break;
    }
  }
  return items;
}

function generateComplaint(idx: number) {
  const types = ["desmatamento","queimada","poluicao_hidrica","poluicao_ar","descarte_irregular","caca_ilegal","mineracao_ilegal","outros"] as const;
  const statuses = ["pending","under_analysis","in_progress","resolved","archived"] as const;
  const priorities = ["low","medium","high"] as const;
  const isAnon = Math.random() > 0.6;
  const city = rand(cities);
  const created = randomDate(365, 0);
  return {
    protocol: `DEN-2026-${String(randInt(10000, 99999)).padStart(5, "0")}${randInt(0,9)}`,
    type: rand([...types]),
    status: rand([...statuses]),
    priority: rand([...priorities]),
    description: rand(complaintDescriptions),
    location: `${rand(streets)}, ${randInt(1, 2000)}, ${city}`,
    coordinates: randomCoords(),
    anonymous: isAnon,
    reporter_name: isAnon ? null : `${rand(firstNames)} ${rand(lastNames)}`,
    reporter_email: isAnon ? null : `reporter${idx}@email.com`,
    reporter_phone: isAnon ? null : generatePhone(),
    created_at: created,
    updated_at: created,
  };
}

function generateLicense(idx: number) {
  const types = ["previa","instalacao","operacao","simplificada","autorizacao"] as const;
  const statuses = ["draft","submitted","documentation","technical_analysis","approved","rejected","expired"] as const;
  const name = `${rand(firstNames)} ${rand(lastNames)}`;
  const city = rand(cities);
  const created = randomDate(365, 0);
  const status = rand([...statuses]);
  return {
    protocol: `LIC-2026-${String(randInt(10000, 99999)).padStart(5, "0")}${randInt(0,9)}`,
    type: rand([...types]),
    status,
    applicant_name: name,
    applicant_document: generateCPF(),
    applicant_email: `licenca${idx}@empresa.com`,
    applicant_phone: generatePhone(),
    enterprise_name: rand(enterpriseNames),
    enterprise_activity: rand(enterpriseActivities),
    enterprise_address: `${rand(streets)}, ${randInt(1, 2000)}, ${city}`,
    enterprise_coordinates: randomCoords(),
    description: `Solicitação de licença para ${rand(enterpriseActivities).toLowerCase()} na região de ${city}.`,
    area_size: randInt(1, 5000),
    submitted_at: status !== "draft" ? created : null,
    approved_at: status === "approved" ? randomDate(180, 0) : null,
    expires_at: status === "approved" ? new Date(Date.now() + randInt(180, 730) * 86400000).toISOString() : null,
    created_at: created,
    updated_at: created,
  };
}

function generateTraining(_idx: number) {
  const statuses = ["scheduled","in_progress","completed","cancelled"];
  const types = ["presencial","online","híbrido"];
  const startDate = randomDate(180, -90);
  return {
    title: rand(trainingTitles),
    description: `Capacitação voltada para servidores da área ambiental com foco em ${rand(trainingTitles).toLowerCase()}.`,
    type: rand(types),
    status: rand(statuses),
    instructor: `Prof. ${rand(firstNames)} ${rand(lastNames)}`,
    max_participants: randInt(15, 50),
    duration_hours: randInt(4, 40),
    start_date: startDate,
    end_date: new Date(new Date(startDate).getTime() + randInt(1, 5) * 86400000).toISOString(),
  };
}

function generatePerformanceGoal(_idx: number) {
  const categories = ["Fiscalização","Licenciamento","Monitoramento","Educação","Gestão","Atendimento"];
  const titles = ["Vistorias realizadas no mês","Licenças analisadas","Denúncias resolvidas","Ações educativas realizadas","Relatórios entregues no prazo","Áreas monitoradas","Autos de infração lavrados","Pareceres técnicos emitidos"];
  const target = randInt(10, 200);
  const current = randInt(0, target + 20);
  return {
    user_id: "648106ef-1627-4967-9c5f-099cb293f1b7",
    title: rand(titles),
    description: `Meta de desempenho para ${rand(categories).toLowerCase()} no período.`,
    category: rand(categories),
    target_value: target,
    current_value: Math.min(current, target + 10),
    unit: "unidades",
    status: current >= target ? "completed" : "active",
    period_start: "2026-01-01",
    period_end: "2026-06-30",
  };
}

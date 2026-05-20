import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple QR Code generation using a public API
function generateQRCodeUrl(data: string): string {
  const encoded = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encoded}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function generateHTML(license: any, qrCodeUrl: string, validationUrl: string): string {
  const typeLabels: Record<string, string> = {
    previa: "Licença Prévia (LP)",
    instalacao: "Licença de Instalação (LI)",
    operacao: "Licença de Operação (LO)",
    simplificada: "Licença Simplificada",
    autorizacao: "Autorização Ambiental",
  };

  // Sanitize all user data to prevent XSS
  const esc = (s: string | null | undefined) => 
    (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Licença Ambiental - ${esc(license.protocol)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', serif; background: #fff; color: #1a1a1a; line-height: 1.6; }
    .container { max-width: 210mm; margin: 0 auto; padding: 20mm; min-height: 297mm; position: relative; }
    .header { text-align: center; border-bottom: 3px double #166534; padding-bottom: 20px; margin-bottom: 30px; }
    .logo-area { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 15px; }
    .logo { width: 80px; height: 80px; background: linear-gradient(135deg, #166534, #22c55e); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; font-size: 40px; }
    .org-name h1 { font-size: 24px; color: #166534; font-weight: bold; }
    .org-name p { font-size: 14px; color: #666; }
    .doc-title { font-size: 20px; font-weight: bold; color: #166534; margin-top: 20px; text-transform: uppercase; letter-spacing: 2px; }
    .protocol { font-size: 16px; color: #444; margin-top: 5px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 14px; font-weight: bold; color: #166534; border-bottom: 1px solid #166534; padding-bottom: 5px; margin-bottom: 15px; text-transform: uppercase; }
    .field { margin-bottom: 12px; }
    .field-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .field-value { font-size: 14px; color: #1a1a1a; font-weight: 500; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .validity-box { background: #f0fdf4; border: 2px solid #166534; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
    .validity-box h3 { color: #166534; font-size: 14px; margin-bottom: 10px; }
    .validity-box .dates { font-size: 16px; font-weight: bold; color: #1a1a1a; }
    .qr-section { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
    .signature { text-align: center; width: 250px; }
    .signature-line { border-top: 1px solid #1a1a1a; margin-bottom: 5px; }
    .signature p { font-size: 12px; color: #666; }
    .qr-box { text-align: center; }
    .qr-box img { width: 120px; height: 120px; border: 1px solid #ddd; }
    .qr-box p { font-size: 10px; color: #666; margin-top: 5px; }
    .footer { position: absolute; bottom: 20mm; left: 20mm; right: 20mm; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 10px; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80px; color: rgba(22, 101, 52, 0.05); font-weight: bold; pointer-events: none; z-index: -1; }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } .container { padding: 15mm; } }
  </style>
</head>
<body>
  <div class="watermark">SEMA</div>
  <div class="container">
    <header class="header">
      <div class="logo-area">
        <div class="logo">🌿</div>
        <div class="org-name"><h1>SEMA</h1><p>Secretaria de Meio Ambiente</p></div>
      </div>
      <div class="doc-title">${esc(typeLabels[license.type] || license.type)}</div>
      <div class="protocol">Protocolo: ${esc(license.protocol)}</div>
    </header>
    <section class="section">
      <h2 class="section-title">Dados do Requerente</h2>
      <div class="grid">
        <div class="field"><div class="field-label">Nome / Razão Social</div><div class="field-value">${esc(license.applicant_name)}</div></div>
        <div class="field"><div class="field-label">CPF / CNPJ</div><div class="field-value">${esc(license.applicant_document)}</div></div>
        <div class="field"><div class="field-label">E-mail</div><div class="field-value">${esc(license.applicant_email)}</div></div>
        <div class="field"><div class="field-label">Telefone</div><div class="field-value">${esc(license.applicant_phone)}</div></div>
      </div>
    </section>
    <section class="section">
      <h2 class="section-title">Dados do Empreendimento</h2>
      <div class="field"><div class="field-label">Nome do Empreendimento</div><div class="field-value">${esc(license.enterprise_name)}</div></div>
      <div class="grid">
        <div class="field"><div class="field-label">Atividade</div><div class="field-value">${esc(license.enterprise_activity)}</div></div>
        <div class="field"><div class="field-label">Área</div><div class="field-value">${license.area_size ? `${license.area_size} hectares` : "N/A"}</div></div>
      </div>
      <div class="field"><div class="field-label">Endereço</div><div class="field-value">${esc(license.enterprise_address)}</div></div>
      ${license.enterprise_coordinates ? `<div class="field"><div class="field-label">Coordenadas</div><div class="field-value">${esc(license.enterprise_coordinates)}</div></div>` : ""}
    </section>
    ${license.description ? `<section class="section"><h2 class="section-title">Descrição do Projeto</h2><p style="font-size: 14px;">${esc(license.description)}</p></section>` : ""}
    <div class="validity-box">
      <h3>PERÍODO DE VALIDADE</h3>
      <div class="dates">${formatDate(license.approved_at)} a ${formatDate(license.expires_at)}</div>
    </div>
    <div class="qr-section">
      <div class="signature"><div class="signature-line"></div><p><strong>Diretor de Licenciamento</strong></p><p>Secretaria de Meio Ambiente</p></div>
      <div class="qr-box"><img src="${qrCodeUrl}" alt="QR Code de Validação" /><p>Escaneie para validar</p><p style="font-size: 8px; word-break: break-all; max-width: 150px;">${esc(validationUrl)}</p></div>
    </div>
    <footer class="footer">
      <p>Este documento foi gerado eletronicamente e sua autenticidade pode ser verificada através do QR Code.</p>
      <p>Secretaria de Meio Ambiente - Sistema de Gestão Ambiental</p>
    </footer>
  </div>
</body>
</html>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the user's JWT
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { licenseId } = await req.json();

    if (!licenseId || typeof licenseId !== "string") {
      return new Response(
        JSON.stringify({ error: "License ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for data fetch
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: license, error } = await supabase
      .from("licenses")
      .select("*")
      .eq("id", licenseId)
      .single();

    if (error || !license) {
      return new Response(
        JSON.stringify({ error: "License not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (license.status !== "approved") {
      return new Response(
        JSON.stringify({ error: "Only approved licenses can generate PDF" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validationUrl = `${supabaseUrl.replace('.supabase.co', '')}/validate/${license.protocol}`;
    const qrCodeUrl = generateQRCodeUrl(validationUrl);
    const html = generateHTML(license, qrCodeUrl, validationUrl);

    return new Response(html, {
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate PDF" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

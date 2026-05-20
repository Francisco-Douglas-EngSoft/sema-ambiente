import { supabase } from "@/integrations/supabase/client";

export type LicenseStatus = "draft" | "submitted" | "documentation" | "technical_analysis" | "approved" | "rejected" | "expired";
export type LicenseType = "previa" | "instalacao" | "operacao" | "simplificada" | "autorizacao";

export interface LicenseRow {
  id: string;
  protocol: string;
  type: LicenseType;
  status: LicenseStatus;
  applicant_name: string;
  applicant_document: string;
  applicant_email: string;
  applicant_phone: string | null;
  enterprise_name: string;
  enterprise_activity: string;
  enterprise_address: string;
  enterprise_coordinates: string | null;
  area_size: number | null;
  description: string | null;
  assigned_to: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  assigned_profile?: { full_name: string; avatar_url: string | null } | null;
}

export type LicenseInsert = Partial<Omit<LicenseRow, "id" | "created_at" | "updated_at" | "assigned_profile">> & {
  type: LicenseType;
  applicant_name: string;
  applicant_document: string;
  applicant_email: string;
  enterprise_name: string;
  enterprise_activity: string;
  enterprise_address: string;
};
export type LicenseUpdate = Partial<LicenseInsert>;

export async function getLicenses() {
  const { data, error } = await (supabase as any)
    .from("licenses")
    .select(`
      *,
      assigned_profile:profiles!licenses_assigned_to_fkey(full_name, avatar_url)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as LicenseRow[];
}

export async function getLicenseById(id: string) {
  const { data, error } = await (supabase as any)
    .from("licenses")
    .select(`
      *,
      assigned_profile:profiles!licenses_assigned_to_fkey(full_name, avatar_url),
      license_documents(*),
      license_timeline(*)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createLicense(license: Omit<LicenseInsert, "protocol">) {
  const { data: protocol } = await (supabase as any).rpc("generate_protocol", { prefix: "LIC" });

  const { data, error } = await (supabase as any)
    .from("licenses")
    .insert({ ...license, protocol: protocol as string })
    .select()
    .single();

  if (error) throw error;
  return data as LicenseRow;
}

export async function updateLicense(id: string, updates: LicenseUpdate) {
  const { data, error } = await (supabase as any)
    .from("licenses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as LicenseRow;
}

export async function addLicenseTimeline(
  licenseId: string,
  userId: string | null,
  userName: string,
  action: string,
  details?: string
) {
  const { error } = await (supabase as any)
    .from("license_timeline")
    .insert({
      license_id: licenseId,
      user_id: userId,
      user_name: userName,
      action,
      details,
    });

  if (error) throw error;
}

export async function uploadLicenseDocument(
  licenseId: string,
  documentType: string,
  file: File,
  userId?: string
) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${licenseId}/${documentType}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("licenses")
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: signedUrl } = await supabase.storage
    .from("licenses")
    .createSignedUrl(fileName, 3600);

  const { data, error } = await (supabase as any)
    .from("license_documents")
    .insert({
      license_id: licenseId,
      document_type: documentType,
      file_name: file.name,
      file_path: fileName,
      file_size: file.size,
      uploaded_by: userId || null,
    })
    .select()
    .single();

  if (error) throw error;
  return { ...data, signed_url: signedUrl?.signedUrl };
}

export async function verifyDocument(
  documentId: string,
  userId: string
) {
  const { data, error } = await (supabase as any)
    .from("license_documents")
    .update({
      verified: true,
      verified_by: userId,
      verified_at: new Date().toISOString(),
    })
    .eq("id", documentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

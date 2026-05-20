import { supabase } from "@/integrations/supabase/client";

export type ComplaintStatus = "pending" | "under_analysis" | "in_progress" | "resolved" | "archived";
export type ComplaintPriority = "low" | "medium" | "high";
export type ComplaintType = "desmatamento" | "queimada" | "poluicao_hidrica" | "poluicao_ar" | "descarte_irregular" | "caca_ilegal" | "mineracao_ilegal" | "outros";

export interface ComplaintRow {
  id: string;
  protocol: string;
  type: ComplaintType;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  location: string;
  coordinates: string | null;
  description: string;
  anonymous: boolean;
  reporter_name: string | null;
  reporter_email: string | null;
  reporter_phone: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  assigned_profile?: { full_name: string; avatar_url: string | null } | null;
}

export interface ComplaintInsert {
  protocol?: string;
  type: ComplaintType;
  priority: ComplaintPriority;
  status?: ComplaintStatus;
  location: string;
  coordinates?: string | null;
  description: string;
  anonymous: boolean;
  reporter_name?: string | null;
  reporter_email?: string | null;
  reporter_phone?: string | null;
  assigned_to?: string | null;
}
export type ComplaintUpdate = Partial<ComplaintInsert>;

export async function getComplaints() {
  const { data, error } = await (supabase as any)
    .from("complaints")
    .select(`
      *,
      assigned_profile:profiles!complaints_assigned_to_fkey(full_name, avatar_url)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as ComplaintRow[];
}

export async function getComplaintById(id: string) {
  const { data, error } = await (supabase as any)
    .from("complaints")
    .select(`
      *,
      assigned_profile:profiles!complaints_assigned_to_fkey(full_name, avatar_url),
      complaint_attachments(*),
      complaint_timeline(*)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createComplaint(complaint: Omit<ComplaintInsert, "protocol">) {
  const { data: protocol } = await (supabase as any).rpc("generate_protocol", { prefix: "DEN" });
  
  const { data, error } = await (supabase as any)
    .from("complaints")
    .insert({ ...complaint, protocol: protocol as string })
    .select()
    .single();

  if (error) throw error;
  return data as ComplaintRow;
}

export async function updateComplaint(id: string, updates: ComplaintUpdate) {
  const { data, error } = await (supabase as any)
    .from("complaints")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as ComplaintRow;
}

export async function addComplaintTimeline(
  complaintId: string,
  userId: string | null,
  userName: string,
  action: string,
  details?: string
) {
  const { error } = await (supabase as any)
    .from("complaint_timeline")
    .insert({
      complaint_id: complaintId,
      user_id: userId,
      user_name: userName,
      action,
      details,
    });

  if (error) throw error;
}

export async function uploadComplaintAttachment(
  complaintId: string,
  file: File,
  userId?: string
) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${complaintId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("complaints")
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from("complaints")
    .getPublicUrl(fileName);

  const { data, error } = await (supabase as any)
    .from("complaint_attachments")
    .insert({
      complaint_id: complaintId,
      file_name: file.name,
      file_path: urlData.publicUrl,
      file_type: file.type,
      file_size: file.size,
      uploaded_by: userId || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createComplaintTracking(
  complaintId: string,
  email?: string
) {
  const { data: trackingCode } = await (supabase as any).rpc("generate_tracking_code");

  const { data, error } = await (supabase as any)
    .from("complaint_tracking")
    .insert({
      complaint_id: complaintId,
      tracking_code: trackingCode as string,
      email,
    })
    .select()
    .single();

  if (error) throw error;
  return data as { id: string; complaint_id: string; tracking_code: string; email: string | null };
}

export async function getComplaintByTrackingCode(trackingCode: string) {
  const { data: tracking, error: trackingError } = await (supabase as any)
    .from("complaint_tracking")
    .select("complaint_id")
    .eq("tracking_code", trackingCode.toUpperCase())
    .maybeSingle();

  if (trackingError) throw trackingError;
  if (!tracking) return null;

  const { data, error } = await (supabase as any)
    .from("complaints")
    .select("id, protocol, type, status, location, created_at, updated_at")
    .eq("id", tracking.complaint_id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

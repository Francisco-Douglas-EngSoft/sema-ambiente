import { supabase } from "@/integrations/supabase/client";

export async function logAuditEvent(
  action: string,
  tableName?: string,
  recordId?: string,
  details?: Record<string, unknown>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await (supabase as any).from("audit_logs").insert({
      user_id: user?.id || null,
      action,
      table_name: tableName,
      record_id: recordId,
      details: details || null,
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
}

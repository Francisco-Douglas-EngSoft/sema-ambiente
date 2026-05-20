import { supabase } from "@/integrations/supabase/client";

export interface Training {
  id: string;
  title: string;
  description: string | null;
  type: string;
  instructor: string | null;
  start_date: string | null;
  end_date: string | null;
  duration_hours: number | null;
  max_participants: number | null;
  status: string;
  created_at: string;
  participants_count?: number;
}

export interface TrainingParticipant {
  id: string;
  training_id: string;
  user_id: string;
  status: string;
  score: number | null;
  certificate_url: string | null;
  enrolled_at: string;
  completed_at: string | null;
  profile?: { full_name: string; avatar_url: string | null };
}

export interface PerformanceGoal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_value: number | null;
  current_value: number | null;
  unit: string | null;
  category: string;
  period_start: string;
  period_end: string;
  status: string;
  profile?: { full_name: string; avatar_url: string | null };
}

export interface TeamMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  position: string | null;
  department: string | null;
  avatar_url: string | null;
  roles: string[];
  created_at: string;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const { data: profiles, error } = await (supabase as any)
    .from("profiles")
    .select("*")
    .order("full_name");

  if (error) throw error;

  const { data: allRoles } = await (supabase as any)
    .from("user_roles")
    .select("user_id, role");

  return (profiles || []).map((p: any) => ({
    id: p.id,
    user_id: p.user_id,
    full_name: p.full_name,
    email: p.email,
    phone: p.phone,
    position: p.position,
    department: p.department,
    avatar_url: p.avatar_url,
    roles: (allRoles || []).filter((r: any) => r.user_id === p.user_id).map((r: any) => r.role),
    created_at: p.created_at,
  }));
}

export async function getTrainings(): Promise<Training[]> {
  const { data, error } = await (supabase as any)
    .from("trainings")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getTrainingById(id: string) {
  const { data, error } = await (supabase as any)
    .from("trainings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createTraining(training: Omit<Training, "id" | "created_at" | "participants_count">) {
  const { data, error } = await (supabase as any)
    .from("trainings")
    .insert(training)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTraining(id: string, updates: Partial<Training>) {
  const { data, error } = await (supabase as any)
    .from("trainings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPerformanceGoals(userId?: string): Promise<PerformanceGoal[]> {
  let query = (supabase as any)
    .from("performance_goals")
    .select("*")
    .order("period_end", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createPerformanceGoal(goal: Omit<PerformanceGoal, "id" | "profile">) {
  const { data, error } = await (supabase as any)
    .from("performance_goals")
    .insert(goal)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePerformanceGoal(id: string, updates: Partial<PerformanceGoal>) {
  const { data, error } = await (supabase as any)
    .from("performance_goals")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function enrollInTraining(trainingId: string, userId: string) {
  const { data, error } = await (supabase as any)
    .from("training_participants")
    .insert({
      training_id: trainingId,
      user_id: userId,
      status: "enrolled",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

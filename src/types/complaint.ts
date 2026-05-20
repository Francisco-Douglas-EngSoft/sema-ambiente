export type ComplaintStatus = "pending" | "under_analysis" | "in_progress" | "resolved" | "archived";
export type ComplaintPriority = "low" | "medium" | "high";
export type ComplaintType = 
  | "desmatamento" 
  | "queimada" 
  | "poluicao_hidrica" 
  | "poluicao_ar" 
  | "descarte_irregular" 
  | "caca_ilegal" 
  | "mineracao_ilegal" 
  | "outros";

export interface TimelineItem {
  user: string;
  action: string;
  date: string;
}

export interface Complaint {
  id: string;
  type: ComplaintType;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  location: string;
  coordinates?: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
  assignedTo?: string;
  reporterName?: string;
  reporterContact?: string;
  anonymous: boolean;
  attachments?: string[];
  timeline?: TimelineItem[];
}

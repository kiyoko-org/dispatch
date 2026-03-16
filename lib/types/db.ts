import type { Database } from '@kiyoko-org/dispatch-lib/database.types';

export type { Database };

export type CategoryRow = Database['public']['Tables']['categories']['Row'];
export type OfficerRow = Database['public']['Tables']['officers']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type ReportInsert = Database['public']['Tables']['reports']['Insert'];
export type ReportRow = Database['public']['Tables']['reports']['Row'];
export type ReportUpdate = Database['public']['Tables']['reports']['Update'];

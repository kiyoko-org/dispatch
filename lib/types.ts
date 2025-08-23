// lib/types.ts
// Shared types for the application

// ReportData: Centralized type for incident reports, derived from the original IncidentReport structure
export interface ReportData {
  // Basic Information
  incident_category: string;
  incident_subcategory: string;
  incident_title: string;
  incident_date: string;
  incident_time: string;

  // Location Information
  street_address: string;
  nearby_landmark: string;
  city: string;
  province: string;
  brief_description: string;

  // Detailed Information
  what_happened: string;
  who_was_involved: string;
  number_of_witnesses: string;
  injuries_reported: string;
  property_damage: string;
  suspect_description: string;
  witness_contact_info: string;

  // Options
  request_follow_up: boolean;
  share_with_community: boolean;
  is_anonymous: boolean;
}

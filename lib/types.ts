// lib/types.ts
// Shared types for the application

// ReportData: Centralized type for incident reports, derived from the original IncidentReport structure
export interface ReportData {
  // Basic Information
  incidentCategory: string;
  incidentSubcategory: string;
  incidentTitle: string;
  incidentDate: string;
  incidentTime: string;

  // Location Information
  streetAddress: string;
  nearbyLandmark: string;
  city: string;
  province: string;
  briefDescription: string;

  // Detailed Information
  whatHappened: string;
  whoWasInvolved: string;
  numberOfWitnesses: string;
  injuriesReported: string;
  propertyDamage: string;
  suspectDescription: string;
  witnessContactInfo: string;

  // Options
  requestFollowUp: boolean;
  shareWithCommunity: boolean;
  isAnonymous: boolean;
}

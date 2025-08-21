import { db, Report, DbResponse } from '../database';

/**
 * Service for handling incident reports
 */
export const reportService = {
  /**
   * Create a new incident report
   * @param subject The subject/title of the report
   * @param body The detailed content of the report
   * @param attachments Optional array of attachment URLs
   * @returns Promise with the created report or error
   */
  async addReport(
    subject: string, 
    body: string, 
    attachments?: string[]
  ): Promise<DbResponse<Report>> {
    // The reporter_id will be added automatically by Supabase using auth.uid()
    return db.reports.add({
      subject,
      body,
      attachments
    });
  },

  /**
   * Get all reports for the authenticated user
   * @returns Promise with array of user's reports or error
   */
  async getMyReports(): Promise<DbResponse<Report[]>> {
    return db.reports.getAll(); // RLS policies will filter to only show user's reports
  },

  /**
   * Get report details by ID (if the user has access)
   * @param id The report ID to retrieve
   * @returns Promise with the report details or error
   */
  async getReportById(id: number): Promise<DbResponse<Report>> {
    return db.reports.getById(id);
  },

  /**
   * Update an existing report (if the user is the owner)
   * @param id The report ID to update
   * @param subject Updated subject
   * @param body Updated body content
   * @param attachments Updated attachments array
   * @returns Promise with the updated report or error
   */
  async updateReport(
    id: number,
    subject?: string,
    body?: string,
    attachments?: string[]
  ): Promise<DbResponse<Report>> {
    const updates: Partial<Report> = {};
    
    if (subject !== undefined) updates.subject = subject;
    if (body !== undefined) updates.body = body;
    if (attachments !== undefined) updates.attachments = attachments;
    
    return db.reports.update(id, updates);
  },

  /**
   * Delete a report by ID (if the user is the owner)
   * @param id The report ID to delete
   * @returns Promise with success status or error
   */
  async deleteReport(id: number): Promise<DbResponse<Report>> {
    return db.reports.delete(id);
  }
};

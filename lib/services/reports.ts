import { db, Report, DbResponse } from '../database';
import { ReportData } from '../types';

/**
 * Service for handling incident reports
 */
export const reportService = {
  /**
   * Create a new incident report
   * @param reportData The complete report data
   * @returns Promise with the created report or error
   */
  async addReport(reportData: ReportData, attachments?: string[]): Promise<DbResponse<Report>> {
    // The reporter_id will be added automatically by Supabase using auth.uid()
    return db.reports.add({
      ...reportData,
      attachments,
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
   * @param updates The fields to update
   * @returns Promise with the updated report or error
   */
  async updateReport(
    id: number,
    updates: Partial<ReportData & { attachments?: string[] }>
  ): Promise<DbResponse<Report>> {
    return db.reports.update(id, updates);
  },

  /**
   * Delete a report by ID (if the user is the owner)
   * @param id The report ID to delete
   * @returns Promise with success status or error
   */
  async deleteReport(id: number): Promise<DbResponse<Report>> {
    return db.reports.delete(id);
  },
};

import { supabase } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { ReportData } from './types';

/**
 * Types for the reports table
 */
export type Report = ReportData & {
  id?: number;
  reporter_id?: string;
  created_at?: string;
  attachments?: string[];
};

/**
 * Response type for database operations
 */
export type DbResponse<T> = {
  data: T | null;
  error: PostgrestError | null;
};

/**
 * Database service for interacting with Supabase
 */
export const db = {
  reports: {
    /**
     * Add a new incident report
     * @param report The report data to add
     * @returns Promise with the created report or error
     */
    async add(report: Omit<Report, 'id' | 'created_at'>): Promise<DbResponse<Report>> {
      const { data, error } = await supabase.from('reports').insert(report).select().single();

      return { data, error };
    },

    /**
     * Get all reports
     * @returns Promise with array of reports or error
     */
    async getAll(): Promise<DbResponse<Report[]>> {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      return { data, error };
    },

    /**
     * Get a single report by ID
     * @param id The report ID to retrieve
     * @returns Promise with the report or error
     */
    async getById(id: number): Promise<DbResponse<Report>> {
      const { data, error } = await supabase.from('reports').select('*').eq('id', id).single();

      return { data, error };
    },

    /**
     * Get reports by reporter ID (user)
     * @param reporterId The UUID of the user who created the reports
     * @returns Promise with array of reports or error
     */
    async getByReporterId(reporterId: string): Promise<DbResponse<Report[]>> {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('reporter_id', reporterId)
        .order('created_at', { ascending: false });

      return { data, error };
    },

    /**
     * Update an existing report
     * @param id The report ID to update
     * @param updates The fields to update
     * @returns Promise with the updated report or error
     */
    async update(
      id: number,
      updates: Partial<Omit<Report, 'id' | 'reporter_id' | 'created_at'>>
    ): Promise<DbResponse<Report>> {
      const { data, error } = await supabase
        .from('reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    },

    /**
     * Delete a report by ID
     * @param id The report ID to delete
     * @returns Promise with the deleted report or error
     */
    async delete(id: number): Promise<DbResponse<Report>> {
      const { data, error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    },
  },
};

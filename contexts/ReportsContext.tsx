import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useAuthContext } from 'components/AuthProvider';
import { useResilientRealtimeChannel } from 'hooks/useResilientRealtimeChannel';
import { supabase } from 'lib/supabase';
import type { ReportInsert, ReportRow } from 'lib/types/db';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type ReportStatusChange = {
  reportId: number;
  oldStatus: string;
  newStatus: string;
  incidentTitle: string;
  changedAt: string;
};

type CreateReportResult = {
  data: ReportRow | null;
  error: string | null;
};

type ReportsContextValue = {
  reports: ReportRow[];
  currentUserReports: ReportRow[];
  loading: boolean;
  error: string | null;
  isRealtimeConnected: boolean;
  refresh: () => Promise<void>;
  getReportById: (id: number) => ReportRow | null;
  fetchReportById: (id: number) => Promise<ReportRow | null>;
  createReport: (payload: ReportInsert) => Promise<CreateReportResult>;
  lastStatusChange: ReportStatusChange | null;
  clearLastStatusChange: () => void;
};

const ReportsContext = createContext<ReportsContextValue | undefined>(undefined);

function sortReportsByNewest(reports: ReportRow[]) {
  return [...reports].sort((left, right) => {
    const leftCreatedAt = new Date(left.created_at).getTime();
    const rightCreatedAt = new Date(right.created_at).getTime();

    if (leftCreatedAt === rightCreatedAt) {
      return right.id - left.id;
    }

    return rightCreatedAt - leftCreatedAt;
  });
}

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuthContext();
  const userId = session?.user?.id ?? null;

  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastStatusChange, setLastStatusChange] = useState<ReportStatusChange | null>(null);

  const reportsRef = useRef<ReportRow[]>([]);

  const applyReports = useCallback((nextReports: ReportRow[]) => {
    const sortedReports = sortReportsByNewest(nextReports);
    reportsRef.current = sortedReports;
    setReports(sortedReports);
  }, []);

  const refreshReports = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!userId) {
        applyReports([]);
        setError(null);
        setLoading(false);
        return;
      }

      const shouldShowLoading = !silent || reportsRef.current.length === 0;

      if (shouldShowLoading) {
        setLoading(true);
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) {
          setError(fetchError.message);
          return;
        }

        applyReports(data ?? []);
        setError(null);
      } catch (refreshError) {
        setError(refreshError instanceof Error ? refreshError.message : 'Failed to load reports');
      } finally {
        if (shouldShowLoading) {
          setLoading(false);
        }
      }
    },
    [applyReports, userId]
  );

  const refresh = useCallback(async () => {
    await refreshReports();
  }, [refreshReports]);

  const getReportById = useCallback((id: number) => {
    return reportsRef.current.find((report) => report.id === id) ?? null;
  }, []);

  const upsertReport = useCallback(
    (nextReport: ReportRow) => {
      const currentReports = reportsRef.current;
      const nextReports = currentReports.some((report) => report.id === nextReport.id)
        ? currentReports.map((report) => (report.id === nextReport.id ? nextReport : report))
        : [nextReport, ...currentReports];

      applyReports(nextReports);
    },
    [applyReports]
  );

  const fetchReportById = useCallback(
    async (id: number) => {
      if (!userId) {
        return null;
      }

      const existingReport = getReportById(id);
      if (existingReport) {
        return existingReport;
      }

      const { data, error: fetchError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) {
        setError(fetchError.message);
        return null;
      }

      if (!data) {
        return null;
      }

      upsertReport(data);
      setError(null);
      return data;
    },
    [getReportById, upsertReport, userId]
  );

  const createReport = useCallback(
    async (payload: ReportInsert): Promise<CreateReportResult> => {
      if (!userId) {
        return {
          data: null,
          error: 'No active session found',
        };
      }

      const { data, error: createError } = await supabase
        .from('reports')
        .insert(payload)
        .select()
        .single();

      if (createError) {
        setError(createError.message);
        return {
          data: null,
          error: createError.message,
        };
      }

      upsertReport(data);
      setError(null);

      return {
        data,
        error: null,
      };
    },
    [upsertReport, userId]
  );

  const handleInsert = useCallback(
    (report: ReportRow) => {
      upsertReport(report);
      setError(null);
    },
    [upsertReport]
  );

  const handleUpdate = useCallback(
    (report: ReportRow) => {
      const previousReport = reportsRef.current.find(
        (currentReport) => currentReport.id === report.id
      );

      if (
        previousReport &&
        previousReport.status !== report.status &&
        report.reporter_id === userId
      ) {
        setLastStatusChange({
          reportId: report.id,
          oldStatus: previousReport.status,
          newStatus: report.status,
          incidentTitle: report.incident_title ?? 'Incident Report',
          changedAt: new Date().toISOString(),
        });
      }

      upsertReport(report);
      setError(null);
    },
    [upsertReport, userId]
  );

  const handleDelete = useCallback(
    (reportId: number) => {
      applyReports(reportsRef.current.filter((report) => report.id !== reportId));
      setError(null);
    },
    [applyReports]
  );

  const createChannel = useCallback(() => {
    return supabase.channel('reports-store').on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reports',
      },
      (payload: RealtimePostgresChangesPayload<ReportRow>) => {
        switch (payload.eventType) {
          case 'INSERT': {
            handleInsert(payload.new as ReportRow);
            return;
          }
          case 'UPDATE': {
            handleUpdate(payload.new as ReportRow);
            return;
          }
          case 'DELETE': {
            const deletedId = payload.old.id;
            if (typeof deletedId === 'number') {
              handleDelete(deletedId);
            }
            return;
          }
          default:
            return;
        }
      }
    );
  }, [handleDelete, handleInsert, handleUpdate]);

  const { isConnected: isRealtimeConnected } = useResilientRealtimeChannel({
    channelName: 'reports-store',
    enabled: Boolean(userId),
    createChannel,
    onReconnect: useCallback(async () => {
      await refreshReports({ silent: true });
    }, [refreshReports]),
  });

  useEffect(() => {
    if (!userId) {
      applyReports([]);
      setError(null);
      setLastStatusChange(null);
      setLoading(false);
      return;
    }

    void refreshReports();
  }, [applyReports, refreshReports, userId]);

  const currentUserReports = useMemo(() => {
    if (!userId) {
      return [];
    }

    return reports.filter((report) => report.reporter_id === userId);
  }, [reports, userId]);

  const clearLastStatusChange = useCallback(() => {
    setLastStatusChange(null);
  }, []);

  const value = useMemo<ReportsContextValue>(
    () => ({
      reports,
      currentUserReports,
      loading,
      error,
      isRealtimeConnected,
      refresh,
      getReportById,
      fetchReportById,
      createReport,
      lastStatusChange,
      clearLastStatusChange,
    }),
    [
      clearLastStatusChange,
      createReport,
      currentUserReports,
      error,
      fetchReportById,
      getReportById,
      isRealtimeConnected,
      lastStatusChange,
      loading,
      refresh,
      reports,
    ]
  );

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

export function useReportsStore() {
  const context = useContext(ReportsContext);

  if (!context) {
    throw new Error('useReportsStore must be used within a ReportsProvider');
  }

  return context;
}

import { useEffect, useRef, useState } from 'react';
import { useReports } from '@kiyoko-org/dispatch-lib';
import { useAuthContext } from 'components/AuthProvider';
import { supabase } from 'lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ReportStatusChange {
  reportId: string;
  oldStatus: string;
  newStatus: string;
  incidentTitle: string;
}

let statusChangeCallback: ((change: ReportStatusChange) => void) | null = null;

export function setStatusChangeCallback(callback: (change: ReportStatusChange) => void) {
  statusChangeCallback = callback;
}

export function useRealtimeReports() {
  const { session } = useAuthContext();
  const { reports: allReports, fetchReports } = useReports();
  const [userReports, setUserReports] = useState<any[]>([]);
  const [realtimeLoading, setRealtimeLoading] = useState(false);
  const previousReportsRef = useRef<any[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    const userReportsFiltered = allReports.filter(report => report.reporter_id === session.user.id.toString());
    setUserReports(userReportsFiltered);

    // Detect status changes
    const previousReports = previousReportsRef.current;
    const statusChanges: ReportStatusChange[] = [];

    userReportsFiltered.forEach(currentReport => {
      const previousReport = previousReports.find(r => r.id === currentReport.id);
      if (previousReport && previousReport.status !== currentReport.status) {
        statusChanges.push({
          reportId: currentReport.id.toString(),
          oldStatus: previousReport.status,
          newStatus: currentReport.status,
          incidentTitle: currentReport.incident_title || 'Incident Report',
        });
      }
    });

    // Trigger callback for status changes
    statusChanges.forEach(change => {
      if (statusChangeCallback) {
        statusChangeCallback(change);
      }
    });

    previousReportsRef.current = userReportsFiltered;
  }, [allReports, session?.user?.id]);

  // Set up real-time subscription
  useEffect(() => {
    if (!session?.user?.id) return;

    setRealtimeLoading(true);

    // Subscribe to changes on reports table for the current user
    const channel = supabase
      .channel('user-reports-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reports',
          filter: `reporter_id=eq.${session.user.id.toString()}`,
        },
        async (payload) => {
          console.log('Real-time report update:', payload);

          // Check if status changed
          const oldReport = payload.old as any;
          const newReport = payload.new as any;

          if (oldReport.status !== newReport.status) {
            const statusChange: ReportStatusChange = {
              reportId: newReport.id.toString(),
              oldStatus: oldReport.status,
              newStatus: newReport.status,
              incidentTitle: newReport.incident_title || 'Incident Report',
            };

            if (statusChangeCallback) {
              statusChangeCallback(statusChange);
            }
          }

          // Refresh reports to get the latest data
          await fetchReports?.();
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setRealtimeLoading(false);
      });

    channelRef.current = channel;

    // Cleanup function
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [session?.user?.id, fetchReports]);

  return {
    reports: userReports,
    loading: realtimeLoading,
    fetchReports,
  };
}

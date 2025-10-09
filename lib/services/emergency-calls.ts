import { db, DbResponse } from '../database';
import { EmergencyCallLog } from '../types';
import { supabase } from '../supabase';

export const emergencyCallService = {
  async logEmergencyCall(
    calledNumber: string,
    callerNumber?: string,
    callType: 'police' | 'fire' | 'medical' | 'general' = 'general',
    locationLat?: number,
    locationLng?: number,
    outcome: 'initiated' | 'failed' | 'completed' = 'initiated'
  ): Promise<DbResponse<EmergencyCallLog>> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        data: null,
        error: {
          message: 'User not authenticated',
          code: 'UNAUTHENTICATED',
          hint: '',
          details: '',
          name: 'AuthError',
        },
      };
    }

    return db.emergencyCalls.add({
      user_id: user.id,
      called_number: calledNumber,
      caller_number: callerNumber,
      call_type: callType,
      location_lat: locationLat,
      location_lng: locationLng,
      outcome,
    });
  },

  async getMyEmergencyCalls(): Promise<DbResponse<EmergencyCallLog[]>> {
    return db.emergencyCalls.getAll();
  },

  async getEmergencyCallById(id: string): Promise<DbResponse<EmergencyCallLog>> {
    return db.emergencyCalls.getById(id);
  },

  async updateEmergencyCallOutcome(
    id: string,
    outcome: 'initiated' | 'failed' | 'completed'
  ): Promise<DbResponse<EmergencyCallLog>> {
    return db.emergencyCalls.update(id, { outcome });
  },

  async deleteEmergencyCall(id: string): Promise<DbResponse<EmergencyCallLog>> {
    return db.emergencyCalls.delete(id);
  },
};

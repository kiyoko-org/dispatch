import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabase';
import { EmergencyContact } from '../types';

const QUICK_CONTACTS_KEY = '@dispatch/quick_contacts';
const COMMUNITY_CONTACTS_KEY = '@dispatch/community_contacts';
const EMERGENCY_CONTACTS_KEY = '@dispatch/emergency_contacts';
const HOTLINES_KEY = 'hotlines';
const HOTLINE_GROUPS_KEY = '@dispatch/hotline_groups';
const LAST_SYNC_KEY = '@dispatch/last_sync';

export interface Hotline {
  id: string;
  name: string;
  number: string;
  category: string;
  description?: string;
}

export interface HotlineGroup {
  id: string;
  name: string;
  hotlineIds: string[];
}

export interface UserData {
  contacts: {
    quick: EmergencyContact[];
    community: EmergencyContact[];
    emergency: EmergencyContact[];
  };
  hotlines: Hotline[];
  hotlineGroups: HotlineGroup[];
  lastModified: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export class UserDataService {
  private static syncInProgress = false;

  /**
   * Get all user data from AsyncStorage
   */
  static async getLocalData(): Promise<UserData> {
    try {
      const [quickContacts, communityContacts, emergencyContacts, hotlines, hotlineGroups] = await Promise.all([
        AsyncStorage.getItem(QUICK_CONTACTS_KEY),
        AsyncStorage.getItem(COMMUNITY_CONTACTS_KEY),
        AsyncStorage.getItem(EMERGENCY_CONTACTS_KEY),
        AsyncStorage.getItem(HOTLINES_KEY),
        AsyncStorage.getItem(HOTLINE_GROUPS_KEY),
      ]);

      return {
        contacts: {
          quick: quickContacts ? JSON.parse(quickContacts) : [],
          community: communityContacts ? JSON.parse(communityContacts) : [],
          emergency: emergencyContacts ? JSON.parse(emergencyContacts) : [],
        },
        hotlines: hotlines ? JSON.parse(hotlines) : [],
        hotlineGroups: hotlineGroups ? JSON.parse(hotlineGroups) : [],
        lastModified: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting local data:', error);
      return {
        contacts: { quick: [], community: [], emergency: [] },
        hotlines: [],
        hotlineGroups: [],
        lastModified: new Date().toISOString(),
      };
    }
  }

  /**
   * Save all user data to AsyncStorage
   */
  static async saveLocalData(data: UserData): Promise<boolean> {
    try {
      await Promise.all([
        AsyncStorage.setItem(QUICK_CONTACTS_KEY, JSON.stringify(data.contacts.quick)),
        AsyncStorage.setItem(COMMUNITY_CONTACTS_KEY, JSON.stringify(data.contacts.community)),
        AsyncStorage.setItem(EMERGENCY_CONTACTS_KEY, JSON.stringify(data.contacts.emergency)),
        AsyncStorage.setItem(HOTLINES_KEY, JSON.stringify(data.hotlines)),
        AsyncStorage.setItem(HOTLINE_GROUPS_KEY, JSON.stringify(data.hotlineGroups || [])),
      ]);
      return true;
    } catch (error) {
      console.error('Error saving local data:', error);
      return false;
    }
  }

  /**
   * Get user data from Supabase
   */
  static async getRemoteData(): Promise<UserData | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user logged in, skipping remote fetch');
        return null;
      }

      const { data, error } = await supabase
        .from('user_data')
        .select('settings_json')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data exists yet, return null
          return null;
        }
        console.error('Error fetching remote data:', error);
        return null;
      }

      return data?.settings_json as UserData;
    } catch (error) {
      console.error('Error getting remote data:', error);
      return null;
    }
  }

  /**
   * Save user data to Supabase
   */
  static async saveRemoteData(data: UserData): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user logged in, skipping remote save');
        return false;
      }

      data.lastModified = new Date().toISOString();

      const { error } = await supabase
        .from('user_data')
        .upsert({
          id: user.id,
          settings_json: data,
        });

      if (error) {
        console.error('Error saving remote data:', error);
        return false;
      }

      await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Error saving remote data:', error);
      return false;
    }
  }

  /**
   * Sync local data to remote (upload)
   */
  static async syncToRemote(): Promise<{ success: boolean; error?: string }> {
    try {
      const localData = await this.getLocalData();
      const success = await this.saveRemoteData(localData);
      
      if (!success) {
        return { success: false, error: 'Failed to save to remote' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error syncing to remote:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Sync remote data to local (download)
   */
  static async syncFromRemote(): Promise<{ success: boolean; error?: string }> {
    try {
      const remoteData = await this.getRemoteData();
      
      if (!remoteData) {
        // No remote data, upload local data
        return await this.syncToRemote();
      }

      const success = await this.saveLocalData(remoteData);
      
      if (!success) {
        return { success: false, error: 'Failed to save local data' };
      }

      await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      return { success: true };
    } catch (error) {
      console.error('Error syncing from remote:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Check if remote data has actual content
   */
  private static hasContent(data: UserData | null): boolean {
    if (!data) return false;
    
    const hasContacts = 
      data.contacts?.quick?.length > 0 ||
      data.contacts?.community?.length > 0 ||
      data.contacts?.emergency?.length > 0;
    
    const hasHotlines = data.hotlines?.length > 0;
    
    return hasContacts || hasHotlines;
  }

  /**
   * Two-way sync with conflict resolution (server wins)
   */
  static async sync(): Promise<{ success: boolean; error?: string }> {
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping');
      return { success: false, error: 'Sync already in progress' };
    }

    this.syncInProgress = true;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user logged in, skipping sync');
        this.syncInProgress = false;
        return { success: false, error: 'No user logged in' };
      }

      const [localData, remoteData] = await Promise.all([
        this.getLocalData(),
        this.getRemoteData(),
      ]);

      const hasLocalContent = this.hasContent(localData);
      const hasRemoteContent = this.hasContent(remoteData);

      // If no remote data or remote is empty, upload local data
      if (!remoteData || !hasRemoteContent) {
        if (hasLocalContent) {
          // Upload local data if it has content
          const result = await this.saveRemoteData(localData);
          this.syncInProgress = false;
          return result 
            ? { success: true } 
            : { success: false, error: 'Failed to upload initial data' };
        } else {
          // Both empty, nothing to sync
          this.syncInProgress = false;
          return { success: true };
        }
      }

      // If local is empty but remote has content, download
      if (!hasLocalContent && hasRemoteContent) {
        await this.saveLocalData(remoteData);
        await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
        this.syncInProgress = false;
        return { success: true };
      }

      // Both have content, compare timestamps - server wins in case of conflict
      const localTime = new Date(localData.lastModified).getTime();
      const remoteTime = new Date(remoteData.lastModified).getTime();

      if (remoteTime > localTime) {
        // Remote is newer, download
        await this.saveLocalData(remoteData);
      } else if (localTime > remoteTime) {
        // Local is newer, upload
        await this.saveRemoteData(localData);
      }

      await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      this.syncInProgress = false;
      return { success: true };
    } catch (error) {
      console.error('Error during sync:', error);
      this.syncInProgress = false;
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get last sync timestamp
   */
  static async getLastSyncTime(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(LAST_SYNC_KEY);
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }

  /**
   * Check if sync is needed (based on time elapsed)
   */
  static async shouldSync(intervalMinutes: number = 5): Promise<boolean> {
    try {
      const lastSync = await this.getLastSyncTime();
      if (!lastSync) return true;

      const lastSyncTime = new Date(lastSync).getTime();
      const now = new Date().getTime();
      const diffMinutes = (now - lastSyncTime) / 1000 / 60;

      return diffMinutes >= intervalMinutes;
    } catch (error) {
      console.error('Error checking sync needed:', error);
      return true;
    }
  }
}

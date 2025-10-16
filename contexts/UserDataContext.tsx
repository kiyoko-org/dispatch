import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserDataService, UserData, SyncStatus, Hotline } from '../lib/services/user-data.service';
import { EmergencyContact, ContactStorageType } from '../lib/types';
import { supabase } from '../lib/supabase';

interface UserDataContextType {
  // Data
  quickContacts: EmergencyContact[];
  communityContacts: EmergencyContact[];
  emergencyContacts: EmergencyContact[];
  hotlines: Hotline[];
  
  // Sync status
  syncStatus: SyncStatus;
  lastSyncTime: string | null;
  syncError: string | null;
  
  // Actions
  addContact: (phoneNumber: string, type: ContactStorageType, name?: string) => Promise<boolean>;
  deleteContact: (contactId: string, type: ContactStorageType) => Promise<boolean>;
  clearContacts: (type: ContactStorageType) => Promise<boolean>;
  
  addHotline: (hotline: Omit<Hotline, 'id'>) => Promise<boolean>;
  deleteHotline: (hotlineId: string) => Promise<boolean>;
  
  sync: () => Promise<void>;
  forceSync: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

interface UserDataProviderProps {
  children: ReactNode;
}

export function UserDataProvider({ children }: UserDataProviderProps) {
  const [quickContacts, setQuickContacts] = useState<EmergencyContact[]>([]);
  const [communityContacts, setCommunityContacts] = useState<EmergencyContact[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [hotlines, setHotlines] = useState<Hotline[]>([]);
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Load data from AsyncStorage on mount
  const loadLocalData = useCallback(async () => {
    try {
      const data = await UserDataService.getLocalData();
      setQuickContacts(data.contacts.quick);
      setCommunityContacts(data.contacts.community);
      setEmergencyContacts(data.contacts.emergency);
      setHotlines(data.hotlines);
      
      const lastSync = await UserDataService.getLastSyncTime();
      setLastSyncTime(lastSync);
    } catch (error) {
      console.error('Error loading local data:', error);
    }
  }, []);

  // Sync data with server
  const sync = useCallback(async (force: boolean = false) => {
    try {
      setSyncStatus('syncing');
      setSyncError(null);

      // Check if sync is needed
      if (!force) {
        const shouldSync = await UserDataService.shouldSync(5);
        if (!shouldSync) {
          setSyncStatus('synced');
          return;
        }
      }

      const result = await UserDataService.sync();

      if (result.success) {
        // Reload local data after sync
        await loadLocalData();
        setSyncStatus('synced');
        
        // Auto-reset to idle after 2 seconds
        setTimeout(() => setSyncStatus('idle'), 2000);
      } else {
        setSyncStatus('error');
        setSyncError(result.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Error during sync:', error);
      setSyncStatus('error');
      setSyncError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [loadLocalData]);

  const forceSync = useCallback(() => sync(true), [sync]);

  // Add contact
  const addContact = useCallback(async (phoneNumber: string, type: ContactStorageType, name?: string): Promise<boolean> => {
    try {
      const contact: EmergencyContact = {
        id: Date.now().toString(),
        phoneNumber,
        name,
        type,
        createdAt: new Date().toISOString(),
      };

      // Check for duplicates
      const existingContacts = 
        type === 'quick' ? quickContacts : 
        type === 'community' ? communityContacts : 
        emergencyContacts;
      
      if (existingContacts.some(c => c.phoneNumber === phoneNumber)) {
        return false;
      }

      // Update state
      const updatedContacts = [...existingContacts, contact];
      if (type === 'quick') setQuickContacts(updatedContacts);
      else if (type === 'community') setCommunityContacts(updatedContacts);
      else setEmergencyContacts(updatedContacts);

      // Save to storage
      const currentData = await UserDataService.getLocalData();
      currentData.contacts[type] = updatedContacts;
      await UserDataService.saveLocalData(currentData);

      // Force immediate sync after mutation
      forceSync();

      return true;
    } catch (error) {
      console.error('Error adding contact:', error);
      return false;
    }
  }, [quickContacts, communityContacts, emergencyContacts, forceSync]);

  // Delete contact
  const deleteContact = useCallback(async (contactId: string, type: ContactStorageType): Promise<boolean> => {
    try {
      const existingContacts = 
        type === 'quick' ? quickContacts : 
        type === 'community' ? communityContacts : 
        emergencyContacts;
      
      const updatedContacts = existingContacts.filter(c => c.id !== contactId);

      // Update state
      if (type === 'quick') setQuickContacts(updatedContacts);
      else if (type === 'community') setCommunityContacts(updatedContacts);
      else setEmergencyContacts(updatedContacts);

      // Save to storage
      const currentData = await UserDataService.getLocalData();
      currentData.contacts[type] = updatedContacts;
      await UserDataService.saveLocalData(currentData);

      // Force immediate sync after mutation
      forceSync();

      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      return false;
    }
  }, [quickContacts, communityContacts, emergencyContacts, forceSync]);

  // Clear contacts
  const clearContacts = useCallback(async (type: ContactStorageType): Promise<boolean> => {
    try {
      // Update state
      if (type === 'quick') setQuickContacts([]);
      else if (type === 'community') setCommunityContacts([]);
      else setEmergencyContacts([]);

      // Save to storage
      const currentData = await UserDataService.getLocalData();
      currentData.contacts[type] = [];
      await UserDataService.saveLocalData(currentData);

      // Force immediate sync after mutation
      forceSync();

      return true;
    } catch (error) {
      console.error('Error clearing contacts:', error);
      return false;
    }
  }, [forceSync]);

  // Add hotline
  const addHotline = useCallback(async (hotline: Omit<Hotline, 'id'>): Promise<boolean> => {
    try {
      const newHotline: Hotline = {
        ...hotline,
        id: Date.now().toString(),
      };

      const updatedHotlines = [...hotlines, newHotline];
      setHotlines(updatedHotlines);

      // Save to storage
      const currentData = await UserDataService.getLocalData();
      currentData.hotlines = updatedHotlines;
      await UserDataService.saveLocalData(currentData);

      // Force immediate sync after mutation
      forceSync();

      return true;
    } catch (error) {
      console.error('Error adding hotline:', error);
      return false;
    }
  }, [hotlines, forceSync]);

  // Delete hotline
  const deleteHotline = useCallback(async (hotlineId: string): Promise<boolean> => {
    try {
      const updatedHotlines = hotlines.filter(h => h.id !== hotlineId);
      setHotlines(updatedHotlines);

      // Save to storage
      const currentData = await UserDataService.getLocalData();
      currentData.hotlines = updatedHotlines;
      await UserDataService.saveLocalData(currentData);

      // Force immediate sync after mutation
      forceSync();

      return true;
    } catch (error) {
      console.error('Error deleting hotline:', error);
      return false;
    }
  }, [hotlines, forceSync]);

  // Load data on mount and trigger initial sync
  useEffect(() => {
    const initialize = async () => {
      await loadLocalData();
      // Trigger initial sync after loading local data
      sync();
    };
    initialize();
  }, [loadLocalData, sync]);

  // Sync on mount and when auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in, syncing data');
        sync(true);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing remote sync');
        setSyncStatus('idle');
        setLastSyncTime(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [sync]);



  return (
    <UserDataContext.Provider
      value={{
        quickContacts,
        communityContacts,
        emergencyContacts,
        hotlines,
        syncStatus,
        lastSyncTime,
        syncError,
        addContact,
        deleteContact,
        clearContacts,
        addHotline,
        deleteHotline,
        sync,
        forceSync,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}

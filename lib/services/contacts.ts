import { EmergencyContact, ContactStorageType } from '../types';
import { UserDataService } from './user-data.service';

/**
 * @deprecated Use UserDataContext (useUserData hook) instead for better state management and sync
 * This service is kept for backward compatibility
 */
export class ContactsService {
  /**
   * Save an emergency contact
   * @deprecated Use useUserData().addContact() instead
   */
  static async saveContact(phoneNumber: string, type: ContactStorageType, name?: string): Promise<boolean> {
    try {
      const contact: EmergencyContact = {
        id: Date.now().toString(),
        phoneNumber,
        name,
        type,
        createdAt: new Date().toISOString(),
      };

      const currentData = await UserDataService.getLocalData();
      const existingContacts = currentData.contacts[type];
      
      // Check if contact already exists
      const contactExists = existingContacts.some(c => c.phoneNumber === phoneNumber);
      if (contactExists) {
        return false; // Contact already exists
      }

      currentData.contacts[type] = [...existingContacts, contact];
      await UserDataService.saveLocalData(currentData);
      
      // Trigger sync in background
      UserDataService.syncToRemote().catch(err => 
        console.error('Background sync failed:', err)
      );
      
      return true;
    } catch (error) {
      console.error('Error saving contact:', error);
      return false;
    }
  }

  /**
   * Get contacts by type
   * @deprecated Use useUserData() context values instead
   */
  static async getContacts(type: ContactStorageType): Promise<EmergencyContact[]> {
    try {
      const data = await UserDataService.getLocalData();
      return data.contacts[type];
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
    }
  }

  /**
   * Delete a contact
   * @deprecated Use useUserData().deleteContact() instead
   */
  static async deleteContact(contactId: string, type: ContactStorageType): Promise<boolean> {
    try {
      const currentData = await UserDataService.getLocalData();
      currentData.contacts[type] = currentData.contacts[type].filter(c => c.id !== contactId);
      
      await UserDataService.saveLocalData(currentData);
      
      // Trigger sync in background
      UserDataService.syncToRemote().catch(err => 
        console.error('Background sync failed:', err)
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      return false;
    }
  }

  /**
   * Clear all contacts of a specific type
   * @deprecated Use useUserData().clearContacts() instead
   */
  static async clearContacts(type: ContactStorageType): Promise<boolean> {
    try {
      const currentData = await UserDataService.getLocalData();
      currentData.contacts[type] = [];
      
      await UserDataService.saveLocalData(currentData);
      
      // Trigger sync in background
      UserDataService.syncToRemote().catch(err => 
        console.error('Background sync failed:', err)
      );
      
      return true;
    } catch (error) {
      console.error('Error clearing contacts:', error);
      return false;
    }
  }
}

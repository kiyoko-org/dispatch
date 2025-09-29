import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmergencyContact, ContactStorageType } from '../types';

const QUICK_CONTACTS_KEY = '@dispatch/quick_contacts';
const COMMUNITY_CONTACTS_KEY = '@dispatch/community_contacts';
const EMERGENCY_CONTACTS_KEY = '@dispatch/emergency_contacts';

export class ContactsService {
  /**
   * Save an emergency contact
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

      const storageKey = 
        type === 'quick' ? QUICK_CONTACTS_KEY : 
        type === 'community' ? COMMUNITY_CONTACTS_KEY : 
        EMERGENCY_CONTACTS_KEY;
      const existingContacts = await this.getContacts(type);
      
      // Check if contact already exists
      const contactExists = existingContacts.some(c => c.phoneNumber === phoneNumber);
      if (contactExists) {
        return false; // Contact already exists
      }

      const updatedContacts = [...existingContacts, contact];
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedContacts));
      
      return true;
    } catch (error) {
      console.error('Error saving contact:', error);
      return false;
    }
  }

  /**
   * Get contacts by type
   */
  static async getContacts(type: ContactStorageType): Promise<EmergencyContact[]> {
    try {
      const storageKey = 
        type === 'quick' ? QUICK_CONTACTS_KEY : 
        type === 'community' ? COMMUNITY_CONTACTS_KEY : 
        EMERGENCY_CONTACTS_KEY;
      const contactsJson = await AsyncStorage.getItem(storageKey);
      
      if (!contactsJson) {
        return [];
      }

      return JSON.parse(contactsJson);
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
    }
  }

  /**
   * Delete a contact
   */
  static async deleteContact(contactId: string, type: ContactStorageType): Promise<boolean> {
    try {
      const existingContacts = await this.getContacts(type);
      const updatedContacts = existingContacts.filter(c => c.id !== contactId);
      
      const storageKey = 
        type === 'quick' ? QUICK_CONTACTS_KEY : 
        type === 'community' ? COMMUNITY_CONTACTS_KEY : 
        EMERGENCY_CONTACTS_KEY;
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedContacts));
      
      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      return false;
    }
  }

  /**
   * Clear all contacts of a specific type
   */
  static async clearContacts(type: ContactStorageType): Promise<boolean> {
    try {
      const storageKey = 
        type === 'quick' ? QUICK_CONTACTS_KEY : 
        type === 'community' ? COMMUNITY_CONTACTS_KEY : 
        EMERGENCY_CONTACTS_KEY;
      await AsyncStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error('Error clearing contacts:', error);
      return false;
    }
  }
}

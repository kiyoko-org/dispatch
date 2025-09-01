import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface EmergencyContact {
  id: string;
  name: string;
  number: string;
}

export interface QuickContact {
  id: string;
  name: string;
  number: string;
}

interface EmergencyContactsContextType {
  quickContacts: QuickContact[];
  communityContacts: EmergencyContact[];
  addQuickContact: (contact: QuickContact) => void;
  addCommunityContact: (contact: EmergencyContact) => void;
  removeQuickContact: (id: string) => void;
  removeCommunityContact: (id: string) => void;
}

const EmergencyContactsContext = createContext<EmergencyContactsContextType | undefined>(undefined);

export const EmergencyContactsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [quickContacts, setQuickContacts] = useState<QuickContact[]>([]);
  const [communityContacts, setCommunityContacts] = useState<EmergencyContact[]>([]);

  const addQuickContact = (contact: QuickContact) => {
    setQuickContacts(prev => [...prev, contact]);
  };

  const addCommunityContact = (contact: EmergencyContact) => {
    setCommunityContacts(prev => [...prev, contact]);
  };

  const removeQuickContact = (id: string) => {
    setQuickContacts(prev => prev.filter(contact => contact.id !== id));
  };

  const removeCommunityContact = (id: string) => {
    setCommunityContacts(prev => prev.filter(contact => contact.id !== id));
  };

  return (
    <EmergencyContactsContext.Provider value={{
      quickContacts,
      communityContacts,
      addQuickContact,
      addCommunityContact,
      removeQuickContact,
      removeCommunityContact
    }}>
      {children}
    </EmergencyContactsContext.Provider>
  );
};

export const useEmergencyContacts = () => {
  const context = useContext(EmergencyContactsContext);
  if (context === undefined) {
    throw new Error('useEmergencyContacts must be used within an EmergencyContactsProvider');
  }
  return context;
};

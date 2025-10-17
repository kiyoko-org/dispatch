# User Data Sync System

This document describes the new user data sync system that synchronizes contacts and hotlines between local storage (AsyncStorage) and Supabase.

## Architecture

```
┌─────────────────┐
│   Components    │
│  (UI Layer)     │
└────────┬────────┘
         │
         │ useUserData()
         │
┌────────▼────────┐
│ UserDataContext │
│  (State Mgmt)   │
└────────┬────────┘
         │
┌────────▼────────┐
│ UserDataService │
│  (Sync Logic)   │
└────┬───────┬────┘
     │       │
     │       │
┌────▼──┐ ┌──▼─────┐
│ Local │ │ Remote │
│ Store │ │ Supabase│
└───────┘ └────────┘
```

## Components

### 1. UserDataService (`lib/services/user-data.service.ts`)

Core service that handles all sync operations between local AsyncStorage and Supabase.

**Key Methods:**
- `getLocalData()` - Retrieve all user data from AsyncStorage
- `saveLocalData(data)` - Save all user data to AsyncStorage
- `getRemoteData()` - Retrieve user data from Supabase
- `saveRemoteData(data)` - Save user data to Supabase
- `sync()` - Two-way sync with conflict resolution (server wins)
- `syncToRemote()` - Upload local data to server
- `syncFromRemote()` - Download server data to local
- `shouldSync(intervalMinutes)` - Check if sync is needed

**Data Structure:**
```typescript
interface UserData {
  contacts: {
    quick: EmergencyContact[];
    community: EmergencyContact[];
    emergency: EmergencyContact[];
  };
  hotlines: Hotline[];
  lastModified: string;
}
```

### 2. UserDataContext (`contexts/UserDataContext.tsx`)

React Context that provides:
- Real-time state management for contacts and hotlines
- Sync status tracking
- CRUD operations with automatic background sync
- Auto-sync on auth state changes and app focus

**Hook: `useUserData()`**

```typescript
const {
  // Data
  quickContacts,
  communityContacts,
  emergencyContacts,
  hotlines,
  
  // Sync status
  syncStatus,      // 'idle' | 'syncing' | 'synced' | 'error'
  lastSyncTime,
  syncError,
  
  // Actions
  addContact,
  deleteContact,
  clearContacts,
  addHotline,
  deleteHotline,
  sync,
  forceSync,
} = useUserData();
```

### 3. SyncIndicator Component (`components/SyncIndicator.tsx`)

Visual component showing sync status:
- 🔄 Spinning icon when syncing
- ☁️ Green cloud when synced
- ⚠️ Red warning when error
- ☁️ Gray cloud when offline

**Usage:**
```tsx
<SyncIndicator />          // Full indicator with text
<SyncIndicator compact />  // Icon only
```

## Setup

### Database Schema

Create the `user_data` table in Supabase:

```sql
CREATE TABLE user_data (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  settings_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY "Users can manage their own data"
  ON user_data
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Provider Setup

The `UserDataProvider` is already added to the app root in `app/_layout.tsx`:

```tsx
<UserDataProvider>
  <Stack>...</Stack>
</UserDataProvider>
```

## Usage Examples

### Reading Data

```tsx
import { useUserData } from 'contexts/UserDataContext';

function MyComponent() {
  const { quickContacts, hotlines, syncStatus } = useUserData();
  
  return (
    <View>
      {quickContacts.map(contact => (
        <Text key={contact.id}>{contact.phoneNumber}</Text>
      ))}
    </View>
  );
}
```

### Adding Data

```tsx
const { addContact, addHotline } = useUserData();

// Add contact
await addContact('911', 'quick', 'Emergency Police');

// Add hotline
await addHotline({
  name: 'Fire Department',
  number: '911',
  category: 'Emergency',
  description: 'Fire and rescue services'
});
```

### Deleting Data

```tsx
const { deleteContact, deleteHotline } = useUserData();

// Delete contact
await deleteContact(contactId, 'quick');

// Delete hotline
await deleteHotline(hotlineId);
```

### Manual Sync

```tsx
const { sync, forceSync } = useUserData();

// Sync if needed (respects 5-minute interval)
await sync();

// Force immediate sync
await forceSync();
```

### Showing Sync Status

```tsx
import { SyncIndicator } from 'components/SyncIndicator';

// In header
<HeaderWithSidebar 
  title="Emergency Hotlines" 
  showSyncIndicator 
/>

// Standalone
<SyncIndicator />
```

## Sync Behavior

### Automatic Sync Triggers

1. **On App Launch** - Initial sync when UserDataProvider mounts
2. **Auth State Change** - Force sync when user signs in
3. **App Focus** - Sync when app comes to foreground (respects interval)
4. **Data Changes** - Background sync after add/delete operations

### Conflict Resolution

- **Strategy:** Server wins (last-write-wins with server priority)
- **Comparison:** Uses `lastModified` timestamp
- If remote data is newer → Download to local
- If local data is newer → Upload to server
- If no remote data exists → Upload local data as initial sync

### Sync Intervals

Default: 5 minutes between automatic syncs

Can be customized in `UserDataService.shouldSync(intervalMinutes)`

## Migration from Old System

### Before (ContactsService)

```tsx
// Old way
const contacts = await ContactsService.getContacts('quick');
await ContactsService.saveContact('911', 'quick', 'Police');
```

### After (UserDataContext)

```tsx
// New way
const { quickContacts, addContact } = useUserData();
await addContact('911', 'quick', 'Police');
```

**Note:** `ContactsService` still exists for backward compatibility but is deprecated. All methods now use `UserDataService` internally and trigger background sync.

## Troubleshooting

### Sync Not Working

1. Check if user is authenticated:
   ```tsx
   const { data: { user } } = await supabase.auth.getUser();
   console.log('User:', user);
   ```

2. Check sync status:
   ```tsx
   const { syncStatus, syncError } = useUserData();
   console.log('Status:', syncStatus, 'Error:', syncError);
   ```

3. Check Supabase RLS policies are correct

### Data Not Appearing

1. Check if `UserDataProvider` is in the component tree
2. Verify AsyncStorage keys match:
   - `@dispatch/quick_contacts`
   - `@dispatch/community_contacts`
   - `@dispatch/emergency_contacts`
   - `hotlines`

### Force Clear & Re-sync

```tsx
// Clear local storage
await AsyncStorage.multiRemove([
  '@dispatch/quick_contacts',
  '@dispatch/community_contacts',
  '@dispatch/emergency_contacts',
  'hotlines',
  '@dispatch/last_sync'
]);

// Force sync from server
await forceSync();
```

## Performance Considerations

- **Offline-First:** All operations work instantly on local data
- **Background Sync:** Server sync happens asynchronously
- **Debouncing:** Multiple rapid changes only trigger one sync
- **Interval Checking:** Prevents excessive sync requests

## Future Enhancements

- [ ] Optimistic UI updates with rollback on sync failure
- [ ] Incremental sync (only changed items)
- [ ] Conflict resolution UI for user choice
- [ ] Multi-device sync notifications
- [ ] Backup/restore functionality
- [ ] Export/import user data

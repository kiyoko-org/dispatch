# Sidebar Components

This folder contains the sidebar navigation components for the Dispatch Security Suite application.

## Components

### Sidebar.tsx
The main sidebar navigation component that includes:
- Application header with DISPATCH branding
- Main navigation section (Dashboard, Emergency, Report, Trust Center)
- Features section (Cases, Community)
- User profile footer with user information

### UserProfile.tsx
A user profile component that can be used in the top right corner of pages, featuring:
- User avatar (with fallback to initials) - **Click to toggle sidebar**
- Dropdown menu with profile actions (click the chevron arrow)
- Settings and logout functionality
- Sidebar toggle functionality

## Usage

### Basic Sidebar
```tsx
import { Sidebar } from '../../components/sidebar';

<Sidebar 
  activeRoute="dashboard" 
  onNavigate={(route) => console.log('Navigating to:', route)} 
/>
```

### User Profile
```tsx
import UserProfile from '../../components/UserProfile';

<UserProfile 
  userName="John Doe"
  userId="6000"
  onLogout={() => handleLogout()}
  onSettings={() => handleSettings()}
  onProfile={() => handleProfile()}
/>
```

## Props

### Sidebar Props
- `activeRoute`: Currently active navigation route
- `onNavigate`: Callback function when navigation items are clicked
- `onClose`: Callback function to close the sidebar

### UserProfile Props
- `userName`: Display name of the user
- `userId`: User identification number
- `userAvatar`: Optional avatar image URL
- `onLogout`: Callback for logout action
- `onSettings`: Callback for settings action
- `onProfile`: Callback for profile view action
- `onToggleSidebar`: Callback for sidebar toggle action

## Styling
Components use Tailwind CSS classes and are designed to work with the existing design system.

# Dispatch

A modern emergency response and incident reporting mobile application built with React Native and Expo.

## 🚀 Features

- **Emergency Response**: Quick access to emergency services
- **Incident Reporting**: Report and track incidents in real-time
- **User Authentication**: Secure login and signup system
- **Cross-Platform**: Works on iOS, Android, and Web
- **Modern UI**: Built with NativeWind (Tailwind CSS for React Native)

## 📱 Screens

- **Home**: Main dashboard and navigation
- **Emergency**: Emergency services access
- **Report Incident**: Incident reporting interface
- **Login/Signup**: User authentication
- **User Profile**: User information and settings

## 🛠️ Tech Stack

- **Framework**: React Native 0.79.5
- **Runtime**: Expo SDK 53
- **Navigation**: Expo Router 5
- **Styling**: NativeWind (Tailwind CSS)
- **Language**: TypeScript
- **Icons**: Lucide React Native
- **Animations**: React Native Reanimated

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or pnpm
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd dispatch
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   # or
   pnpm start
   ```

4. **Run on your preferred platform**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 📁 Project Structure

```
dispatch/
├── app/                    # App screens and routing
│   ├── emergency/         # Emergency services
│   ├── home/             # Home dashboard
│   ├── login/            # Authentication
│   ├── report-incident/  # Incident reporting
│   └── sign-up/          # User registration
├── components/            # Reusable UI components
│   ├── Button.tsx        # Custom button component
│   ├── Card.tsx          # Card layout component
│   ├── Container.tsx     # Layout container
│   ├── TextInput.tsx     # Input field component
│   └── sidebar/          # Sidebar navigation
├── assets/               # Images and static files
└── scripts/              # Build and deployment scripts
```

## 🎨 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint and Prettier checks
- `npm run format` - Format code with ESLint and Prettier
- `npm run prebuild` - Prepare native code for building

## 🔧 Development

### Code Quality

The project uses ESLint and Prettier for code quality and formatting:

```bash
# Check for linting issues
npm run lint

# Fix linting issues and format code
npm run format
```

### Building

```bash
# Prepare native code
npm run prebuild

# Build for production
expo build:android
expo build:ios
```

## 📱 Platform Support

- ✅ iOS (iPhone/iPad)
- ✅ Android
- ✅ Web (Progressive Web App)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support and questions, please contact the development team.

---

Built with ❤️ using React Native and Expo 

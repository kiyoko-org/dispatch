import 'dotenv/config';

export default () => ({
	expo: {
		name: 'dispatch',
		slug: 'dispatch',
		version: '1.0.0',
		scheme: 'com.kiyoko.dispatch',
		web: {
			favicon: './assets/favicon.png',
		},
		experiments: {
			tsconfigPaths: true,
		},
		plugins: ['expo-router', 'expo-audio'],
		orientation: 'portrait',
		icon: './assets/icon.png',
		userInterfaceStyle: 'light',
		splash: {
			image: './assets/splash.png',
			resizeMode: 'contain',
			backgroundColor: '#ffffff',
		},
		assetBundlePatterns: ['**/*'],
		ios: {
			supportsTablet: true,
			bundleIdentifier: 'com.kiyoko.dispatch',
		},
		android: {
			adaptiveIcon: {
				foregroundImage: './assets/adaptive-icon.png',
				backgroundColor: '#ffffff',
			},
			package: 'com.kiyoko.dispatch',
			permissions: ['android.permission.READ_PHONE_STATE'],
			config: {
				googleMaps: {
					apiKey: process.env.GOOGLE_MAPS_API_KEY,
				},
			},
		},
		extra: {
			SUPABASE_URL: process.env.SUPABASE_URL,
			SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
			GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
		},
	},
});

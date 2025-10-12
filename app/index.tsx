import { Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { Shield } from 'lucide-react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from 'hooks/useAuth';
import { useTheme } from 'components/ThemeContext';
import Splash from 'components/ui/Splash';

export default function Welcome() {
	const router = useRouter();
	const { session, isLoading } = useAuth();
	const { colors, isDark } = useTheme();

	if (session) {
		return (
			<Redirect href={'/home'} />
		)
	}

	if (isLoading) {
		return <Splash />
	}

	return (
		<View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: colors.background }}>
			<StatusBar
				barStyle={isDark ? 'light-content' : 'dark-content'}
				backgroundColor={colors.background}
			/>
			{session == null ?
				<View className="flex items-center gap-8">
					{/* Logo/Icon Placeholder */}
					<View 
						className="w-24 h-24 rounded-full items-center justify-center"
						style={{ backgroundColor: colors.primary }}
					>
						<Shield size={48} color="#FFFFFF" />
					</View>

					{/* Welcome Text */}
					<View className="items-center">
						<Text className="text-4xl font-bold text-center" style={{ color: colors.text }}>
							Welcome to Dispatch
						</Text>
						<Text className="text-lg text-center max-w-xs mt-2" style={{ color: colors.textSecondary }}>
							Your trusted platform for community safety and incident reporting
						</Text>
					</View>

					{/* Login Button */}
					<TouchableOpacity
						onPress={() => {
							router.push('/auth/login');
						}}
						className="px-8 py-4 rounded-xl shadow-lg"
						style={{ backgroundColor: colors.primary }}
						activeOpacity={0.8}
					>
						<Text className="text-white text-lg font-semibold">
							Get Started
						</Text>
					</TouchableOpacity>

					{/* Additional Info */}
					<Text className="text-center text-sm" style={{ color: colors.textSecondary }}>
						New here? You can sign up after logging in
					</Text>
				</View>
				:
				<View 
					className="w-24 h-24 rounded-full items-center justify-center"
					style={{ backgroundColor: colors.primary }}
				>
					<Shield size={48} color="#FFFFFF" />
				</View>
			}
		</View>

	);
}

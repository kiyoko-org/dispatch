import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useTheme } from 'components/ThemeContext';

export default function MapPage() {
	const router = useRouter();
	const { colors, isDark } = useTheme();

	return (
		<View className="flex-1" style={{ backgroundColor: colors.background }}>
			<StatusBar 
				barStyle={isDark ? 'light-content' : 'dark-content'} 
				backgroundColor={colors.background} 
			/>

			<HeaderWithSidebar title="Crime Map" showBackButton={false} />

			{/* Content */}
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				<View className="px-6 py-4">
					{/* Report New Incident Button */}
					<View className="mb-6 flex-row justify-center">
						<TouchableOpacity
							className="items-center rounded-lg px-8 py-3"
							style={{ backgroundColor: colors.primary }}
							onPress={() => router.push('/(protected)/report-incident')}>
							<Text className="text-base font-semibold text-white">Report New Incident</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}


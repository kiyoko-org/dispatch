import { TouchableOpacity, Text, View, Animated } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

type EmergencyButtonProps = {
	className?: string
}

export function EmergencyButton({ className }: EmergencyButtonProps) {
	const router = useRouter()
	const flashAnim = useRef(new Animated.Value(0)).current

	useEffect(() => {
		const flash = () => {
			Animated.sequence([
				Animated.timing(flashAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: false,
				}),
				Animated.timing(flashAnim, {
					toValue: 0,
					duration: 300,
					useNativeDriver: false,
				}),
			]).start(() => flash())
		}
		flash()
	}, [flashAnim])

	const handleEmergencyPress = () => {
		router.push('/emergency')
	}

	return (
		<Animated.View
			style={{
				backgroundColor: flashAnim.interpolate({
					inputRange: [0, 1],
					outputRange: ['#DC2626', '#FEE2E2']
				}),
				borderRadius: 32,
				position: 'absolute',
				bottom: 24,
				right: 24,
				width: 64,
				height: 64,
				shadowColor: '#DC2626',
				shadowOffset: { width: 0, height: 4 },
				shadowOpacity: flashAnim.interpolate({
					inputRange: [0, 1],
					outputRange: [0.6, 0.9]
				}),
				shadowRadius: 8,
				elevation: 8,
			}}
		>
			<TouchableOpacity
				className="w-full h-full rounded-full items-center justify-center"
				onPress={handleEmergencyPress}
				activeOpacity={0.8}
			>
				<AlertTriangle size={24} color="white" />
			</TouchableOpacity>
		</Animated.View>
	)
}

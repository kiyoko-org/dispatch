import { Text, TouchableOpacity, View, StatusBar, Animated, Dimensions } from 'react-native';
import { Shield, Radio, MapPin, Bell } from 'lucide-react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from 'hooks/useAuth';
import { useTheme } from 'components/ThemeContext';
import Splash from 'components/ui/Splash';
import { useEffect, useRef } from 'react';

const { width } = Dimensions.get('window');

export default function Welcome() {
	const router = useRouter();
	const { session, isLoading } = useAuth();
	const { colors, isDark } = useTheme();

	// Animations
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim = useRef(new Animated.Value(40)).current;
	const shieldScale = useRef(new Animated.Value(0.5)).current;
	const pulseAnim = useRef(new Animated.Value(1)).current;
	const featureFade1 = useRef(new Animated.Value(0)).current;
	const featureFade2 = useRef(new Animated.Value(0)).current;
	const featureFade3 = useRef(new Animated.Value(0)).current;
	const buttonSlide = useRef(new Animated.Value(60)).current;
	const buttonFade = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		// Staggered entrance animations
		Animated.sequence([
			// Shield entrance
			Animated.parallel([
				Animated.spring(shieldScale, {
					toValue: 1,
					tension: 60,
					friction: 8,
					useNativeDriver: true,
				}),
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 600,
					useNativeDriver: true,
				}),
			]),
			// Title & subtitle slide in
			Animated.timing(slideAnim, {
				toValue: 0,
				duration: 500,
				useNativeDriver: true,
			}),
			// Feature cards staggered
			Animated.stagger(150, [
				Animated.timing(featureFade1, { toValue: 1, duration: 400, useNativeDriver: true }),
				Animated.timing(featureFade2, { toValue: 1, duration: 400, useNativeDriver: true }),
				Animated.timing(featureFade3, { toValue: 1, duration: 400, useNativeDriver: true }),
			]),
			// Buttons slide up
			Animated.parallel([
				Animated.timing(buttonSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
				Animated.timing(buttonFade, { toValue: 1, duration: 400, useNativeDriver: true }),
			]),
		]).start();

		// Continuous pulse on shield glow
		Animated.loop(
			Animated.sequence([
				Animated.timing(pulseAnim, {
					toValue: 1.15,
					duration: 2000,
					useNativeDriver: true,
				}),
				Animated.timing(pulseAnim, {
					toValue: 1,
					duration: 2000,
					useNativeDriver: true,
				}),
			])
		).start();
	}, []);

	if (session) {
		return <Redirect href={'/home'} />;
	}

	if (isLoading) {
		return <Splash />;
	}

	const features = [
		{ icon: Radio, label: 'Report', desc: 'Incidents in real-time', anim: featureFade1 },
		{ icon: MapPin, label: 'Track', desc: 'Live safety mapping', anim: featureFade2 },
		{ icon: Bell, label: 'Protect', desc: 'Community alerts', anim: featureFade3 },
	];

	return (
		<View style={{ flex: 1, backgroundColor: colors.background }}>
			<StatusBar
				barStyle={isDark ? 'light-content' : 'dark-content'}
				backgroundColor={colors.background}
			/>

			{/* Decorative top accent */}
			<View
				style={{
					position: 'absolute',
					top: -width * 0.6,
					left: -width * 0.2,
					width: width * 1.4,
					height: width * 1.4,
					borderRadius: width * 0.7,
					backgroundColor: colors.primary + '08',
				}}
			/>
			<View
				style={{
					position: 'absolute',
					top: -width * 0.4,
					right: -width * 0.3,
					width: width,
					height: width,
					borderRadius: width * 0.5,
					backgroundColor: colors.primary + '05',
				}}
			/>

			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
				{/* Animated Shield Logo */}
				<Animated.View
					style={{
						opacity: fadeAnim,
						transform: [{ scale: shieldScale }],
						marginBottom: 28,
						alignItems: 'center',
					}}
				>
					{/* Outer glow ring */}
					<Animated.View
						style={{
							position: 'absolute',
							width: 120,
							height: 120,
							borderRadius: 60,
							backgroundColor: colors.primary + '12',
							transform: [{ scale: pulseAnim }],
						}}
					/>
					{/* Middle ring */}
					<View
						style={{
							width: 100,
							height: 100,
							borderRadius: 50,
							backgroundColor: colors.primary + '18',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						{/* Inner shield circle */}
						<View
							style={{
								width: 76,
								height: 76,
								borderRadius: 38,
								backgroundColor: colors.primary,
								justifyContent: 'center',
								alignItems: 'center',
								shadowColor: colors.primary,
								shadowOffset: { width: 0, height: 8 },
								shadowOpacity: 0.4,
								shadowRadius: 20,
								elevation: 12,
							}}
						>
							<Shield size={38} color="#FFFFFF" strokeWidth={2.5} />
						</View>
					</View>
				</Animated.View>

				{/* Title Section */}
				<Animated.View
					style={{
						opacity: fadeAnim,
						transform: [{ translateY: slideAnim }],
						alignItems: 'center',
						marginBottom: 36,
					}}
				>
					<Text
						style={{
							fontSize: 14,
							fontWeight: '700',
							letterSpacing: 3,
							color: colors.primary,
							textTransform: 'uppercase',
							marginBottom: 8,
						}}
					>
						Dispatch
					</Text>
					<Text
						style={{
							fontSize: 30,
							fontWeight: '800',
							color: colors.text,
							textAlign: 'center',
							lineHeight: 38,
							marginBottom: 10,
						}}
					>
						Community Safety{'\n'}At Your Fingertips
					</Text>
					<Text
						style={{
							fontSize: 15,
							color: colors.textSecondary,
							textAlign: 'center',
							lineHeight: 22,
							maxWidth: 280,
						}}
					>
						Report incidents, stay informed, and help protect your neighborhood
					</Text>
				</Animated.View>

				{/* Feature Cards Row */}
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'center',
						gap: 12,
						marginBottom: 44,
						width: '100%',
					}}
				>
					{features.map(({ icon: Icon, label, desc, anim }, index) => (
						<Animated.View
							key={label}
							style={{
								opacity: anim,
								flex: 1,
								backgroundColor: colors.surface,
								borderRadius: 16,
								paddingVertical: 18,
								paddingHorizontal: 10,
								alignItems: 'center',
								borderWidth: 1,
								borderColor: colors.border,
								shadowColor: '#000',
								shadowOffset: { width: 0, height: 2 },
								shadowOpacity: isDark ? 0.3 : 0.06,
								shadowRadius: 8,
								elevation: 3,
							}}
						>
							<View
								style={{
									width: 40,
									height: 40,
									borderRadius: 12,
									backgroundColor: colors.primary + '15',
									justifyContent: 'center',
									alignItems: 'center',
									marginBottom: 10,
								}}
							>
								<Icon size={20} color={colors.primary} strokeWidth={2.2} />
							</View>
							<Text
								style={{
									fontSize: 13,
									fontWeight: '700',
									color: colors.text,
									marginBottom: 3,
								}}
							>
								{label}
							</Text>
							<Text
								style={{
									fontSize: 11,
									color: colors.textSecondary,
									textAlign: 'center',
									lineHeight: 15,
								}}
							>
								{desc}
							</Text>
						</Animated.View>
					))}
				</View>

				{/* Action Buttons */}
				<Animated.View
					style={{
						opacity: buttonFade,
						transform: [{ translateY: buttonSlide }],
						width: '100%',
					}}
				>
					{/* Primary CTA — Get Started / Login */}
					<TouchableOpacity
						onPress={() => router.push('/auth/login')}
						activeOpacity={0.85}
						style={{
							backgroundColor: colors.primary,
							borderRadius: 14,
							paddingVertical: 16,
							shadowColor: colors.primary,
							shadowOffset: { width: 0, height: 6 },
							shadowOpacity: 0.35,
							shadowRadius: 14,
							elevation: 8,
							marginBottom: 12,
						}}
					>
						<Text
							style={{
								color: '#FFFFFF',
								fontSize: 16,
								fontWeight: '700',
								textAlign: 'center',
								letterSpacing: 0.5,
							}}
						>
							Get Started
						</Text>
					</TouchableOpacity>

					{/* Secondary — Sign Up */}
					<TouchableOpacity
						onPress={() => router.push('/auth/sign-up')}
						activeOpacity={0.85}
						style={{
							backgroundColor: colors.primary + '12',
							borderRadius: 14,
							paddingVertical: 16,
							borderWidth: 1.5,
							borderColor: colors.primary + '30',
							marginBottom: 12,
						}}
					>
						<Text
							style={{
								color: colors.primary,
								fontSize: 16,
								fontWeight: '700',
								textAlign: 'center',
								letterSpacing: 0.5,
							}}
						>
							Create Account
						</Text>
					</TouchableOpacity>

					{/* Tertiary — Guest */}
					<TouchableOpacity
						onPress={() => router.push('/auth/guest')}
						activeOpacity={0.85}
						style={{
							paddingVertical: 14,
						}}
					>
						<Text
							style={{
								color: colors.textSecondary,
								fontSize: 14,
								fontWeight: '600',
								textAlign: 'center',
							}}
						>
							Continue as Guest
						</Text>
					</TouchableOpacity>
				</Animated.View>
			</View>
		</View>
	);
}

import { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useTheme } from './ThemeContext';
import { useNotifications } from '@kiyoko-org/dispatch-lib';
import { useAuth } from 'hooks/useAuth';
import NotificationItem from './NotificationItem';

interface NotificationSidebarProps {
	isOpen: boolean;
	onToggle: () => void;
}

export default function NotificationSidebar({ isOpen, onToggle }: NotificationSidebarProps) {
	const { colors } = useTheme();
	const activityPanelWidth = Math.min(400, Dimensions.get('window').width * 0.85);
	const activityAnim = useRef(new Animated.Value(activityPanelWidth)).current;

	const { notifications } = useNotifications()
	const { session } = useAuth()
	const userNotifications = notifications.filter(it => it.user_id === session?.user.id)

	useEffect(() => {
		if (isOpen) {
			Animated.timing(activityAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}).start();
		} else {
			Animated.timing(activityAnim, {
				toValue: activityPanelWidth,
				duration: 300,
				useNativeDriver: true,
			}).start();
		}
	}, [isOpen, activityAnim, activityPanelWidth]);

	const closeActivity = () => {
		Animated.timing(activityAnim, {
			toValue: activityPanelWidth,
			duration: 300,
			useNativeDriver: true,
		}).start(() => onToggle());
	};

	return (
		<>
			{isOpen && (
				<TouchableOpacity
					style={[styles.overlay, { backgroundColor: colors.overlay }]}
					onPress={closeActivity}
					activeOpacity={1}
				/>
			)}

			<Animated.View
				style={[
					styles.activityPanel,
					{
						transform: [{ translateX: activityAnim }],
						zIndex: 1001,
						backgroundColor: colors.surface,
						padding: 16
					},
				]}
			>
				{userNotifications.map(notification => {
					return (
						<NotificationItem title={notification.title || ""} body={notification.body} />
					)
				})}
			</Animated.View>
		</>
	);
}

const styles = StyleSheet.create({
	overlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 999,
	},
	activityPanel: {
		position: 'absolute',
		top: 0,
		right: 0,
		width: Math.min(400, Dimensions.get('window').width * 0.85),
		height: '100%',
		shadowColor: '#000',
		shadowOffset: { width: -2, height: 0 },
		shadowOpacity: 0.25,
		shadowRadius: 10,
		elevation: 20,
	},
});

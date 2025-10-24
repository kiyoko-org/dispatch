import { useRef, useEffect, useState, useCallback } from 'react';
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	Animated,
	Dimensions,
	ScrollView,
} from 'react-native';
import { Bell } from 'lucide-react-native';
import { useTheme } from './ThemeContext';
import { Notification } from './NotificationItem';
import SwipeableNotification from './SwipeableNotification';

interface NotificationSidebarProps {
	isOpen: boolean;
	userNotifications: Notification[]
	onToggle: () => void;
	deleteNotification: (id: string) => Promise<{ data: any[] | null; error: any }>;
	loading?: boolean;
	reportsLoading?: boolean;
	onRefreshReports?: () => void;
	userId?: string;
}

export default function NotificationSidebar({
	userNotifications,
	isOpen,
	onToggle,
	deleteNotification,
}: NotificationSidebarProps) {
	const { colors } = useTheme();
	const activityPanelWidth = Math.min(400, Dimensions.get('window').width * 0.85);
	const activityAnim = useRef(new Animated.Value(activityPanelWidth)).current;
	const [deletingIds, setDeletingIds] = useState<string[]>([]);
	const [clearingAll, setClearingAll] = useState(false);

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

	const handleDelete = useCallback(
		async (id: string) => {
			setDeletingIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
			const { error } = await deleteNotification(id);

			if (error) {
				console.error('Error deleting notification:', error);
			}

			setDeletingIds((prev) => prev.filter((notificationId) => notificationId !== id));
		},
		[deleteNotification]
	);

	const handleClearAll = useCallback(async () => {
		if (!userNotifications.length || clearingAll) {
			return;
		}

		const notificationIds = userNotifications.map(({ id }) => id);
		setClearingAll(true);
		setDeletingIds((prev) => {
			const updated = new Set(prev);
			notificationIds.forEach((id) => updated.add(id));
			return Array.from(updated);
		});

		try {
			await Promise.all(
				notificationIds.map(async (id) => {
					const { error } = await deleteNotification(id);
					if (error) {
						console.error('Error deleting notification:', error);
					}
				})
			);
		} finally {
			setDeletingIds((prev) => prev.filter((id) => !notificationIds.includes(id)));
			setClearingAll(false);
		}
	}, [userNotifications, deleteNotification, clearingAll]);

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
				<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
					<Bell size={20} color={colors.primary} />
					<Text
						style={{
							fontSize: 18,
							fontWeight: '600',
							color: colors.text,
							marginLeft: 8,
							flex: 1,
						}}>
						Notifications
					</Text>
					{userNotifications.length > 0 && (
						<TouchableOpacity
							onPress={handleClearAll}
							disabled={clearingAll}
							style={[
								styles.clearButton,
								{
									borderColor: colors.border,
									backgroundColor: colors.surfaceVariant,
									opacity: clearingAll ? 0.6 : 1,
								},
							]}
						>
							<Text style={[styles.clearButtonText, { color: colors.primary }]}>
								{clearingAll ? 'Clearing...' : 'Clear All'}
							</Text>
						</TouchableOpacity>
					)}
				</View>
				<ScrollView
					contentContainerStyle={styles.notificationList}
					showsVerticalScrollIndicator={false}
				>
					{userNotifications.map(notification => {
						return (
							<SwipeableNotification
								key={notification.id}
								notification={notification}
								onDelete={handleDelete}
								isDeleting={deletingIds.includes(notification.id)}
							/>
						);
					})}
				</ScrollView>
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
	notificationList: {
		gap: 12,
		paddingBottom: 32,
	},
	clearButton: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 999,
		borderWidth: 1,
	},
	clearButtonText: {
		fontSize: 14,
		fontWeight: '500',
	},
});

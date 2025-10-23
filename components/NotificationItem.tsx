import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from './ThemeContext';
import { Database } from '@kiyoko-org/dispatch-lib/database.types';


type Notification = Database["public"]["Tables"]["notifications"]["Row"];

const MS_IN_MINUTE = 60 * 1000;
const MS_IN_HOUR = 60 * MS_IN_MINUTE;
const MS_IN_DAY = 24 * MS_IN_HOUR;
const MS_IN_MONTH = 30 * MS_IN_DAY;
const MS_IN_YEAR = 365 * MS_IN_DAY;

function formatTimeAgo(createdAt?: string | null) {
	if (!createdAt) return '';

	const createdDate = new Date(createdAt);
	if (Number.isNaN(createdDate.getTime())) return '';

	const now = Date.now();
	const diff = Math.max(0, now - createdDate.getTime());

	if (diff < MS_IN_MINUTE) return 'Just now';

	const minutes = Math.floor(diff / MS_IN_MINUTE);
	if (minutes < 60) return `${minutes}m ago`;

	const hours = Math.floor(diff / MS_IN_HOUR);
	if (hours < 24) return `${hours}h ago`;

	const days = Math.floor(diff / MS_IN_DAY);
	if (days < 31) return `${days}d ago`;

	const months = Math.floor(diff / MS_IN_MONTH);
	if (months < 12) return `${Math.max(1, months)}M ago`;

	const years = Math.max(1, Math.min(100, Math.floor(diff / MS_IN_YEAR)));
	return `${years}y ago`;
}

export default function NotificationItem({ title, body, created_at }: Notification) {
	const { colors } = useTheme();
	const timeAgo = useMemo(() => formatTimeAgo(created_at), [created_at]);

	return (
		<View
			style={{
				borderRadius: 8,
				borderWidth: 1,
				borderColor: colors.border,
				backgroundColor: colors.surface,
				padding: 16,
				marginBottom: 12,
			}}>
			<Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{title}</Text>
			<Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>{body}</Text>
			{timeAgo ? (
				<Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 8 }}>{timeAgo}</Text>
			) : null}
		</View>
	);
}

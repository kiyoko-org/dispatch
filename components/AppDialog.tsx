import { ReactNode } from 'react';
import {
	Modal,
	View,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	ScrollView,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from './ThemeContext';

type DialogActionVariant = 'primary' | 'secondary' | 'surface';
type DialogTone = 'default' | 'success' | 'error' | 'warning' | 'info';

interface DialogAction {
	label: string;
	onPress: () => void;
	variant?: DialogActionVariant;
	disabled?: boolean;
	icon?: ReactNode;
}

interface AppDialogProps {
	visible: boolean;
	title: string;
	description?: string;
	icon?: ReactNode;
	tone?: DialogTone;
	onDismiss?: () => void;
	dismissable?: boolean;
	actions?: DialogAction[];
	children?: ReactNode;
}

const toneColorKeys: Record<Exclude<DialogTone, 'default'>, 'success' | 'error' | 'warning' | 'info'> = {
	success: 'success',
	error: 'error',
	warning: 'warning',
	info: 'info',
};

const addAlphaToHex = (hexColor: string, alpha: number) => {
	const sanitized = hexColor.replace('#', '');
	const expandHex = sanitized.length === 3 ? sanitized.split('').map((c) => c + c).join('') : sanitized;
	const numeric = parseInt(expandHex, 16);
	const r = (numeric >> 16) & 255;
	const g = (numeric >> 8) & 255;
	const b = numeric & 255;
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function AppDialog({
	visible,
	title,
	description,
	icon,
	tone = 'default',
	onDismiss,
	dismissable = true,
	actions = [],
	children,
}: AppDialogProps) {
	const { colors, isDark } = useTheme();

	const toneColor =
		tone === 'default' ? colors.primary : colors[toneColorKeys[tone] as keyof typeof colors] || colors.primary;

	const iconWrapperColor =
		tone === 'default'
			? colors.surfaceVariant
			: addAlphaToHex(toneColor, isDark ? 0.3 : 0.12);

	const renderAction = (action: DialogAction, index: number) => {
		const variant = action.variant ?? 'primary';
		const isPrimary = variant === 'primary';
		const isSecondary = variant === 'secondary';
		const backgroundColor = isPrimary
			? toneColor
			: isSecondary
				? colors.surfaceVariant
				: colors.surface;
		const textColor = isPrimary ? '#FFFFFF' : colors.text;
		const borderColor = isSecondary ? colors.border : 'transparent';

		return (
			<TouchableOpacity
				key={`${action.label}-${index}`}
				className="flex-1 rounded-lg px-4 py-3"
				disabled={action.disabled}
				activeOpacity={0.8}
				onPress={action.onPress}
				style={{
					opacity: action.disabled ? 0.6 : 1,
					backgroundColor,
					borderWidth: borderColor === 'transparent' ? 0 : 1,
					borderColor,
				}}>
				<View className="flex-row items-center justify-center">
					{action.icon && <View className="mr-2">{action.icon}</View>}
					<Text className="text-center font-medium" style={{ color: textColor }}>
						{action.label}
					</Text>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={dismissable ? onDismiss : undefined}>
			<View className="flex-1" style={{ backgroundColor: colors.overlay }}>
				<TouchableWithoutFeedback onPress={dismissable ? onDismiss : undefined}>
					<View className="flex-1" />
				</TouchableWithoutFeedback>

				<View className="px-6 pb-10 pt-12">
					<View
						className="mx-auto w-full max-w-md rounded-2xl px-6 py-6"
						style={{ backgroundColor: colors.card }}>
						<View className="items-center">
							{icon && (
								<View
									className="mb-4 rounded-full p-4"
									style={{
										backgroundColor: iconWrapperColor,
									}}>
									{icon}
								</View>
							)}
							<Text className="text-center text-xl font-semibold" style={{ color: colors.text }}>
								{title}
							</Text>
							{description ? (
								<Text className="mt-3 text-center text-base" style={{ color: colors.textSecondary }}>
									{description}
								</Text>
							) : null}
						</View>

						{children ? (
							<ScrollView className="mt-4" style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
								{children}
							</ScrollView>
						) : null}

						{actions.length > 0 && (
							<View className="mt-6 flex-row space-x-3">
								{actions.map((action, index) => renderAction(action, index))}
							</View>
						)}

						{dismissable && !actions.length && (
							<TouchableOpacity
								className="mt-6 rounded-lg px-4 py-3"
								activeOpacity={0.8}
								onPress={onDismiss}
								style={{
									borderWidth: 1,
									borderColor: colors.border,
									backgroundColor: colors.surface,
								}}>
								<View className="flex-row items-center justify-center">
									<Text className="text-center font-medium" style={{ color: colors.text }}>
										Close
									</Text>
									<X size={16} color={colors.textSecondary} style={{ marginLeft: 8 }} />
								</View>
							</TouchableOpacity>
						)}
					</View>
				</View>
			</View>
		</Modal>
	);
}

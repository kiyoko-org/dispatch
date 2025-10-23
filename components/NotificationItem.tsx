import { View, Text } from 'react-native';
import { useTheme } from './ThemeContext';

interface NotificationItemProps {
  title: string;
  body: string;
}

export default function NotificationItem({ title, body }: NotificationItemProps) {
  const { colors } = useTheme();

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
    </View>
  );
}

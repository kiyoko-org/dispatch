import { View } from "react-native"
import { useTheme } from "../ThemeContext"

type CardProps = {
	children: React.ReactNode
	className?: string
	style?: any
}

export function Card({ children, className, style }: CardProps) {
	const { colors } = useTheme()
	
	return (
		<View
			className={className || ''}
			style={[
				{
					backgroundColor: colors.card,
					borderRadius: 16,
					borderWidth: 1,
					borderColor: colors.border,
					padding: 24,
					elevation: 2,
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 1 },
					shadowOpacity: 0.2,
					shadowRadius: 2,
				},
				style
			]}
		>
			{children}
		</View>
	)
}

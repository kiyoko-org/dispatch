import { View, ScrollView, ViewStyle } from 'react-native'
import { ReactNode } from 'react'

type ScreenContentProps = {
	children: ReactNode
	className?: string
	scrollable?: boolean
	contentContainerStyle?: ViewStyle
	showsVerticalScrollIndicator?: boolean
}

export function ScreenContent({ 
	children, 
	className, 
	scrollable = true,
	contentContainerStyle,
	showsVerticalScrollIndicator = false
}: ScreenContentProps) {
	if (scrollable) {
		return (
			<ScrollView 
				className={`flex-1 ${className || ''}`}
				showsVerticalScrollIndicator={showsVerticalScrollIndicator}
				contentContainerStyle={contentContainerStyle}
			>
				{children}
			</ScrollView>
		)
	}

	return (
		<View className={`flex-1 ${className || ''}`}>
			{children}
		</View>
	)
}

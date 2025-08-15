import { View } from "react-native"

type CardProps = {
	children: React.ReactNode
	className?: string
}

export function Card({ children, className }: CardProps) {
	return (
		<View className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 elevation-2 ${className || ''}`} >
			{children}
		</View>
	)
}

import { View } from "react-native"

type CardProps = {
	children: React.ReactNode
	className?: string
}

export function Card({ children, className }: CardProps) {
	return (
		<View 
			className={`bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 ${className || ''}`}
			style={{
				elevation: 2,
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: 0.2,
				shadowRadius: 2,
			}}
		>
			{children}
		</View>
	)
}

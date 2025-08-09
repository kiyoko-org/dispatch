import { View } from "react-native"

type CardProps = {
	children: React.ReactNode
	className?: string
}

export function Card({ children, className }: CardProps) {
	return (
		<View className={`bg-white rounded-xl border-[0.7px] border-[#e5e5e5] shadow p-8 elevation-md ${className || ''}`} >
			{children}
		</ View>
	)
}

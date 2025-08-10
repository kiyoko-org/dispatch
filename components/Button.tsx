import { View, Button as RNButton, Text, TouchableOpacity } from "react-native"

type ButtonProps = {
	label: string
	className?: string
	onPress?: () => void
}

export function Button({ className, label, onPress }: ButtonProps) {
	return (
		<TouchableOpacity 
			activeOpacity={0.8} 
			className={`bg-black rounded-xl border-[0.7px] border-[#e5e5e5] shadow p-2 py-3 elevation-md ${className || ''}`}
			onPress={onPress}
		>
			<Text className="text-white text-center font-semibold text-xl">{label}</Text>
		</TouchableOpacity>
	)
}

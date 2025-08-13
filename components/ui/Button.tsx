import { Text, TouchableOpacity, GestureResponderEvent, ActivityIndicator } from "react-native"

type ButtonProps = {
	label: string
	className?: string
	onPress?: ((event: GestureResponderEvent) => void)
	loading?: boolean
}

export function Button({ className, label, onPress, loading }: ButtonProps) {
	return (
		<TouchableOpacity {...{ onPress }} activeOpacity={0.8} className={`bg-black rounded-xl border-[0.7px] border-[#e5e5e5] shadow p-2 py-3 elevation-md ${className || ''}`} >
			{loading ? (
				<ActivityIndicator color="white" />
			) : (
				<Text className="text-white text-center font-semibold text-xl">{label}</Text>
			)}
		</TouchableOpacity>
	)
}
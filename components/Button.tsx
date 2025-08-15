import { View, Button as RNButton, Text, TouchableOpacity, GestureResponderEvent } from "react-native"

type ButtonProps = {
	label: string
	className?: string
	onPress?: ((event: GestureResponderEvent) => void)
	variant?: 'primary' | 'secondary' | 'outline'
}

export function Button({ className, label, onPress, variant = 'primary' }: ButtonProps) {
	const baseClasses = "rounded-xl font-semibold text-base py-4 px-6 transition-all active:scale-95"
	
	const variantClasses = {
		primary: "bg-gray-900 text-white shadow-md hover:bg-gray-800",
		secondary: "bg-gray-100 text-gray-900 border border-gray-200 hover:bg-gray-200",
		outline: "bg-transparent text-gray-900 border-2 border-gray-300 hover:bg-gray-50"
	}

	return (
		<TouchableOpacity 
			{...{ onPress }} 
			activeOpacity={0.9} 
			className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`}
		>
			<Text className={`text-center font-semibold ${variant === 'outline' ? 'text-gray-900' : variant === 'secondary' ? 'text-gray-900' : 'text-white'}`}>
				{label}
			</Text>
		</TouchableOpacity>
	)
}

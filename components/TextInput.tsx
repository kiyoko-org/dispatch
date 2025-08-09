import { KeyboardTypeOptions, TextInput as RNTextInput, View, Text } from "react-native"

type TextInputProps = {
	className?: string
	placeholder?: string,
	keyboardType?: KeyboardTypeOptions
	secureTextEntry?: boolean
	label?: string
}

export function TextInput({ className, placeholder, keyboardType, secureTextEntry, label }: TextInputProps) {
	return (
		<View className={`${className || ''}`}>
			{label &&
				<Text className='font-semibold text-md'>{label}</Text>
			}
			<View className="mt-2 bg-white flex flex-col rounded-xl border-[1px] border-[#e5e5e5] p-2 px-3" >
				<RNTextInput className="bg-white" {...{ placeholder, keyboardType, secureTextEntry }} />
			</ View>
		</View>
	)
}

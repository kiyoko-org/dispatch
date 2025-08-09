import { KeyboardTypeOptions, TextInput as RNTextInput, View } from "react-native"

type TextInputProps = {
	className?: string
	placeholder?: string,
	keyboardType?: KeyboardTypeOptions
	secureTextEntry?: boolean
}

export function TextInput({ className, placeholder, keyboardType, secureTextEntry }: TextInputProps) {
	return (
		<View className={`bg-white flex flex-col rounded-xl border-[0.7px] border-[#e5e5e5] shadow p-2 px-3 elevation-md ${className || ''}`} >
			<RNTextInput className="bg-white" {...{ placeholder, keyboardType, secureTextEntry }} />
		</ View>
	)
}

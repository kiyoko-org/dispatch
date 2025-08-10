import { ReactNode } from "react"
import React from 'react'
import { KeyboardTypeOptions, TextInput as RNTextInput, View, Text } from "react-native"

type TextInputProps = {
	className?: string
	placeholder?: string,
	keyboardType?: KeyboardTypeOptions
	secureTextEntry?: boolean
	label?: string
	icon?: ReactNode
}

export function TextInput({ className, placeholder, keyboardType, secureTextEntry, label, icon }: TextInputProps) {

	const modifiedIcon = icon ? React.cloneElement(icon, {
		color: "gray",
		size: 20,
	}) : null

	return (
		<View className={`${className || ''}`}>
			{label &&
				<Text className='font-semibold text-md'>{label}</Text>
			}
			<View className="mt-2 gap-2 bg-white flex flex-row items-center rounded-xl border-[1px] border-[#e5e5e5] px-3" >
				{modifiedIcon &&
					modifiedIcon
				}
				<RNTextInput className="bg-white w-max flex-1" {...{ placeholder, keyboardType, secureTextEntry }} />
			</ View>
		</View>
	)
}

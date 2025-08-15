import { ReactNode, useState } from "react"
import React from 'react'
import { KeyboardTypeOptions, TextInput as RNTextInput, View, Text, TouchableOpacity } from "react-native"
import { Eye, EyeOff } from 'lucide-react-native'

type TextInputProps = {
	className?: string
	placeholder?: string,
	keyboardType?: KeyboardTypeOptions
	secureTextEntry?: boolean
	label?: string
	icon?: ReactNode
}

export function TextInput({ className, placeholder, keyboardType, secureTextEntry, label, icon }: TextInputProps) {
	const [showPassword, setShowPassword] = useState(false)
	const isPassword = secureTextEntry

	const modifiedIcon = icon ? React.cloneElement(icon, {
		color: "#6B7280",
		size: 18,
	}) : null

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword)
	}

	return (
		<View className={`${className || ''}`}>
			{label &&
				<Text className='font-medium text-sm text-gray-700 mb-2'>{label}</Text>
			}
			<View className="bg-white flex flex-row items-center rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" >
				{modifiedIcon &&
					<View className="mr-3">
						{modifiedIcon}
					</View>
				}
				<RNTextInput 
					className="flex-1 text-gray-900 placeholder:text-gray-400 text-base" 
					placeholder={placeholder}
					keyboardType={keyboardType}
					secureTextEntry={isPassword && !showPassword}
				/>
				{isPassword && (
					<TouchableOpacity 
						onPress={togglePasswordVisibility}
						className="ml-3 p-1"
						activeOpacity={0.7}
					>
						{showPassword ? (
							<EyeOff size={20} color="#6B7280" />
						) : (
							<Eye size={20} color="#6B7280" />
						)}
					</TouchableOpacity>
				)}
			</View>
		</View>
	)
}

import { View } from "react-native"
import { ReactNode } from "react"

type ContainerProps = {
	children: ReactNode
	className?: string
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
	padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Container({ children, className, maxWidth = 'md', padding = 'md' }: ContainerProps) {
	const maxWidthClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
		'2xl': 'max-w-2xl'
	}

	const paddingClasses = {
		none: '',
		sm: 'px-4',
		md: 'px-6',
		lg: 'px-8'
	}

	return (
		<View className={`w-full mx-auto ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]} ${className || ''}`}>
			{children}
		</View>
	)
}

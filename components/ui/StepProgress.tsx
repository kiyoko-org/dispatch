import { View } from 'react-native';

type StepProgress = {
	max?: number
	current?: number
}

// Extremely simple rounded progress line with black accent.
export default function StepProgress({ max = 100, current = 0 }: StepProgress) {
	const m = Math.max(1, Math.floor(max))
	const c = Math.min(Math.max(0, Math.floor(current)), m)
	const width = `${(c / m) * 100}%`

	return (
		<View
			role="progressbar"
			aria-label="Progress"
			aria-valuemin={0}
			aria-valuemax={m}
			aria-valuenow={c}
			className="h-2 w-full overflow-hidden bg-neutral-200"
		>
			<View className="h-full bg-black transition-[width] duration-200 ease-out" style={{ width }} />
		</View>
	)
}


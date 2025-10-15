import { useReports } from "@kiyoko-org/dispatch-lib";
import { Database } from "@kiyoko-org/dispatch-lib/database.types";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { 
  Text, 
  View, 
  ScrollView, 
  StatusBar, 
  Platform,
  KeyboardAvoidingView 
} from "react-native";
import { useTheme } from "components/ThemeContext";
import { useDispatchClient } from "components/DispatchProvider";
import HeaderWithSidebar from "components/HeaderWithSidebar";
import { Card } from "components/ui/Card";
import { ShimmerCard } from "components/ui/Shimmer";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  User, 
  FileText,
  Phone,
  UserCheck,
  Shield
} from "lucide-react-native";

export default function ReportDetails() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { getReportInfo } = useReports();
	const { colors, isDark } = useTheme();
	const { categories } = useDispatchClient();
	const [reportInfo, setReportInfo] = useState<Database["public"]["Tables"]["reports"]["Row"] | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchReport = async () => {
			if (id) {
				setLoading(true);
				const report = await getReportInfo(Number(id));

				if (report.error) {
					console.error("Error fetching report:", report.error);
					return;
				}

				console.log("Fetched report:", report.data);

				setReportInfo(report.data);
			}
			setLoading(false);
		}

		fetchReport()
	}, [id])

	// Loading state with shimmer
	if (loading || !reportInfo) {
		return (
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1"
				style={{ backgroundColor: colors.background }}
			>
				<StatusBar 
					barStyle={isDark ? 'light-content' : 'dark-content'} 
					backgroundColor={colors.background} 
				/>
				<HeaderWithSidebar title="Report Details" showBackButton={true} />
				
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 32 }}
					className="flex-1"
				>
					<View className="px-4 pt-2">
						<ShimmerCard className="mb-5" />
						<ShimmerCard className="mb-5" />
						<ShimmerCard className="mb-5" />
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		);
	}

	// Format date and time
	const formatDate = (dateString: string | null | undefined) => {
		if (!dateString) return 'Not specified';
		
		try {
			// Handle different date formats
			let date: Date;
			
			// Check if it's already in MM/DD/YYYY format
			if (typeof dateString === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
				const [month, day, year] = dateString.split('/');
				date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
			} else {
				// Try parsing as ISO string or other formats
				date = new Date(dateString);
			}
			
			// Check if date is valid
			if (isNaN(date.getTime())) {
				return 'Invalid date';
			}
			
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch (error) {
			console.error('Error formatting date:', error);
			return 'Invalid date';
		}
	};

	const formatTime = (timeString: string) => {
		return timeString || 'Not specified';
	};

	// Get category information from context
	const getCategoryInfo = (categoryId: number | null) => {
		if (!categoryId) return { name: 'Unknown Category', severity: 'Unknown' };
		const category = categories.find(cat => cat.id === categoryId);
		return category || { name: 'Unknown Category', severity: 'Unknown' };
	};

	// Get status color
	const getStatusColor = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'pending':
				return colors.warning || '#F59E0B';
			case 'in_progress':
				return colors.primary;
			case 'resolved':
				return colors.success || '#10B981';
			case 'cancelled':
				return colors.error;
			default:
				return colors.textSecondary;
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			className="flex-1"
			style={{ backgroundColor: colors.background }}
		>
			<StatusBar 
				barStyle={isDark ? 'light-content' : 'dark-content'} 
				backgroundColor={colors.background} 
			/>
			<HeaderWithSidebar title="Report Details" showBackButton={true} />
			
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 32 }}
				className="flex-1"
			>
				<View className="px-4 pt-2">
					{/* Basic Information Card */}
					<Card className="mb-5">
						<View className="mb-4 flex-row items-center">
							<View className="mr-3 h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: colors.surfaceVariant }}>
								<FileText size={20} color={colors.text} />
							</View>
					<View>
						<Text className="text-xl font-bold" style={{ color: colors.text }}>{reportInfo.incident_title || 'Untitled Report'}</Text>
						<View className="flex-row items-center">
							<View 
								className="w-1.5 h-1.5 rounded-full mr-2"
								style={{ backgroundColor: getStatusColor(reportInfo.status || 'pending') }}
							/>
							<Text 
								className="text-sm font-medium capitalize"
								style={{ color: getStatusColor(reportInfo.status || 'pending') }}
							>
								{reportInfo.status || 'Pending'}
							</Text>
						</View>
						<Text className="text-sm" style={{ color: colors.textSecondary }}>#{reportInfo.id}</Text>
					</View>
						</View>

						<View className="space-y-4">


							{/* Category Information */}
							{reportInfo.category_id && (
								<View>
									<Text className="mb-1 text-sm font-medium" style={{ color: colors.textSecondary }}>Category</Text>
									<View className="flex-row items-center">
										<AlertTriangle size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
										<Text className="text-base" style={{ color: colors.text }}>
											{getCategoryInfo(reportInfo.category_id).name}
										</Text>
									</View>
								</View>
							)}

							<View className="flex-row space-x-4">
								<View className="flex-1">
									<Text className="mb-1 text-sm font-medium" style={{ color: colors.textSecondary }}>Date</Text>
									<View className="flex-row items-center">
										<Calendar size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
										<Text className="text-base" style={{ color: colors.text }}>
											{formatDate(reportInfo.incident_date)}
										</Text>
									</View>
								</View>
								<View className="flex-1">
									<Text className="mb-1 text-sm font-medium" style={{ color: colors.textSecondary }}>Time</Text>
									<View className="flex-row items-center">
										<Clock size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
										<Text className="text-base" style={{ color: colors.text }}>
											{formatTime(reportInfo.incident_time ?? '')}
										</Text>
									</View>
								</View>
							</View>
						</View>
					</Card>

					{/* Location Information Card */}
					<Card className="mb-5">
						<View className="mb-4 flex-row items-center">
							<View className="mr-3 h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: colors.surfaceVariant }}>
								<MapPin size={20} color={colors.text} />
							</View>
							<Text className="text-xl font-bold" style={{ color: colors.text }}>Location Information</Text>
						</View>

						<View className="space-y-4">
							<View>
								<Text className="mb-1 text-sm font-medium" style={{ color: colors.textSecondary }}>Street Address</Text>
								<Text className="text-base" style={{ color: colors.text }}>
									{reportInfo.street_address || 'No address provided'}
								</Text>
							</View>

							{reportInfo.nearby_landmark && (
								<View>
									<Text className="mb-1 text-sm font-medium" style={{ color: colors.textSecondary }}>Nearby Landmark</Text>
									<Text className="text-base" style={{ color: colors.text }}>{reportInfo.nearby_landmark}</Text>
								</View>
							)}

							<View>
								<Text className="mb-1 text-sm font-medium" style={{ color: colors.textSecondary }}>Coordinates</Text>
								<Text className="text-base" style={{ color: colors.text }}>
									{reportInfo.latitude && reportInfo.longitude 
										? `${reportInfo.latitude.toFixed(6)}, ${reportInfo.longitude.toFixed(6)}`
										: 'Coordinates not available'
									}
								</Text>
							</View>
						</View>
					</Card>

					{/* Incident Details Card */}
					<Card className="mb-5">
						<View className="mb-4 flex-row items-center">
							<View className="mr-3 h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: colors.surfaceVariant }}>
								<AlertTriangle size={20} color={colors.text} />
							</View>
							<Text className="text-xl font-bold" style={{ color: colors.text }}>Incident Details</Text>
						</View>

						<View className="space-y-4">
							<View>
								<Text className="mb-1 text-sm font-medium" style={{ color: colors.textSecondary }}>What Happened</Text>
								<Text className="text-base leading-6" style={{ color: colors.text }}>
									{reportInfo.what_happened || 'No description provided'}
								</Text>
							</View>

							{reportInfo.who_was_involved && (
								<View>
									<Text className="mb-1 text-sm font-medium" style={{ color: colors.textSecondary }}>People Involved</Text>
									<Text className="text-base" style={{ color: colors.text }}>{reportInfo.who_was_involved}</Text>
								</View>
							)}

							{reportInfo.suspect_description && (
								<View>
									<Text className="mb-1 text-sm font-medium" style={{ color: colors.textSecondary }}>Suspect Description</Text>
									<Text className="text-base" style={{ color: colors.text }}>{reportInfo.suspect_description}</Text>
								</View>
							)}

							{reportInfo.property_damage && (
								<View>
									<Text className="mb-1 text-sm font-medium" style={{ color: colors.textSecondary }}>Property Damage</Text>
									<Text className="text-base" style={{ color: colors.text }}>{reportInfo.property_damage}</Text>
								</View>
							)}
						</View>
					</Card>

					{/* Witness Information Card */}
					{(reportInfo.number_of_witnesses || reportInfo.witness_contact_info) && (
						<Card className="mb-5">
							<View className="mb-4 flex-row items-center">
								<View className="mr-3 h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: colors.surfaceVariant }}>
									<UserCheck size={20} color={colors.text} />
								</View>
								<Text className="text-xl font-bold" style={{ color: colors.text }}>Witness Information</Text>
							</View>

							<View className="space-y-4">
								{reportInfo.number_of_witnesses && (
									<View>
										<Text className="mb-1 text-sm font-medium" style={{ color: colors.textSecondary }}>Number of Witnesses</Text>
										<Text className="text-base" style={{ color: colors.text }}>{reportInfo.number_of_witnesses}</Text>
									</View>
								)}

								{reportInfo.witness_contact_info && (
									<View>
										<Text className="mb-1 text-sm font-medium" style={{ color: colors.textSecondary }}>Witness Contact Information</Text>
										<Text className="text-base" style={{ color: colors.text }}>{reportInfo.witness_contact_info}</Text>
									</View>
								)}
							</View>
						</Card>
					)}

					{/* Additional Information Card */}
					<Card className="mb-5">
						<View className="mb-4 flex-row items-center">
							<View className="mr-3 h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: colors.surfaceVariant }}>
								<Shield size={20} color={colors.text} />
							</View>
							<Text className="text-xl font-bold" style={{ color: colors.text }}>Additional Information</Text>
						</View>

						<View className="space-y-4">
							{reportInfo.injuries_reported && (
								<View>
									<Text className="mb-1 text-sm font-medium" style={{ color: colors.textSecondary }}>Injuries Reported</Text>
									<Text className="text-base" style={{ color: colors.text }}>{reportInfo.injuries_reported}</Text>
								</View>
							)}

							<View>
								<Text className="mb-1 text-sm font-medium" style={{ color: colors.textSecondary }}>Reported On</Text>
								<Text className="text-base" style={{ color: colors.text }}>
									{reportInfo.created_at ? formatDate(reportInfo.created_at) : 'Date not available'}
								</Text>
							</View>

						{/* last updated hidden: not present on row type */}
						</View>
					</Card>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

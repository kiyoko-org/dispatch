import { Card } from 'components/Card';
import { Container } from 'components/Container';
import { ScreenContent } from 'components/ScreenContent';
import { StatusBar, StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, ScrollView, Dimensions } from 'react-native';
import { 
	Shield, 
	AlertTriangle, 
	Phone, 
	MessageCircle, 
	Video, 
	X, 
	User, 
	ArrowLeft, 
	Bell, 
	MapPin, 
	Camera, 
	Mic, 
	FileText, 
	ChevronDown, 
	Check,
	Clock,
	Calendar,
	AlertCircle
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';

const { width: screenWidth } = Dimensions.get('window');

export default function ReportIncidentScreen() {
	const router = useRouter()
	const [incidentType, setIncidentType] = useState('Emergency')
	const [incidentTitle, setIncidentTitle] = useState('')
	const [incidentDescription, setIncidentDescription] = useState('')
	const [showIncidentTypeDropdown, setShowIncidentTypeDropdown] = useState(false)
	const [selectedLocation, setSelectedLocation] = useState('Downtown Tuguegarao')
	const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
	const [selectedDay, setSelectedDay] = useState(new Date().getDate())
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
	const [selectedHour, setSelectedHour] = useState(new Date().getHours())
	const [selectedMinute, setSelectedMinute] = useState(0)
	const [selectedAMPM, setSelectedAMPM] = useState('AM')
	const [showMonthDropdown, setShowMonthDropdown] = useState(false)
	const [showDayDropdown, setShowDayDropdown] = useState(false)
	const [showYearDropdown, setShowYearDropdown] = useState(false)
	const [showHourDropdown, setShowHourDropdown] = useState(false)
	const [showMinuteDropdown, setShowMinuteDropdown] = useState(false)
	const [showAMPMDropdown, setShowAMPMDropdown] = useState(false)

	const incidentTypes = [
		{ id: 'emergency', label: 'Emergency', color: '#DC2626', severity: 'high', icon: AlertTriangle },
		{ id: 'crime-progress', label: 'Crime in Progress', color: '#DC2626', severity: 'high', icon: Shield },
		{ id: 'suspicious', label: 'Suspicious Activity', color: '#F59E0B', severity: 'medium', icon: AlertCircle },
		{ id: 'traffic', label: 'Traffic Accident', color: '#EAB308', severity: 'medium', icon: AlertTriangle },
		{ id: 'disturbance', label: 'Public Disturbance', color: '#3B82F6', severity: 'low', icon: MessageCircle },
		{ id: 'vandalism', label: 'Vandalism', color: '#8B5CF6', severity: 'low', icon: FileText },
		{ id: 'other', label: 'Other', color: '#6B7280', severity: 'low', icon: AlertCircle }
	]

	const handleIncidentTypeSelect = (type: string) => {
		setIncidentType(type)
		setShowIncidentTypeDropdown(false)
	}

	const handleSubmitReport = () => {
		if (!incidentTitle.trim() || !incidentDescription.trim()) {
			Alert.alert(
				"Missing Information",
				"Please fill in both the incident title and description before submitting.",
				[{ text: "OK" }]
			)
			return
		}

		Alert.alert(
			"Submit Report",
			"Are you sure you want to submit this incident report?",
			[
				{ text: "Cancel", style: "cancel" },
				{ 
					text: "Submit", 
					style: "default",
					onPress: () => {
						Alert.alert("Report Submitted", "Your incident report has been submitted successfully. Authorities will review it shortly.")
						// Here you would integrate with actual reporting system
					}
				}
			]
		)
	}

	const getSelectedIncidentType = () => {
		return incidentTypes.find(type => type.label === incidentType) || incidentTypes[0]
	}

	const months = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	]

	const days = Array.from({ length: 31 }, (_, i) => i + 1)
	const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i)
	const hours = Array.from({ length: 12 }, (_, i) => i + 1)
	const minutes = Array.from({ length: 60 }, (_, i) => i)
	const ampm = ['AM', 'PM']

	const handleMonthSelect = (month: number) => {
		setSelectedMonth(month)
		setShowMonthDropdown(false)
	}

	const handleDaySelect = (day: number) => {
		setSelectedDay(day)
		setShowDayDropdown(false)
	}

	const handleYearSelect = (year: number) => {
		setSelectedYear(year)
		setShowYearDropdown(false)
	}

	const handleHourSelect = (hour: number) => {
		setSelectedHour(hour)
		setShowHourDropdown(false)
	}

	const handleMinuteSelect = (minute: number) => {
		setSelectedMinute(minute)
		setShowMinuteDropdown(false)
	}

	const handleAMPMSelect = (ampm: string) => {
		setSelectedAMPM(ampm)
		setShowAMPMDropdown(false)
	}

	return (
		<View className="flex-1 bg-gray-50">
			{/* Header */}
			<View style={styles.header}>
				<Container maxWidth="2xl" padding="none">
					<View className="flex-row items-center justify-between w-full">
						<View className="flex-row items-center flex-1">
							<TouchableOpacity
								onPress={() => router.push('/home')}
								className="w-10 h-10 bg-white rounded-full items-center justify-center mr-4 shadow-sm"
								activeOpacity={0.7}
							>
								<ArrowLeft size={20} color="#374151" />
							</TouchableOpacity>
							<View className="flex-1">
								<Text className="font-bold text-xl text-gray-900">Report Incident</Text>
								<Text className="text-sm text-gray-600 mt-1">Help Keep Community Safe</Text>
							</View>
						</View>
						<TouchableOpacity
							className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
							activeOpacity={0.7}
						>
							<Bell size={20} color="#2563EB" />
						</TouchableOpacity>
					</View>
				</Container>
			</View>

			<ScrollView 
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 40 }}
				className="flex-1"
			>
				<Container maxWidth="md" padding="sm">
					{/* Status Bar */}
					<View className="mb-6">
						<View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
							<View className="flex-row items-center justify-between mb-3">
								<View className="flex-row items-center">
									<View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
									<Text className="text-gray-700 font-medium">Report Status</Text>
								</View>
								<Text className="text-green-600 font-semibold text-sm">DRAFT</Text>
							</View>
							<View className="flex-row items-center justify-between">
								<Text className="text-gray-600 text-sm">Report ID: RPT-307619</Text>
								<Text className="text-gray-600 text-sm">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
							</View>
						</View>
					</View>

					{/* Incident Type Section */}
					<Card className="mb-6">
						<View className="flex-row items-center mb-4">
							<View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
								<AlertTriangle size={16} color="#2563EB" />
							</View>
							<Text className="font-bold text-lg text-gray-900">Incident Type</Text>
						</View>
						
						<View className="relative">
							<TouchableOpacity
								onPress={() => setShowIncidentTypeDropdown(!showIncidentTypeDropdown)}
								className="flex-row items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-4"
								activeOpacity={0.7}
							>
								<View className="flex-row items-center flex-1">
									<View 
										className="w-4 h-4 rounded-full mr-3"
										style={{ backgroundColor: getSelectedIncidentType().color }}
									/>
									<Text className="text-gray-900 font-medium text-base">{incidentType}</Text>
								</View>
								<ChevronDown size={20} color="#6B7280" />
							</TouchableOpacity>
						</View>
					</Card>

					{/* Dropdown Overlay - Positioned outside Card */}
					{showIncidentTypeDropdown && (
						<>
							{/* Backdrop */}
							<TouchableOpacity
								className="absolute inset-0 bg-black bg-opacity-30 z-50"
								onPress={() => setShowIncidentTypeDropdown(false)}
								activeOpacity={1}
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									zIndex: 50,
									elevation: 50,
								}}
							/>
							
							{/* Dropdown Content */}
							<View 
								className="absolute bg-white rounded-xl border border-gray-200 shadow-2xl"
								style={{
									position: 'absolute',
									top: 200, // Adjust this value based on your layout
									left: 20,
									right: 20,
									zIndex: 9999,
									elevation: 9999,
									shadowColor: '#000',
									shadowOffset: { width: 0, height: 4 },
									shadowOpacity: 0.15,
									shadowRadius: 8,
								}}
							>
								{incidentTypes.map((type) => {
									const IconComponent = type.icon;
									return (
										<TouchableOpacity
											key={type.id}
											onPress={() => handleIncidentTypeSelect(type.label)}
											className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
											activeOpacity={0.7}
										>
											<View className="flex-row items-center flex-1">
												<View 
													className="w-4 h-4 rounded-full mr-3"
													style={{ backgroundColor: type.color }}
												/>
												<Text className="text-gray-900 font-medium">{type.label}</Text>
											</View>
											{incidentType === type.label && (
												<Check size={18} color="#10B981" />
											)}
										</TouchableOpacity>
									)
								})}
							</View>
						</>
					)}

					{/* Incident Details Section */}
					<Card className="mb-6">
						<View className="flex-row items-center mb-4">
							<View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">
								<FileText size={16} color="#7C3AED" />
							</View>
							<Text className="font-bold text-lg text-gray-900">Incident Details</Text>
						</View>
						
						{/* Incident Title */}
						<View className="mb-4">
							<Text className="font-medium text-sm text-gray-700 mb-2">Incident Title *</Text>
							<TextInput
								placeholder="Brief description of the incident"
								value={incidentTitle}
								onChangeText={setIncidentTitle}
								className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 text-base"
								placeholderTextColor="#9CA3AF"
							/>
						</View>

						{/* Incident Description */}
						<View>
							<Text className="font-medium text-sm text-gray-700 mb-2">Detailed Description *</Text>
							<TextInput
								placeholder="Provide a detailed account of what happened, including any relevant details..."
								value={incidentDescription}
								onChangeText={setIncidentDescription}
								multiline
								numberOfLines={4}
								className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 text-base"
								placeholderTextColor="#9CA3AF"
								textAlignVertical="top"
							/>
						</View>
					</Card>

					{/* Date & Time Section */}
					<Card className="mb-6">
						<View className="flex-row items-center mb-4">
							<View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
								<Calendar size={16} color="#059669" />
							</View>
							<Text className="font-bold text-lg text-gray-900">When Did This Happen?</Text>
						</View>
						
						{/* Date Row */}
						<View className="mb-4">
							<Text className="font-medium text-sm text-gray-700 mb-2">Date</Text>
							<View className="flex-row space-x-2">
								{/* Month */}
								<View className="flex-1 relative">
									<TouchableOpacity 
										className="bg-white rounded-xl border border-gray-200 px-3 py-3"
										onPress={() => setShowMonthDropdown(!showMonthDropdown)}
										activeOpacity={0.7}
									>
										<View className="flex-row items-center justify-between">
											<Text className="text-gray-700 text-sm">{months[selectedMonth]}</Text>
											<ChevronDown size={14} color="#6B7280" />
										</View>
									</TouchableOpacity>
								</View>
								
								{/* Day */}
								<View className="flex-1 relative">
									<TouchableOpacity 
										className="bg-white rounded-xl border border-gray-200 px-3 py-3"
										onPress={() => setShowDayDropdown(!showDayDropdown)}
										activeOpacity={0.7}
									>
										<View className="flex-row items-center justify-between">
											<Text className="text-gray-700 text-sm">{selectedDay}</Text>
											<ChevronDown size={14} color="#6B7280" />
										</View>
									</TouchableOpacity>
								</View>
								
								{/* Year */}
								<View className="flex-1 relative">
									<TouchableOpacity 
										className="bg-white rounded-xl border border-gray-200 px-3 py-3"
										onPress={() => setShowYearDropdown(!showYearDropdown)}
										activeOpacity={0.7}
									>
										<View className="flex-row items-center justify-between">
											<Text className="text-gray-700 text-sm">{selectedYear}</Text>
											<ChevronDown size={14} color="#6B7280" />
										</View>
									</TouchableOpacity>
								</View>
							</View>
						</View>

						{/* Time Row */}
						<View>
							<Text className="font-medium text-sm text-gray-700 mb-2">Time</Text>
							<View className="flex-row space-x-2">
								{/* Hour */}
								<View className="flex-1 relative">
									<TouchableOpacity 
										className="bg-white rounded-xl border border-gray-200 px-3 py-3"
										onPress={() => setShowHourDropdown(!showHourDropdown)}
										activeOpacity={0.7}
									>
										<View className="flex-row items-center justify-between">
											<Text className="text-gray-700 text-sm">{selectedHour}</Text>
											<ChevronDown size={14} color="#6B7280" />
										</View>
									</TouchableOpacity>
								</View>
								
								{/* Minute */}
								<View className="flex-1 relative">
									<TouchableOpacity 
										className="bg-white rounded-xl border border-gray-200 px-3 py-3"
										onPress={() => setShowMinuteDropdown(!showMinuteDropdown)}
										activeOpacity={0.7}
									>
										<View className="flex-row items-center justify-between">
											<Text className="text-gray-700 text-sm">{selectedMinute.toString().padStart(2, '0')}</Text>
											<ChevronDown size={14} color="#6B7280" />
										</View>
									</TouchableOpacity>
								</View>
								
								{/* AM/PM */}
								<View className="flex-1 relative">
									<TouchableOpacity 
										className="bg-white rounded-xl border border-gray-200 px-3 py-3"
										onPress={() => setShowAMPMDropdown(!showAMPMDropdown)}
										activeOpacity={0.7}
									>
										<View className="flex-row items-center justify-between">
											<Text className="text-gray-700 text-sm">{selectedAMPM}</Text>
											<ChevronDown size={14} color="#6B7280" />
										</View>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</Card>

					{/* Month Dropdown Overlay */}
					{showMonthDropdown && (
						<>
							<TouchableOpacity
								className="absolute inset-0 bg-black bg-opacity-30 z-50"
								onPress={() => setShowMonthDropdown(false)}
								activeOpacity={1}
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									zIndex: 50,
									elevation: 50,
								}}
							/>
							
							<View 
								className="absolute bg-white rounded-xl border border-gray-200 shadow-2xl max-h-80"
								style={{
									position: 'absolute',
									top: 350,
									left: 20,
									right: 20,
									zIndex: 9999,
									elevation: 9999,
									shadowColor: '#000',
									shadowOffset: { width: 0, height: 4 },
									shadowOpacity: 0.15,
									shadowRadius: 8,
								}}
							>
								<ScrollView showsVerticalScrollIndicator={false}>
									{months.map((month, index) => (
										<TouchableOpacity
											key={index}
											onPress={() => handleMonthSelect(index)}
											className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
											activeOpacity={0.7}
										>
											<Text className="text-gray-900 font-medium">{month}</Text>
											{selectedMonth === index && (
												<Check size={18} color="#10B981" />
											)}
										</TouchableOpacity>
									))}
								</ScrollView>
							</View>
						</>
					)}

					{/* Day Dropdown Overlay */}
					{showDayDropdown && (
						<>
							<TouchableOpacity
								className="absolute inset-0 bg-black bg-opacity-30 z-50"
								onPress={() => setShowDayDropdown(false)}
								activeOpacity={1}
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									zIndex: 50,
									elevation: 50,
								}}
							/>
							
							<View 
								className="absolute bg-white rounded-xl border border-gray-200 shadow-2xl max-h-80"
								style={{
									position: 'absolute',
									top: 350,
									left: 20,
									right: 20,
									zIndex: 9999,
									elevation: 9999,
									shadowColor: '#000',
									shadowOffset: { width: 0, height: 4 },
									shadowOpacity: 0.15,
									shadowRadius: 8,
								}}
							>
								<ScrollView showsVerticalScrollIndicator={false}>
									{days.map((day) => (
										<TouchableOpacity
											key={day}
											onPress={() => handleDaySelect(day)}
											className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
											activeOpacity={0.7}
										>
											<Text className="text-gray-900 font-medium">{day}</Text>
											{selectedDay === day && (
												<Check size={18} color="#10B981" />
											)}
										</TouchableOpacity>
									))}
								</ScrollView>
							</View>
						</>
					)}

					{/* Year Dropdown Overlay */}
					{showYearDropdown && (
						<>
							<TouchableOpacity
								className="absolute inset-0 bg-black bg-opacity-30 z-50"
								onPress={() => setShowYearDropdown(false)}
								activeOpacity={1}
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									zIndex: 50,
									elevation: 50,
								}}
							/>
							
							<View 
								className="absolute bg-white rounded-xl border border-gray-200 shadow-2xl max-h-80"
								style={{
									position: 'absolute',
									top: 350,
									left: 20,
									right: 20,
									zIndex: 9999,
									elevation: 9999,
									shadowColor: '#000',
									shadowOffset: { width: 0, height: 4 },
									shadowOpacity: 0.15,
									shadowRadius: 8,
								}}
							>
								<ScrollView showsVerticalScrollIndicator={false}>
									{years.map((year) => (
										<TouchableOpacity
											key={year}
											onPress={() => handleYearSelect(year)}
											className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
											activeOpacity={0.7}
										>
											<Text className="text-gray-900 font-medium">{year}</Text>
											{selectedYear === year && (
												<Check size={18} color="#10B981" />
											)}
										</TouchableOpacity>
									))}
								</ScrollView>
							</View>
						</>
					)}

					{/* Hour Dropdown Overlay */}
					{showHourDropdown && (
						<>
							<TouchableOpacity
								className="absolute inset-0 bg-black bg-opacity-30 z-50"
								onPress={() => setShowHourDropdown(false)}
								activeOpacity={1}
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									zIndex: 50,
									elevation: 50,
								}}
							/>
							
							<View 
								className="absolute bg-white rounded-xl border border-gray-200 shadow-2xl max-h-80"
								style={{
									position: 'absolute',
									top: 400,
									left: 20,
									right: 20,
									zIndex: 9999,
									elevation: 9999,
									shadowColor: '#000',
									shadowOffset: { width: 0, height: 4 },
									shadowOpacity: 0.15,
									shadowRadius: 8,
								}}
							>
								<ScrollView showsVerticalScrollIndicator={false}>
									{hours.map((hour) => (
										<TouchableOpacity
											key={hour}
											onPress={() => handleHourSelect(hour)}
											className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
											activeOpacity={0.7}
										>
											<Text className="text-gray-900 font-medium">{hour}</Text>
											{selectedHour === hour && (
												<Check size={18} color="#10B981" />
											)}
										</TouchableOpacity>
									))}
								</ScrollView>
							</View>
						</>
					)}

					{/* Minute Dropdown Overlay */}
					{showMinuteDropdown && (
						<>
							<TouchableOpacity
								className="absolute inset-0 bg-black bg-opacity-30 z-50"
								onPress={() => setShowMinuteDropdown(false)}
								activeOpacity={1}
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									zIndex: 50,
									elevation: 50,
								}}
							/>
							
							<View 
								className="absolute bg-white rounded-xl border border-gray-200 shadow-2xl max-h-80"
								style={{
									position: 'absolute',
									top: 400,
									left: 20,
									right: 20,
									zIndex: 9999,
									elevation: 9999,
									shadowColor: '#000',
									shadowOffset: { width: 0, height: 4 },
									shadowOpacity: 0.15,
									shadowRadius: 8,
								}}
							>
								<ScrollView showsVerticalScrollIndicator={false}>
									{minutes.map((minute) => (
										<TouchableOpacity
											key={minute}
											onPress={() => handleMinuteSelect(minute)}
											className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
											activeOpacity={0.7}
										>
											<Text className="text-gray-900 font-medium">{minute.toString().padStart(2, '0')}</Text>
											{selectedMinute === minute && (
												<Check size={18} color="#10B981" />
											)}
										</TouchableOpacity>
									))}
								</ScrollView>
							</View>
						</>
					)}

					{/* AM/PM Dropdown Overlay */}
					{showAMPMDropdown && (
						<>
							<TouchableOpacity
								className="absolute inset-0 bg-black bg-opacity-30 z-50"
								onPress={() => setShowAMPMDropdown(false)}
								activeOpacity={1}
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									zIndex: 50,
									elevation: 50,
								}}
							/>
							
							<View 
								className="absolute bg-white rounded-xl border border-gray-200 shadow-2xl max-h-80"
								style={{
									position: 'absolute',
									top: 400,
									left: 20,
									right: 20,
									zIndex: 9999,
									elevation: 9999,
									shadowColor: '#000',
									shadowOffset: { width: 0, height: 4 },
									shadowOpacity: 0.15,
									shadowRadius: 8,
								}}
							>
								<ScrollView showsVerticalScrollIndicator={false}>
									{ampm.map((period) => (
										<TouchableOpacity
											key={period}
											onPress={() => handleAMPMSelect(period)}
											className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
											activeOpacity={0.7}
										>
											<Text className="text-gray-900 font-medium">{period}</Text>
											{selectedAMPM === period && (
												<Check size={18} color="#10B981" />
											)}
										</TouchableOpacity>
									))}
								</ScrollView>
							</View>
						</>
					)}

					{/* Location Section */}
					<Card className="mb-6">
						<View className="flex-row items-center mb-4">
							<View className="w-8 h-8 bg-red-100 rounded-full items-center justify-center mr-3">
								<MapPin size={16} color="#DC2626" />
							</View>
							<Text className="font-bold text-lg text-gray-900">Location</Text>
						</View>
						
						<TouchableOpacity className="bg-white rounded-xl border border-gray-200 px-4 py-4">
							<View className="flex-row items-center">
								<MapPin size={20} color="#6B7280" className="mr-3" />
								<View className="flex-1">
									<Text className="text-gray-900 font-medium">Current Location</Text>
									<Text className="text-gray-600 text-sm mt-1">{selectedLocation}</Text>
								</View>
								<ChevronDown size={20} color="#6B7280" />
							</View>
						</TouchableOpacity>
					</Card>

					{/* Evidence Section */}
					<Card className="mb-6">
						<View className="flex-row items-center mb-4">
							<View className="w-8 h-8 bg-yellow-100 rounded-full items-center justify-center mr-3">
								<Camera size={16} color="#D97706" />
							</View>
							<Text className="font-bold text-lg text-gray-900">Evidence & Attachments</Text>
						</View>
						
						<View className="space-y-3">
							<TouchableOpacity className="bg-white rounded-xl border border-gray-200 px-4 py-4">
								<View className="flex-row items-center">
									<Camera size={20} color="#6B7280" className="mr-3" />
									<View className="flex-1">
										<Text className="text-gray-900 font-medium">Add Photos</Text>
										<Text className="text-gray-600 text-sm mt-1">Upload relevant images</Text>
									</View>
									<View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
										<Text className="text-gray-600 text-sm">+</Text>
									</View>
								</View>
							</TouchableOpacity>

							<TouchableOpacity className="bg-white rounded-xl border border-gray-200 px-4 py-4">
								<View className="flex-row items-center">
									<Mic size={20} color="#6B7280" className="mr-3" />
									<View className="flex-1">
										<Text className="text-gray-900 font-medium">Audio Recording</Text>
										<Text className="text-gray-600 text-sm mt-1">Record your statement</Text>
									</View>
									<View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
										<Text className="text-gray-600 text-sm">+</Text>
									</View>
								</View>
							</TouchableOpacity>

							<TouchableOpacity className="bg-white rounded-xl border border-gray-200 px-4 py-4">
								<View className="flex-row items-center">
									<FileText size={20} color="#6B7280" className="mr-3" />
									<View className="flex-1">
										<Text className="text-gray-900 font-medium">Documents</Text>
										<Text className="text-gray-600 text-sm mt-1">Attach relevant files</Text>
									</View>
									<View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
										<Text className="text-gray-600 text-sm">+</Text>
									</View>
								</View>
							</TouchableOpacity>
						</View>
					</Card>

					{/* Important Notice */}
					<View className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-200">
						<View className="flex-row items-start">
							<View className="w-8 h-8 bg-amber-100 rounded-full items-center justify-center mr-3 mt-1">
								<AlertCircle size={16} color="#D97706" />
							</View>
							<View className="flex-1">
								<Text className="text-amber-900 font-bold text-base mb-1">Important Notice</Text>
								<Text className="text-amber-800 text-sm">
									Please ensure all information provided is accurate and truthful. False reports may result in legal consequences.
								</Text>
							</View>
						</View>
					</View>

					{/* Submit Button */}
					<TouchableOpacity
						onPress={handleSubmitReport}
						className="w-full bg-blue-600 rounded-xl py-4 px-6 items-center shadow-lg"
						activeOpacity={0.8}
					>
						<View className="flex-row items-center">
							<Check size={20} color="white" />
							<Text className="text-white font-bold text-lg ml-2">Submit Report</Text>
						</View>
					</TouchableOpacity>

					{/* Footer Note */}
					<View className="mt-4 items-center">
						<Text className="text-gray-500 text-xs text-center">
							This report will be reviewed by local authorities within 24 hours
						</Text>
					</View>
				</Container>
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	header: {
		paddingTop: StatusBar.currentHeight || 44, 
		padding: 20, 
		width: '100%', 
		backgroundColor: 'white',
		borderBottomWidth: 1,
		borderBottomColor: '#F3F4F6',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	}
})

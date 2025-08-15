import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Shield, FileText, CheckCircle, Zap, AlertTriangle, Bell, Users, Search, Coins, Newspaper, Building, ArrowRight, BarChart3, TrendingUp, Activity, Clock, User, Settings, LogOut, MapPin, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Sidebar } from '../../components/sidebar';
import UserProfile from '../../components/UserProfile';

export default function Home() {
	const router = useRouter()
	const [isSidebarVisible, setIsSidebarVisible] = useState(false);

	const toggleSidebar = () => {
		setIsSidebarVisible(!isSidebarVisible);
	};

	const handleLogout = () => {
		// Handle logout logic
		router.push('/login');
	};

	const handleEmergency = () => {
		router.push('/emergency');
	};

	const handleReportIncident = () => {
		router.push('/report-incident');
	};

	return (
		<View className="flex-1 bg-gray-50">
			<StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
			
			{/* Backdrop overlay when sidebar is open */}
			{isSidebarVisible && (
				<TouchableOpacity 
					className="absolute inset-0 bg-black/30 z-40"
					onPress={() => setIsSidebarVisible(false)}
					activeOpacity={1}
				/>
			)}
			
			{/* Sidebar - Overlay on top when visible */}
			<View 
				className={`absolute top-0 left-0 z-50 h-full ${
					isSidebarVisible ? 'translate-x-0' : '-translate-x-full'
				}`}
			>
				<Sidebar 
					activeRoute="dashboard" 
					onClose={() => setIsSidebarVisible(false)}
				/>
			</View>
			
			{/* Header */}
			<View className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-6">
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center">
						<View className="w-10 h-10 bg-indigo-500 rounded-full items-center justify-center mr-3">
							<Text className="text-white text-xl font-bold">D</Text>
						</View>
						<View>
							<Text className="text-gray-900 font-bold text-lg sm:text-xl">Welcome back, User</Text>
							<Text className="text-gray-600 text-sm">Dispatch Dashboard</Text>
						</View>
					</View>
					
					<View className="flex-row items-center space-x-3">
						<TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
							<Settings size={20} color="#6B7280" />
						</TouchableOpacity>
						<TouchableOpacity onPress={handleLogout} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
							<LogOut size={20} color="#6B7280" />
						</TouchableOpacity>
					</View>
				</View>
			</View>

			{/* Main Content */}
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				{/* Welcome Banner */}
				<View className="bg-blue-800 p-6 sm:p-8">
					<View className="flex-row items-center justify-between mb-2">
						<Text className="text-white text-2xl sm:text-3xl font-bold">Welcome back, John! 👋</Text>
						{/* User Profile Component */}
						<UserProfile 
							userName="John Doe"
							onToggleSidebar={toggleSidebar}
						/>
					</View>
					<Text className="text-blue-100 text-base sm:text-lg mb-6">Your community is safer with you</Text>
					
					<View className="bg-white/20 p-4 rounded-xl border border-white/30">
						<View className="flex-row items-center justify-between mb-3">
							<View className="flex-row items-center">
								<Shield size={24} color="#FCD34D" />
								<Text className="text-white font-semibold text-lg ml-3">Security Status</Text>
							</View>
							<View className="bg-green-400 px-3 py-1 rounded-full">
								<Text className="text-white text-xs font-bold">Secure</Text>
							</View>
						</View>
						<View className="bg-white/30 rounded-full h-3 mb-2">
							<View className="bg-green-400 rounded-full h-3 w-4/5" />
						</View>
						<Text className="text-green-200 text-sm font-medium">GOOD TIER - 87%</Text>
					</View>
				</View>

				{/* Key Metrics */}
				<View className="px-4 sm:px-6 mt-6 mb-8">
					<Text className="text-gray-900 font-bold text-lg sm:text-xl mb-4 sm:mb-6">Key Metrics</Text>
					<View className="flex-row flex-wrap gap-3">
						<View className="bg-blue-100 rounded-xl p-3 sm:p-4 border border-blue-200" style={{ width: '48%' }}>
							<View className="items-center">
								<View className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-200 rounded-lg items-center justify-center mb-2">
									<Shield size={20} color="#1E40AF" />
								</View>
								<Text className="text-xl sm:text-2xl font-bold text-blue-900">87%</Text>
								<Text className="text-blue-700 text-xs font-medium text-center">Trust Score</Text>
							</View>
						</View>
						<View className="bg-green-100 rounded-xl p-3 sm:p-4 border border-green-200" style={{ width: '48%' }}>
							<View className="items-center">
								<View className="w-8 h-8 sm:w-10 sm:h-10 bg-green-200 rounded-lg items-center justify-center mb-2">
									<FileText size={20} color="#059669" />
								</View>
								<Text className="text-xl sm:text-2xl font-bold text-green-900">47</Text>
								<Text className="text-green-700 text-xs font-medium text-center">Reports</Text>
							</View>
						</View>
						<View className="bg-emerald-100 rounded-xl p-3 sm:p-4 border border-emerald-200" style={{ width: '48%' }}>
							<View className="items-center">
								<View className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-200 rounded-lg items-center justify-center mb-2">
									<CheckCircle size={20} color="#10B981" />
								</View>
								<Text className="text-xl sm:text-2xl font-bold text-emerald-900">42</Text>
								<Text className="text-emerald-700 text-xs font-medium text-center">Verified</Text>
							</View>
						</View>
						<View className="bg-amber-100 rounded-xl p-3 sm:p-4 border border-amber-200" style={{ width: '48%' }}>
							<View className="items-center">
								<View className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-200 rounded-lg items-center justify-center mb-2">
									<Zap size={20} color="#D97706" />
								</View>
								<Text className="text-xl sm:text-2xl font-bold text-amber-900">2.3min</Text>
								<Text className="text-amber-700 text-xs font-medium text-center">Response</Text>
							</View>
						</View>
					</View>
				</View>

				{/* Emergency Actions */}
				<View className="px-4 sm:px-6 mb-8">
					<View className="flex-row items-center mb-4">
						<AlertTriangle size={24} color="#DC2626" />
						<Text className="text-gray-900 font-bold text-lg sm:text-xl ml-3">Quick Actions</Text>
						<View className="bg-red-500 px-2 sm:px-3 py-1 rounded-full ml-3">
							<Text className="text-white text-xs font-bold">2 warnings</Text>
						</View>
					</View>
					
					<View className="flex-row gap-4">
						<TouchableOpacity 
							className="bg-red-500 flex-1 p-4 rounded-3xl border border-red-400/30"
							style={{
								elevation: 8,
								shadowColor: '#EF4444',
								shadowOffset: { width: 0, height: 8 },
								shadowOpacity: 0.3,
								shadowRadius: 16,
							}}
							onPress={handleEmergency}
						>
							<View className="items-center relative">
								<View className="absolute top-0 right-0 w-3 h-3 bg-red-300 rounded-full opacity-60" />
								<View className="w-12 h-12 bg-white/25 rounded-2xl items-center justify-center mb-3 border border-white/30">
									<AlertTriangle size={24} color="white" />
								</View>
								<Text className="text-white font-bold text-lg text-center mb-1">Emergency Alert</Text>
								<Text className="text-red-100 text-xs text-center font-medium">Tap for immediate response</Text>
							</View>
						</TouchableOpacity>
						
						<TouchableOpacity 
							className="bg-amber-500 flex-1 p-4 rounded-3xl border border-amber-400/30"
							style={{
								elevation: 8,
								shadowColor: '#F59E0B',
								shadowOffset: { width: 0, height: 8 },
								shadowOpacity: 0.3,
								shadowRadius: 16,
							}}
							onPress={handleReportIncident}
						>
							<View className="items-center relative">
								<View className="absolute top-0 right-0 w-3 h-3 bg-amber-300 rounded-full opacity-60" />
								<View className="w-12 h-12 bg-white/25 rounded-2xl items-center justify-center mb-3 border border-white/30">
									<Bell size={24} color="white" />
								</View>
								<Text className="text-white font-bold text-lg text-center mb-1">Report Incident</Text>
								<Text className="text-amber-100 text-xs text-center font-medium">Submit a new report</Text>
							</View>
						</TouchableOpacity>
					</View>
				</View>

				{/* Quick Access */}
				<View className="px-4 sm:px-6 mb-8">
					<Text className="text-gray-900 font-bold text-lg sm:text-xl mb-4 sm:mb-6">Features</Text>
					
					<View className="flex-row flex-wrap gap-3">
						<TouchableOpacity className="bg-blue-100 p-4 sm:p-5 rounded-xl border border-blue-200" style={{ width: '31%' }}>
							<View className="items-center">
								<View className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-200 rounded-lg items-center justify-center mb-3">
									<Shield size={24} color="#1E40AF" />
								</View>
								<Text className="text-blue-800 font-semibold text-sm text-center">Anonymity</Text>
							</View>
						</TouchableOpacity>
						
						<TouchableOpacity className="bg-green-100 p-4 sm:p-5 rounded-xl border border-green-200" style={{ width: '31%' }}>
							<View className="items-center">
								<View className="w-10 h-10 sm:w-12 sm:h-12 bg-green-200 rounded-lg items-center justify-center mb-3">
									<Search size={24} color="#059669" />
								</View>
								<Text className="text-green-800 font-semibold text-sm text-center">Lost & Found</Text>
							</View>
						</TouchableOpacity>
						
						<TouchableOpacity className="bg-purple-100 p-4 sm:p-5 rounded-xl border border-purple-200" style={{ width: '31%' }}>
							<View className="items-center">
								<View className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-200 rounded-lg items-center justify-center mb-3">
									<Users size={24} color="#7C3AED" />
								</View>
								<Text className="text-purple-800 font-semibold text-sm text-center">Community</Text>
							</View>
						</TouchableOpacity>
						
						<TouchableOpacity className="bg-yellow-100 p-4 sm:p-5 rounded-xl border border-yellow-200" style={{ width: '31%' }}>
							<View className="items-center">
								<View className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-200 rounded-lg items-center justify-center mb-3">
									<Coins size={24} color="#D97706" />
								</View>
								<Text className="text-yellow-800 font-semibold text-sm text-center">Bounties</Text>
							</View>
						</TouchableOpacity>
						
						<TouchableOpacity className="bg-red-100 p-4 sm:p-5 rounded-xl border border-red-200" style={{ width: '31%' }}>
							<View className="items-center">
								<View className="w-10 h-10 sm:w-12 sm:h-12 bg-red-200 rounded-lg items-center justify-center mb-3">
									<Newspaper size={24} color="#DC2626" />
								</View>
								<Text className="text-red-800 font-semibold text-sm text-center">News</Text>
							</View>
						</TouchableOpacity>
						
						<TouchableOpacity className="bg-indigo-100 p-4 sm:p-5 rounded-xl border border-indigo-200" style={{ width: '31%' }}>
							<View className="items-center">
								<View className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-200 rounded-lg items-center justify-center mb-3">
									<MapPin size={24} color="#3730A3" />
								</View>
								<Text className="text-indigo-800 font-semibold text-sm text-center">Map</Text>
							</View>
						</TouchableOpacity>
					</View>
				</View>

				{/* Recent Activity */}
				<View className="px-4 sm:px-6 mb-8">
					<Text className="text-gray-900 font-bold text-lg sm:text-xl mb-4 sm:mb-6">Recent Activity</Text>
					
					<View className="space-y-3 sm:space-y-4">
						<View className="bg-green-100 p-3 sm:p-4 sm:p-5 rounded-lg sm:rounded-xl border border-green-200">
							<View className="flex-row items-center">
								<View className="w-8 h-8 sm:w-10 sm:h-10 bg-green-200 rounded-lg items-center justify-center mr-3 sm:mr-4">
									<CheckCircle size={20} color="#059669" />
								</View>
								<View className="flex-1">
									<Text className="text-green-800 font-semibold text-sm sm:text-base">Case #1234 resolved</Text>
									<Text className="text-green-600 text-xs sm:text-sm">Lost phone returned to owner</Text>
								</View>
								<Text className="text-green-600 text-xs">2h ago</Text>
							</View>
						</View>
						
						<View className="bg-blue-100 p-3 sm:p-4 sm:p-5 rounded-lg sm:rounded-xl border border-blue-200">
							<View className="flex-row items-center">
								<View className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-200 rounded-lg items-center justify-center mr-3 sm:mr-4">
									<AlertCircle size={20} color="#1E40AF" />
								</View>
								<View className="flex-1">
									<Text className="text-blue-800 font-semibold text-sm sm:text-base">New incident reported</Text>
									<Text className="text-blue-600 text-xs sm:text-sm">Traffic accident on Main St</Text>
								</View>
								<Text className="text-blue-600 text-xs">4h ago</Text>
							</View>
						</View>
						
						<View className="bg-amber-100 p-3 sm:p-4 sm:p-5 rounded-lg sm:rounded-xl border border-amber-200">
							<View className="flex-row items-center">
								<View className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-200 rounded-lg items-center justify-center mr-3 sm:mr-4">
									<Clock size={20} color="#D97706" />
								</View>
								<View className="flex-1">
									<Text className="text-amber-800 font-semibold text-sm sm:text-base">Case #1230 updated</Text>
									<Text className="text-amber-600 text-xs sm:text-sm">Investigation in progress</Text>
								</View>
								<Text className="text-amber-600 text-xs">6h ago</Text>
							</View>
						</View>
					</View>
				</View>

				{/* Bottom Spacing */}
				<View className="h-8" />
			</ScrollView>

		</View>
	);
}

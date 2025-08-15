import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Shield, FileText, CheckCircle, Zap, AlertTriangle, Bell, Users, Search, Coins, Newspaper, Building, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Sidebar } from '../../components/sidebar';
import UserProfile from '../../components/UserProfile';
import { EmergencyButton } from '../../components/EmergencyButton';

export default function Home() {
	const router = useRouter()
	const [isSidebarVisible, setIsSidebarVisible] = useState(false);

	const toggleSidebar = () => {
		setIsSidebarVisible(!isSidebarVisible);
	};

	return (
		<View className="flex-1 bg-gray-100">
			{/* Backdrop overlay when sidebar is open */}
			{isSidebarVisible && (
				<TouchableOpacity 
					className="absolute inset-0 bg-black/30 z-40"
					onPress={() => setIsSidebarVisible(false)}
					activeOpacity={1}
				/>
			)}
			
			{/* Sidebar - Overlay on top when visible with smooth animation */}
			<View 
				className={`absolute top-0 left-0 z-50 h-full transition-all duration-300 ease-in-out transform ${
					isSidebarVisible ? 'translate-x-0' : '-translate-x-full'
				}`}
			>
				<Sidebar 
					activeRoute="dashboard" 
					onClose={() => setIsSidebarVisible(false)}
				/>
			</View>
			
			{/* Main Content */}
			<View className="flex-1">
				<ScrollView className="flex-1">
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
						<View className="grid grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
							<View className="bg-blue-100 rounded-xl p-2 sm:p-3 shadow-md border border-blue-200">
								<Shield size={20} color="#1E40AF" />
								<Text className="text-xl sm:text-2xl font-bold mt-2 text-blue-900">87%</Text>
								<Text className="text-blue-700 text-xs font-medium">Trust Score</Text>
							</View>
							<View className="bg-green-100 rounded-xl p-2 sm:p-3 shadow-md border border-green-200">
								<FileText size={20} color="#059669" />
								<Text className="text-xl sm:text-2xl font-bold mt-2 text-green-900">47</Text>
								<Text className="text-green-700 text-xs font-medium">Reports</Text>
							</View>
							<View className="bg-emerald-100 rounded-xl p-2 sm:p-3 shadow-md border border-emerald-200">
								<CheckCircle size={20} color="#10B981" />
								<Text className="text-xl sm:text-2xl font-bold mt-2 text-emerald-900">42</Text>
								<Text className="text-emerald-700 text-xs font-medium">Verified</Text>
							</View>
							<View className="bg-amber-100 rounded-xl p-2 sm:p-3 shadow-md border border-amber-200">
								<Zap size={20} color="#D97706" />
								<Text className="text-xl sm:text-2xl font-bold mt-2 text-amber-900">2.3min</Text>
								<Text className="text-amber-700 text-xs font-medium">Response</Text>
							</View>
						</View>
					</View>

					{/* Emergency Actions */}
					<View className="px-4 sm:px-6 mb-8">
						<View className="flex-row items-center mb-4">
							<AlertTriangle size={24} color="#DC2626" />
							<Text className="text-gray-900 font-bold text-lg sm:text-xl ml-3">Quick Actions</Text>
							<View className="bg-red-500 px-2 sm:px-3 py-1 rounded-full ml-3 shadow-sm">
								<Text className="text-white text-xs font-bold">2 warnings</Text>
							</View>
						</View>
						
						<View className="flex-row gap-4">
							<TouchableOpacity 
								className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex-1 p-4 rounded-3xl shadow-2xl border border-red-400/30 transition-all duration-300 ease-out hover:shadow-red-500/25 hover:scale-105 active:scale-95 active:shadow-lg"
								style={{
									transform: [{ scale: 1 }],
									shadowColor: '#EF4444',
									shadowOffset: { width: 0, height: 8 },
									shadowOpacity: 0.3,
									shadowRadius: 16,
									elevation: 8,
								}}
								onPress={() => router.push('/emergency')}
							>
								<View className="items-center relative">
									<View className="absolute top-0 right-0 w-3 h-3 bg-red-300 rounded-full opacity-60 animate-pulse" />
									<View className="w-12 h-12 bg-white/25 backdrop-blur-sm rounded-2xl items-center justify-center mb-3 border border-white/30 transition-all duration-200 hover:bg-white/40 hover:scale-110">
										<AlertTriangle size={24} color="white" className="transition-transform duration-200 hover:rotate-12" />
									</View>
									<Text className="text-white font-bold text-lg text-center mb-1 transition-colors duration-200 hover:text-red-50">Emergency Alert</Text>
									<Text className="text-red-100 text-xs text-center font-medium transition-colors duration-200 hover:text-red-50">Tap for immediate response</Text>
								</View>
							</TouchableOpacity>
							
							<TouchableOpacity 
								className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex-1 p-4 rounded-3xl shadow-2xl border border-amber-400/30 transition-all duration-300 ease-out hover:shadow-amber-500/25 hover:scale-105 active:scale-95 active:shadow-lg"
								style={{
									transform: [{ scale: 1 }],
									shadowColor: '#F59E0B',
									shadowOffset: { width: 0, height: 8 },
									shadowOpacity: 0.3,
									shadowRadius: 16,
									elevation: 8,
								}}
								onPress={() => router.push('/report-incident')}
							>
								<View className="items-center relative">
									<View className="absolute top-0 right-0 w-3 h-3 bg-amber-300 rounded-full opacity-60 animate-pulse" />
									<View className="w-12 h-12 bg-white/25 backdrop-blur-sm rounded-2xl items-center justify-center mb-3 border border-white/30 transition-all duration-200 hover:bg-white/40 hover:scale-110">
										<Bell size={24} color="white" className="transition-transform duration-200 hover:rotate-12" />
									</View>
									<Text className="text-white font-bold text-lg text-center mb-1 transition-colors duration-200 hover:text-amber-50">Report Incident</Text>
									<Text className="text-amber-100 text-xs text-center font-medium transition-colors duration-200 hover:text-amber-50">Submit a new report</Text>
								</View>
							</TouchableOpacity>
						</View>
					</View>

					{/* Quick Access */}
					<View className="px-4 sm:px-6 mb-8">
						<Text className="text-gray-900 font-bold text-lg sm:text-xl mb-4 sm:mb-6">Features</Text>
						
						<View className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
							<TouchableOpacity className="bg-blue-100 p-3 sm:p-4 lg:p-6 rounded-xl border border-blue-200 shadow-md">
								<View className="items-center">
									<View className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-200 rounded-lg items-center justify-center mb-2 sm:mb-3">
										<Shield size={20} color="#1E40AF" />
									</View>
									<Text className="text-blue-800 font-semibold text-xs sm:text-sm text-center">Anonymity</Text>
								</View>
							</TouchableOpacity>
							
							<TouchableOpacity className="bg-green-100 p-3 sm:p-4 lg:p-6 rounded-xl border border-green-200 shadow-md">
								<View className="items-center">
									<View className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-200 rounded-lg items-center justify-center mb-2 sm:mb-3">
										<Search size={20} color="#059669" />
									</View>
									<Text className="text-green-800 font-semibold text-xs sm:text-sm text-center">Lost & Found</Text>
								</View>
							</TouchableOpacity>
							
							<TouchableOpacity className="bg-purple-100 p-3 sm:p-4 lg:p-6 rounded-xl border border-purple-200 shadow-md">
								<View className="items-center">
									<View className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-200 rounded-lg items-center justify-center mb-2 sm:mb-3">
										<Users size={20} color="#7C3AED" />
									</View>
									<Text className="text-purple-800 font-semibold text-xs sm:text-sm text-center">Community</Text>
								</View>
							</TouchableOpacity>
							
							<TouchableOpacity className="bg-yellow-100 p-3 sm:p-4 lg:p-6 rounded-xl border border-yellow-200 shadow-md">
								<View className="items-center">
									<View className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-yellow-200 rounded-lg items-center justify-center mb-2 sm:mb-3">
										<Coins size={20} color="#D97706" />
									</View>
									<Text className="text-yellow-800 font-semibold text-xs sm:text-sm text-center">Bounties</Text>
								</View>
							</TouchableOpacity>
							
							<TouchableOpacity className="bg-red-100 p-3 sm:p-4 lg:p-6 rounded-xl border border-red-200 shadow-md">
								<View className="items-center">
									<View className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-200 rounded-lg items-center justify-center mb-2 sm:mb-3">
										<Newspaper size={20} color="#DC2626" />
									</View>
									<Text className="text-red-800 font-semibold text-xs sm:text-sm text-center">News Feed</Text>
								</View>
							</TouchableOpacity>
							
							<TouchableOpacity className="bg-indigo-100 p-3 sm:p-4 lg:p-6 rounded-xl border border-indigo-200 shadow-md">
								<View className="items-center">
									<View className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-indigo-200 rounded-lg items-center justify-center mb-2 sm:mb-3">
										<Building size={20} color="#4F46E5" />
									</View>
									<Text className="text-indigo-800 font-semibold text-xs sm:text-sm text-center">Cases</Text>
								</View>
							</TouchableOpacity>
						</View>
					</View>

					{/* Recent Activity */}
					<View className="px-3 sm:px-4 lg:px-6 mb-6 sm:mb-8">
						<Text className="text-gray-900 font-bold text-base sm:text-lg lg:text-xl mb-3 sm:mb-4">Recent Activity</Text>
						
						<View className="space-y-2 sm:space-y-3">
							<View className="bg-green-100 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl border border-green-200 shadow-sm sm:shadow-md">
								<View className="flex-row items-center justify-between mb-2">
									<View className="flex-row items-center flex-1 mr-2">
										<View className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full mr-2 sm:mr-3 flex-shrink-0" />
										<Text className="text-green-800 font-semibold text-sm sm:text-base lg:text-lg flex-1">Security alert resolved in Sector A</Text>
									</View>
									<Text className="text-green-600 font-bold text-xs sm:text-sm lg:text-base flex-shrink-0">Resolved</Text>
								</View>
								<Text className="text-green-600 text-xs sm:text-sm ml-4 sm:ml-6">2 hours ago</Text>
							</View>
							
							<View className="bg-blue-100 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl border border-blue-200 shadow-sm sm:shadow-md">
								<View className="flex-row items-center justify-between mb-2">
									<View className="flex-row items-center flex-1 mr-2">
										<View className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full mr-2 sm:mr-3 flex-shrink-0" />
										<Text className="text-blue-800 font-semibold text-sm sm:text-base lg:text-lg flex-1">New community safety guideline published</Text>
									</View>
									<Text className="text-blue-600 font-bold text-xs sm:text-sm lg:text-base flex-shrink-0">New</Text>
								</View>
								<Text className="text-blue-600 text-xs sm:text-sm ml-4 sm:ml-6">5 hours ago</Text>
							</View>
							
							<View className="bg-amber-100 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl border border-amber-200 shadow-sm sm:shadow-md">
								<View className="flex-row items-center justify-between mb-2">
									<View className="flex-row items-center flex-1 mr-2">
										<View className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full mr-2 sm:mr-3 flex-shrink-0" />
										<Text className="text-amber-800 font-semibold text-sm sm:text-base lg:text-lg flex-1">Suspicious activity report under investigation</Text>
									</View>
									<Text className="text-amber-600 font-bold text-xs sm:text-sm lg:text-base flex-shrink-0">Investigating</Text>
								</View>
								<Text className="text-amber-600 text-xs sm:text-sm ml-4 sm:ml-6">1 day ago</Text>
							</View>
						</View>
					</View>
				</ScrollView>
			</View>

			{/* Emergency Button - Floating Action Button */}
			<EmergencyButton />
		</View>
	);
}

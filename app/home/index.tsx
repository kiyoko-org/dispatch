import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Shield, FileText, CheckCircle, Zap, AlertTriangle, Bell, Users, Search, Coins, Newspaper, Building, ArrowRight } from 'lucide-react-native';
import '../../global.css';

export default function Home() {
	return (
		<ScrollView className="flex-1 bg-gray-100">
			{/* Welcome Banner */}
			<View className="bg-gray-900 p-8">
				<Text className="text-white text-3xl font-bold mb-2">Welcome back, John! 👋</Text>
				<Text className="text-gray-300 text-lg mb-6">Your community is safer with you</Text>
				
				<View className="bg-gray-800 p-4 rounded-xl">
					<View className="flex-row items-center mb-3">
						<Shield size={24} color="white" />
						<Text className="text-white font-semibold text-lg ml-3">Trust Score</Text>
					</View>
					<View className="bg-gray-700 rounded-full h-4 mb-2">
						<View className="bg-white rounded-full h-4 w-4/5" />
					</View>
					<Text className="text-gray-300 text-sm">GOOD TIER - 87%</Text>
				</View>
			</View>

			{/* Key Metrics */}
			<View className="px-6 -mt-6 mb-8">
				<View className="flex-row justify-between gap-4">
					<View className="bg-white rounded-xl p-5 flex-1 shadow-sm border border-gray-200">
						<Shield size={28} color="#374151" />
						<Text className="text-3xl font-bold mt-3 text-gray-900">87%</Text>
						<Text className="text-gray-600 text-sm">Trust Score</Text>
					</View>
					<View className="bg-white rounded-xl p-5 flex-1 shadow-sm border border-gray-200">
						<FileText size={28} color="#374151" />
						<Text className="text-3xl font-bold mt-3 text-gray-900">47</Text>
						<Text className="text-gray-600 text-sm">Reports</Text>
					</View>
					<View className="bg-white rounded-xl p-5 flex-1 shadow-sm border border-gray-200">
						<CheckCircle size={28} color="#374151" />
						<Text className="text-3xl font-bold mt-3 text-gray-900">42</Text>
						<Text className="text-gray-600 text-sm">Verified</Text>
					</View>
					<View className="bg-white rounded-xl p-5 flex-1 shadow-sm border border-gray-200">
						<Zap size={28} color="#374151" />
						<Text className="text-3xl font-bold mt-3 text-gray-900">2.3min</Text>
						<Text className="text-gray-600 text-sm">Response</Text>
					</View>
				</View>
			</View>

			{/* Emergency Actions */}
			<View className="px-6 mb-8">
				<View className="flex-row items-center mb-4">
					<AlertTriangle size={24} color="#DC2626" />
					<Text className="text-gray-900 font-bold text-xl ml-3">Emergency Actions</Text>
					<View className="bg-red-600 px-3 py-1 rounded-full ml-3">
						<Text className="text-white text-xs font-bold">2 warnings</Text>
					</View>
				</View>
				
				<View className="flex-row gap-4">
					<TouchableOpacity className="bg-gray-900 flex-1 p-5 rounded-xl">
						<View className="flex-row items-center mb-2">
							<AlertTriangle size={24} color="white" />
							<Text className="text-white font-bold text-xl ml-3">EMERGENCY</Text>
						</View>
						<Text className="text-gray-300 text-sm">Immediate Response</Text>
					</TouchableOpacity>
					
					<TouchableOpacity className="bg-gray-700 flex-1 p-5 rounded-xl">
						<View className="flex-row items-center mb-2">
							<Bell size={24} color="white" />
							<Text className="text-white font-bold text-xl ml-3">REPORT</Text>
						</View>
						<Text className="text-gray-300 text-sm">Submit Incident</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Quick Access */}
			<View className="px-6 mb-8">
				<Text className="text-gray-900 font-bold text-xl mb-4">Quick Access</Text>
				
				<View className="space-y-3">
					<TouchableOpacity className="bg-white p-4 rounded-xl border border-gray-200">
						<View className="flex-row items-center justify-between">
							<View className="flex-row items-center">
								<Shield size={20} color="#374151" />
								<Text className="text-gray-800 font-semibold text-base ml-3">Trust Center</Text>
							</View>
							<ArrowRight size={18} color="#6B7280" />
						</View>
					</TouchableOpacity>
					
					<TouchableOpacity className="bg-white p-4 rounded-xl border border-gray-200">
						<View className="flex-row items-center justify-between">
							<View className="flex-row items-center">
								<Search size={20} color="#374151" />
								<Text className="text-gray-800 font-semibold text-base ml-3">Lost & Found</Text>
							</View>
							<ArrowRight size={18} color="#6B7280" />
						</View>
					</TouchableOpacity>
					
					<TouchableOpacity className="bg-white p-4 rounded-xl border border-gray-200">
						<View className="flex-row items-center justify-between">
							<View className="flex-row items-center">
								<Users size={20} color="#374151" />
								<Text className="text-gray-800 font-semibold text-base ml-3">Community</Text>
							</View>
							<ArrowRight size={18} color="#6B7280" />
						</View>
					</TouchableOpacity>
					
					<TouchableOpacity className="bg-white p-4 rounded-xl border border-gray-200">
						<View className="flex-row items-center justify-between">
							<View className="flex-row items-center">
								<Coins size={20} color="#374151" />
								<Text className="text-gray-800 font-semibold text-base ml-3">Bounty System</Text>
							</View>
							<ArrowRight size={18} color="#6B7280" />
						</View>
					</TouchableOpacity>
					
					<TouchableOpacity className="bg-white p-4 rounded-xl border border-gray-200">
						<View className="flex-row items-center justify-between">
							<View className="flex-row items-center">
								<Newspaper size={20} color="#374151" />
								<Text className="text-gray-800 font-semibold text-base ml-3">News Feed</Text>
							</View>
							<ArrowRight size={18} color="#6B7280" />
						</View>
					</TouchableOpacity>
					
					<TouchableOpacity className="bg-white p-4 rounded-xl border border-gray-200">
						<View className="flex-row items-center justify-between">
							<View className="flex-row items-center">
								<Building size={20} color="#374151" />
								<Text className="text-gray-800 font-semibold text-base ml-3">Cases</Text>
							</View>
							<ArrowRight size={18} color="#6B7280" />
						</View>
					</TouchableOpacity>
				</View>
			</View>

			{/* Recent Activity */}
			<View className="px-6 mb-8">
				<Text className="text-gray-900 font-bold text-xl mb-4">Recent Activity</Text>
				
				<View className="space-y-3">
					<View className="bg-white p-4 rounded-xl border border-gray-200">
						<View className="flex-row items-center justify-between mb-2">
							<View className="flex-row items-center">
								<CheckCircle size={20} color="#10B981" />
								<Text className="text-gray-800 font-semibold text-base ml-3">Report verified - Trust score increased</Text>
							</View>
							<Text className="text-green-600 font-bold text-sm">+3 Trust</Text>
						</View>
						<Text className="text-gray-500 text-sm ml-8">2 hours ago</Text>
					</View>
					
					<View className="bg-white p-4 rounded-xl border border-gray-200">
						<View className="flex-row items-center justify-between mb-2">
							<View className="flex-row items-center">
								<FileText size={20} color="#3B82F6" />
								<Text className="text-gray-800 font-semibold text-base ml-3">Incident report submitted successfully</Text>
							</View>
							<Text className="text-blue-600 font-bold text-sm">New</Text>
						</View>
						<Text className="text-gray-500 text-sm ml-8">5 hours ago</Text>
					</View>
					
					<View className="bg-white p-4 rounded-xl border border-gray-200">
						<View className="flex-row items-center justify-between mb-2">
							<View className="flex-row items-center">
								<AlertTriangle size={20} color="#DC2626" />
								<Text className="text-gray-800 font-semibold text-base ml-3">Prank call detected - Trust penalty applied</Text>
							</View>
							<Text className="text-red-600 font-bold text-sm">-15 Trust</Text>
						</View>
						<Text className="text-gray-500 text-sm ml-8">1 day ago</Text>
					</View>
				</View>
			</View>
		</ScrollView>
	);
}

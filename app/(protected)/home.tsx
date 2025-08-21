import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Shield, FileText, CheckCircle, Zap, AlertTriangle, Bell, Users, Search, Coins, Newspaper, Clock, MapPin, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import HeaderWithSidebar from '../../components/HeaderWithSidebar';
import { useAuthContext } from 'components/AuthProvider';
import { useEffect, useState } from 'react';
import { supabase } from 'lib/supabase';
import Splash from 'components/ui/Splash';


type Profile = {
	first_name: string
}

export default function Home() {
	const router = useRouter()
	const { session, signOut } = useAuthContext()
	const [loading, setLoading] = useState(false)
	const [profile, setProfile] = useState<Profile>()

	const handleLogout = () => {
		// TODO: add a loading indicator when signingout
		signOut()
	};

	const handleEmergency = () => {
		router.push('/emergency')
	};


	useEffect(() => {
		if (session) getProfile()
	}, [])

	if (loading) {
		return <Splash />
	}

	async function getProfile() {
		try {
			setLoading(true);
			if (!session?.user) throw new Error('No user on the session!');
			const { data, error, status } = await supabase
				.from('profiles')
				.select(`first_name`)
				.eq('id', session?.user.id)
				.single();
			if (error && status !== 406) {
				throw error;
			}
			if (data) {
				setProfile(data)
			}
		} catch (error) {
			if (error instanceof Error) {
				Alert.alert(error.message);
				console.error(error.message);
			}
		} finally {
			setLoading(false);
		}
	}

	const handleReportIncident = () => {
		router.push('/report-incident');
	};

	return (
		<View className="flex-1 bg-white">
			<StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

			<HeaderWithSidebar
				title="Dispatch Dashboard"
				showBackButton={false}
				logoutPressed={handleLogout}
			/>

			{/* Main Content */}
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				{/* Welcome Banner */}
				<View className="bg-slate-800 p-6 sm:p-8">
					<View className="mb-6">
						<Text className="text-white text-2xl sm:text-3xl font-bold mb-2">Welcome back, {profile?.first_name}</Text>
						<Text className="text-slate-300 text-base sm:text-lg">Your community safety dashboard</Text>
					</View>

					<View className="bg-white/10 p-4 rounded-xl border border-white/20">
						<View className="flex-row items-center justify-between mb-4">
							<View className="flex-row items-center">
								<View className="w-10 h-10 bg-white/20 rounded-lg items-center justify-center mr-3">
									<Shield size={22} color="#E2E8F0" />
								</View>
								<Text className="text-white font-semibold text-lg">Security Status</Text>
							</View>
							<View className="bg-slate-600 px-3 py-1.5 rounded-lg">
								<Text className="text-white text-xs font-medium">Active</Text>
							</View>
						</View>
						<View className="bg-white/20 rounded-full h-3 mb-3">
							<View className="bg-slate-400 rounded-full h-3 w-4/5" />
						</View>
						<Text className="text-slate-300 text-sm font-medium">System Status: 87% Operational</Text>
					</View>
				</View>

				{/* Key Metrics */}
				<View className="px-4 sm:px-6 mt-6 mb-8">
					<Text className="text-slate-900 font-bold text-lg sm:text-xl mb-4 sm:mb-6">Key Metrics</Text>
					<View className="flex-row flex-wrap gap-3">
						<View className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200" style={{ width: '48%' }}>
							<View className="items-center">
								<View className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-lg items-center justify-center mb-2">
									<Shield size={20} color="#475569" />
								</View>
								<Text className="text-xl sm:text-2xl font-bold text-slate-900">87%</Text>
								<Text className="text-slate-600 text-xs font-medium text-center">Trust Score</Text>
							</View>
						</View>
						<View className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200" style={{ width: '48%' }}>
							<View className="items-center">
								<View className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-lg items-center justify-center mb-2">
									<FileText size={20} color="#475569" />
								</View>
								<Text className="text-xl sm:text-2xl font-bold text-slate-900">47</Text>
								<Text className="text-slate-600 text-xs font-medium text-center">Reports</Text>
							</View>
						</View>
						<View className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200" style={{ width: '48%' }}>
							<View className="items-center">
								<View className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-lg items-center justify-center mb-2">
									<CheckCircle size={20} color="#475569" />
								</View>
								<Text className="text-xl sm:text-2xl font-bold text-slate-900">42</Text>
								<Text className="text-slate-600 text-xs font-medium text-center">Verified</Text>
							</View>
						</View>
						<View className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200" style={{ width: '48%' }}>
							<View className="items-center">
								<View className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-lg items-center justify-center mb-2">
									<Zap size={20} color="#475569" />
								</View>
								<Text className="text-xl sm:text-2xl font-bold text-slate-900">2.3min</Text>
								<Text className="text-slate-600 text-xs font-medium text-center">Response</Text>
							</View>
						</View>
					</View>
				</View>

				{/* Emergency Actions */}
				<View className="px-4 sm:px-6 mb-8">
					<View className="flex-row items-center mb-4">
						<AlertTriangle size={24} color="#475569" />
						<Text className="text-slate-900 font-bold text-lg sm:text-xl ml-3">Quick Actions</Text>
						<View className="bg-slate-600 px-2 sm:px-3 py-1 rounded-md ml-3">
							<Text className="text-white text-xs font-medium">Active</Text>
						</View>
					</View>

					<View className="flex-row gap-4">
						<TouchableOpacity
							className="bg-red-600 flex-1 p-4 rounded-lg border border-red-700/20"
							style={{
								elevation: 2,
								shadowColor: '#000000',
								shadowOffset: { width: 0, height: 2 },
								shadowOpacity: 0.1,
								shadowRadius: 4,
							}}
							onPress={handleEmergency}
						>
							<View className="items-center">
								<View className="w-12 h-12 bg-white/20 rounded-lg items-center justify-center mb-3">
									<AlertTriangle size={24} color="white" />
								</View>
								<Text className="text-white font-bold text-lg text-center mb-1">Emergency Alert</Text>
								<Text className="text-red-100 text-xs text-center">Immediate response</Text>
							</View>
						</TouchableOpacity>

						<TouchableOpacity
							className="bg-slate-700 flex-1 p-4 rounded-lg border border-slate-600/20"
							style={{
								elevation: 2,
								shadowColor: '#000000',
								shadowOffset: { width: 0, height: 2 },
								shadowOpacity: 0.1,
								shadowRadius: 4,
							}}
							onPress={handleReportIncident}
						>
							<View className="items-center">
								<View className="w-12 h-12 bg-white/20 rounded-lg items-center justify-center mb-3">
									<Bell size={24} color="white" />
								</View>
								<Text className="text-white font-bold text-lg text-center mb-1">Report Incident</Text>
								<Text className="text-slate-200 text-xs text-center">Submit new report</Text>
							</View>
						</TouchableOpacity>
					</View>
				</View>

				{/* Quick Access */}
				<View className="px-4 sm:px-6 mb-8">
					<Text className="text-slate-900 font-bold text-lg sm:text-xl mb-4 sm:mb-6">Quick Access</Text>

					<View className="flex-row flex-wrap gap-3">
						<TouchableOpacity className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200" style={{ width: '31%' }}>
							<View className="items-center">
								<View className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-lg items-center justify-center mb-3">
									<Shield size={24} color="#475569" />
								</View>
								<Text className="text-slate-700 font-semibold text-sm text-center">Anonymity</Text>
							</View>
						</TouchableOpacity>

						<TouchableOpacity
							className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200"
							style={{ width: '31%' }}
							onPress={() => router.push('/lost-and-found')}
						>
							<View className="items-center">
								<View className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-lg items-center justify-center mb-3">
									<Search size={24} color="#475569" />
								</View>
								<Text className="text-slate-700 font-semibold text-sm text-center">Lost & Found</Text>
							</View>
						</TouchableOpacity>

						<TouchableOpacity 
							className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200" 
							style={{ width: '31%' }}
							onPress={() => router.push('/community')}
						>
							<View className="items-center">
								<View className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-lg items-center justify-center mb-3">
									<Users size={24} color="#475569" />
								</View>
								<Text className="text-slate-700 font-semibold text-sm text-center">Community</Text>
							</View>
						</TouchableOpacity>

						<TouchableOpacity className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200" style={{ width: '31%' }}>
							<View className="items-center">
								<View className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-lg items-center justify-center mb-3">
									<Coins size={24} color="#475569" />
								</View>
								<Text className="text-slate-700 font-semibold text-sm text-center">Bounties</Text>
							</View>
						</TouchableOpacity>

						<TouchableOpacity className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200" style={{ width: '31%' }}>
							<View className="items-center">
								<View className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-lg items-center justify-center mb-3">
									<Newspaper size={24} color="#475569" />
								</View>
								<Text className="text-slate-700 font-semibold text-sm text-center">News Feed</Text>
							</View>
						</TouchableOpacity>

						<TouchableOpacity className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200" style={{ width: '31%' }}>
							<View className="items-center">
								<View className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-lg items-center justify-center mb-3">
									<MapPin size={24} color="#475569" />
								</View>
								<Text className="text-slate-700 font-semibold text-sm text-center">Cases</Text>
							</View>
						</TouchableOpacity>
					</View>
				</View>

				{/* Recent Activity */}
				<View className="px-4 sm:px-6 mb-8">
					<Text className="text-slate-900 font-bold text-lg sm:text-xl mb-4 sm:mb-6">Recent Activity</Text>

					<View className="space-y-3 sm:space-y-4">
						<View className="bg-gray-50 p-3 sm:p-4 sm:p-5 rounded-lg border border-gray-200">
							<View className="flex-row items-center">
								<View className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-lg items-center justify-center mr-3 sm:mr-4">
									<CheckCircle size={20} color="#10B981" />
								</View>
								<View className="flex-1">
									<Text className="text-slate-900 font-semibold text-sm sm:text-base">Case #1234 resolved</Text>
									<Text className="text-slate-600 text-xs sm:text-sm">Lost phone returned to owner</Text>
								</View>
								<Text className="text-slate-500 text-xs">2h ago</Text>
							</View>
						</View>

						<View className="bg-gray-50 p-3 sm:p-4 sm:p-5 rounded-lg border border-gray-200">
							<View className="flex-row items-center">
								<View className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-lg items-center justify-center mr-3 sm:mr-4">
									<AlertCircle size={20} color="#3B82F6" />
								</View>
								<View className="flex-1">
									<Text className="text-slate-900 font-semibold text-sm sm:text-base">New incident reported</Text>
									<Text className="text-slate-600 text-xs sm:text-sm">Traffic accident on Main St</Text>
								</View>
								<Text className="text-slate-500 text-xs">4h ago</Text>
							</View>
						</View>

						<View className="bg-gray-50 p-3 sm:p-4 sm:p-5 rounded-lg border border-gray-200">
							<View className="flex-row items-center">
								<View className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-lg items-center justify-center mr-3 sm:mr-4">
									<Clock size={20} color="#F59E0B" />
								</View>
								<View className="flex-1">
									<Text className="text-slate-900 font-semibold text-sm sm:text-base">Case #1230 updated</Text>
									<Text className="text-slate-600 text-xs sm:text-sm">Investigation in progress</Text>
								</View>
								<Text className="text-slate-500 text-xs">6h ago</Text>
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



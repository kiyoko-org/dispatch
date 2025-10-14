import {
	View,
	Text,
	TouchableOpacity,
	StatusBar,
	StyleSheet,
	ActivityIndicator,
	ScrollView,
	Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import MapView, { Marker, Heatmap, PROVIDER_GOOGLE, Circle, Region } from 'react-native-maps';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useTheme } from 'components/ThemeContext';
import Papa from 'papaparse';
import { 
	MapPin, 
	AlertTriangle, 
	Car, 
	ShoppingBag, 
	Users,
	Activity,
	XCircle,
	Calendar,
	MapPinned,
	Filter,
	X
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface CrimeData {
	municipal: string;
	barangay: string;
	typeofPlace: string;
	dateCommitted: string;
	timeCommitted: string;
	incidentType: string;
	stageoffelony: string;
	offense: string;
	lat: number;
	lon: number;
}

type CrimeCategory = 'violent' | 'property' | 'drug' | 'traffic' | 'other';

interface CrimeTypeConfig {
	category: CrimeCategory;
	color: string;
	icon: string;
	label: string;
}

export default function MapPage() {
	const router = useRouter();
	const { colors, isDark } = useTheme();
	const [crimes, setCrimes] = useState<CrimeData[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedCrime, setSelectedCrime] = useState<CrimeData | null>(null);
	const [selectedCluster, setSelectedCluster] = useState<CrimeData[] | null>(null);
	const [showHeatmap, setShowHeatmap] = useState(true);
	const [showMarkers, setShowMarkers] = useState(true);
	const [filterCategory, setFilterCategory] = useState<CrimeCategory | 'all'>('all');
	const [showFilters, setShowFilters] = useState(false);
	const [mapRegion, setMapRegion] = useState<Region | null>(null);
	const [activeClusterTab, setActiveClusterTab] = useState<'all' | CrimeCategory>('all');

	useEffect(() => {
		loadCrimeData();
	}, []);

	const loadCrimeData = async () => {
		try {
			// Import CSV as text using require
			const Asset = require('expo-asset').Asset;
			const FileSystem = require('expo-file-system');
			
			// Load the asset
			const asset = Asset.fromModule(require('../../../assets/crimes.csv'));
			await asset.downloadAsync();
			
			// Read the file content
			const csvText = await FileSystem.readAsStringAsync(asset.localUri);
			
			Papa.parse(csvText, {
				header: true,
				skipEmptyLines: true,
				complete: (results) => {
					const parsedData = results.data
						.map((row: any) => ({
							municipal: row.municipal,
							barangay: row.barangay,
							typeofPlace: row.typeofPlace,
							dateCommitted: row.dateCommitted,
							timeCommitted: row.timeCommitted,
							incidentType: row.incidentType,
							stageoffelony: row.stageoffelony,
							offense: row.offense,
							lat: parseFloat(row.lat),
							lon: parseFloat(row.lon),
						}))
						.filter((crime) => !isNaN(crime.lat) && !isNaN(crime.lon));
					
					setCrimes(parsedData);
					setLoading(false);
					console.log(`Loaded ${parsedData.length} crime records`);
				},
				error: (error: Error) => {
					console.error('Error parsing CSV:', error);
					setLoading(false);
				},
			});
		} catch (error) {
			console.error('Error loading crime data:', error);
			setLoading(false);
		}
	};

	// Categorize crimes
	const getCrimeCategory = (crime: CrimeData): CrimeCategory => {
		const type = crime.incidentType.toLowerCase();
		if (type.includes('murder') || type.includes('homicide') || type.includes('shooting') || 
		    type.includes('stabbing') || type.includes('assault') || type.includes('violence')) {
			return 'violent';
		}
		if (type.includes('robbery') || type.includes('theft') || type.includes('carnapping') || 
		    type.includes('burglary')) {
			return 'property';
		}
		if (type.includes('drug') || type.includes('bust')) {
			return 'drug';
		}
		if (type.includes('vehicular') || type.includes('traffic')) {
			return 'traffic';
		}
		return 'other';
	};

	const getCrimeColor = (category: CrimeCategory): string => {
		switch (category) {
			case 'violent': return '#DC2626'; // Red
			case 'property': return '#F59E0B'; // Orange
			case 'drug': return '#7C3AED'; // Purple
			case 'traffic': return '#3B82F6'; // Blue
			default: return '#6B7280'; // Gray
		}
	};

	// Filter crimes based on selected category
	const filteredCrimes = filterCategory === 'all' 
		? crimes 
		: crimes.filter(crime => getCrimeCategory(crime) === filterCategory);

	// Simple grid-based clustering (degrees-based, responsive to current map region)
	const clusters = useMemo(() => {
		if (!mapRegion) return [] as { lat: number; lon: number; items: CrimeData[] }[];
		if (filterCategory !== 'all') return [] as { lat: number; lon: number; items: CrimeData[] }[];

		const cellSizeLat = Math.max(mapRegion.latitudeDelta / 20, 0.0005);
		const cellSizeLon = Math.max(mapRegion.longitudeDelta / 20, 0.0005);
		const cellKey = (lat: number, lon: number) => {
			const r = Math.floor((lat - mapRegion.latitude + mapRegion.latitudeDelta / 2) / cellSizeLat);
			const c = Math.floor((lon - mapRegion.longitude + mapRegion.longitudeDelta / 2) / cellSizeLon);
			return `${r}:${c}`;
		};

		const grid: Record<string, CrimeData[]> = {};
		for (const crime of filteredCrimes) {
			const key = cellKey(crime.lat, crime.lon);
			if (!grid[key]) grid[key] = [];
			grid[key].push(crime);
		}

		const result: { lat: number; lon: number; items: CrimeData[] }[] = [];
		for (const key in grid) {
			const items = grid[key];
			// centroid
			let sumLat = 0;
			let sumLon = 0;
			for (const it of items) {
				sumLat += it.lat;
				sumLon += it.lon;
			}
			result.push({
				lat: sumLat / items.length,
				lon: sumLon / items.length,
				items,
			});
		}
		return result;
	}, [filteredCrimes, filterCategory, mapRegion]);

	// Calculate center of Tuguegarao City
	const initialRegion = {
		latitude: 17.6132,
		longitude: 121.7270,
		latitudeDelta: 0.15,
		longitudeDelta: 0.15,
	};

	// Convert crimes data to heatmap points
	const heatmapPoints = filteredCrimes.map((crime) => ({
		latitude: crime.lat,
		longitude: crime.lon,
		weight: getCrimeCategory(crime) === 'violent' ? 2 : 1,
	}));

	// Get crime statistics
	const crimeStats = {
		total: crimes.length,
		violent: crimes.filter(c => getCrimeCategory(c) === 'violent').length,
		property: crimes.filter(c => getCrimeCategory(c) === 'property').length,
		drug: crimes.filter(c => getCrimeCategory(c) === 'drug').length,
		traffic: crimes.filter(c => getCrimeCategory(c) === 'traffic').length,
		other: crimes.filter(c => getCrimeCategory(c) === 'other').length,
	};

	return (
		<View className="flex-1" style={{ backgroundColor: colors.background }}>
			<StatusBar 
				barStyle={isDark ? 'light-content' : 'dark-content'} 
				backgroundColor={colors.background} 
			/>

			<HeaderWithSidebar title="Crime Map" showBackButton={false} />

			{/* Map View */}
			<View className="flex-1">
				{loading ? (
					<View className="flex-1 items-center justify-center">
						<ActivityIndicator size="large" color={colors.primary} />
						<Text className="mt-4" style={{ color: colors.text }}>
							Loading crime data...
						</Text>
					</View>
				) : (
				<MapView
					provider={PROVIDER_GOOGLE}
						style={styles.map}
						initialRegion={initialRegion}
						onRegionChangeComplete={(region) => setMapRegion(region)}
						showsUserLocation={true}
						showsMyLocationButton={true}
						customMapStyle={isDark ? darkMapStyle : []}
					>
						{/* Heatmap Layer */}
						{showHeatmap && (
							<Heatmap
								points={heatmapPoints}
								opacity={0.6}
								radius={40}
								gradient={{
									colors: ['rgba(59, 130, 246, 0.5)', 'rgba(251, 191, 36, 0.7)', 'rgba(220, 38, 38, 0.9)'],
									startPoints: [0.2, 0.5, 1.0],
									colorMapSize: 256,
								}}
							/>
						)}

						{/* Markers: cluster when All, otherwise individual */}
						{showMarkers && filterCategory === 'all' && clusters.map((cluster, idx) => {
							const total = cluster.items.length;
							// derive a color intensity by share of violent crimes
							const violentCount = cluster.items.filter(c => getCrimeCategory(c) === 'violent').length;
							const ratio = total > 0 ? violentCount / total : 0;
							const baseColor = ratio > 0.5 ? '#DC2626' : ratio > 0.25 ? '#F59E0B' : '#3B82F6';
							return (
								<Marker
									key={`cluster-${idx}`}
									coordinate={{ latitude: cluster.lat, longitude: cluster.lon }}
									onPress={() => { setSelectedCrime(null); setSelectedCluster(cluster.items); setActiveClusterTab('all'); }}
								>
									<View style={[styles.clusterContainer, { backgroundColor: baseColor }]}> 
										<Text style={styles.clusterText}>{total}</Text>
									</View>
								</Marker>
							);
						})}

						{showMarkers && filterCategory !== 'all' && filteredCrimes.map((crime, index) => {
							const category = getCrimeCategory(crime);
							const markerColor = getCrimeColor(category);
							return (
								<Marker
									key={`crime-${index}`}
									coordinate={{ latitude: crime.lat, longitude: crime.lon }}
									onPress={() => { setSelectedCluster(null); setSelectedCrime(crime); }}
								>
									<View style={[styles.markerContainer, { backgroundColor: markerColor }]}> 
										<View style={styles.markerInner}>
											{category === 'violent' && <AlertTriangle size={14} color="#FFF" />}
											{category === 'property' && <ShoppingBag size={14} color="#FFF" />}
											{category === 'drug' && <Activity size={14} color="#FFF" />}
											{category === 'traffic' && <Car size={14} color="#FFF" />}
											{category === 'other' && <MapPin size={14} color="#FFF" />}
										</View>
									</View>
								</Marker>
							);
						})}
				</MapView>
				)}

				{/* Filter Panel */}
				{showFilters && (
				<View 
						className="absolute left-4 right-4 top-4 rounded-xl p-4 shadow-2xl"
						style={{ backgroundColor: colors.card, maxHeight: '80%' }}
					>
						<View className="mb-4 flex-row items-center justify-between">
							<Text className="text-lg font-bold" style={{ color: colors.text }}>
								Filters
							</Text>
							<TouchableOpacity onPress={() => setShowFilters(false)}>
								<X size={24} color={colors.text} />
					</TouchableOpacity>
				</View>

						<ScrollView showsVerticalScrollIndicator={false}>
							{/* Category Filters */}
							<Text className="mb-2 text-sm font-semibold" style={{ color: colors.textSecondary }}>
								Crime Category
							</Text>
							
							<TouchableOpacity
								className="mb-2 flex-row items-center rounded-lg p-3"
								style={{ backgroundColor: filterCategory === 'all' ? colors.primary + '20' : colors.background }}
								onPress={() => setFilterCategory('all')}
							>
								<MapPinned size={20} color={colors.text} />
								<Text className="ml-2 flex-1 font-medium" style={{ color: colors.text }}>
									All Crimes
								</Text>
								<Text className="font-bold" style={{ color: colors.primary }}>
									{crimeStats.total}
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								className="mb-2 flex-row items-center rounded-lg p-3"
								style={{ backgroundColor: filterCategory === 'violent' ? '#DC262620' : colors.background }}
								onPress={() => setFilterCategory('violent')}
							>
								<AlertTriangle size={20} color="#DC2626" />
								<Text className="ml-2 flex-1 font-medium" style={{ color: colors.text }}>
									Violent Crimes
								</Text>
								<Text className="font-bold" style={{ color: '#DC2626' }}>
									{crimeStats.violent}
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								className="mb-2 flex-row items-center rounded-lg p-3"
								style={{ backgroundColor: filterCategory === 'property' ? '#F59E0B20' : colors.background }}
								onPress={() => setFilterCategory('property')}
							>
								<ShoppingBag size={20} color="#F59E0B" />
								<Text className="ml-2 flex-1 font-medium" style={{ color: colors.text }}>
									Property Crimes
								</Text>
								<Text className="font-bold" style={{ color: '#F59E0B' }}>
									{crimeStats.property}
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								className="mb-2 flex-row items-center rounded-lg p-3"
								style={{ backgroundColor: filterCategory === 'drug' ? '#7C3AED20' : colors.background }}
								onPress={() => setFilterCategory('drug')}
							>
								<Activity size={20} color="#7C3AED" />
								<Text className="ml-2 flex-1 font-medium" style={{ color: colors.text }}>
									Drug-Related
								</Text>
								<Text className="font-bold" style={{ color: '#7C3AED' }}>
									{crimeStats.drug}
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								className="mb-2 flex-row items-center rounded-lg p-3"
								style={{ backgroundColor: filterCategory === 'traffic' ? '#3B82F620' : colors.background }}
								onPress={() => setFilterCategory('traffic')}
							>
								<Car size={20} color="#3B82F6" />
								<Text className="ml-2 flex-1 font-medium" style={{ color: colors.text }}>
									Traffic Incidents
								</Text>
								<Text className="font-bold" style={{ color: '#3B82F6' }}>
									{crimeStats.traffic}
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								className="mb-2 flex-row items-center rounded-lg p-3"
								style={{ backgroundColor: filterCategory === 'other' ? '#6B728020' : colors.background }}
								onPress={() => setFilterCategory('other')}
							>
								<Users size={20} color="#6B7280" />
								<Text className="ml-2 flex-1 font-medium" style={{ color: colors.text }}>
									Other Crimes
								</Text>
								<Text className="font-bold" style={{ color: '#6B7280' }}>
									{crimeStats.other}
								</Text>
							</TouchableOpacity>

							{/* Toggle Options */}
							<View className="mt-4 border-t pt-4" style={{ borderColor: colors.border }}>
								<Text className="mb-2 text-sm font-semibold" style={{ color: colors.textSecondary }}>
									Display Options
								</Text>

								<TouchableOpacity
									className="mb-2 flex-row items-center justify-between rounded-lg p-3"
									style={{ backgroundColor: colors.background }}
									onPress={() => setShowHeatmap(!showHeatmap)}
								>
									<Text className="font-medium" style={{ color: colors.text }}>
										Show Heatmap
									</Text>
									<View 
										className="h-6 w-11 rounded-full p-1"
										style={{ backgroundColor: showHeatmap ? colors.primary : colors.border }}
									>
										<View 
											className="h-4 w-4 rounded-full bg-white"
											style={{ 
												transform: [{ translateX: showHeatmap ? 20 : 0 }] 
											}}
										/>
									</View>
								</TouchableOpacity>

								<TouchableOpacity
									className="flex-row items-center justify-between rounded-lg p-3"
									style={{ backgroundColor: colors.background }}
									onPress={() => setShowMarkers(!showMarkers)}
								>
									<Text className="font-medium" style={{ color: colors.text }}>
										Show Markers
									</Text>
									<View 
										className="h-6 w-11 rounded-full p-1"
										style={{ backgroundColor: showMarkers ? colors.primary : colors.border }}
									>
				<View 
											className="h-4 w-4 rounded-full bg-white"
					style={{ 
												transform: [{ translateX: showMarkers ? 20 : 0 }] 
											}}
										/>
									</View>
								</TouchableOpacity>
							</View>
						</ScrollView>
					</View>
				)}

				{/* Crime Details Card */}
				{selectedCrime && !showFilters && !selectedCluster && (
					<View 
						className="absolute bottom-24 left-4 right-4 rounded-xl p-4 shadow-2xl"
						style={{ backgroundColor: colors.card }}
					>
						<View className="mb-3 flex-row items-start justify-between">
							<View className="flex-1">
								<View 
									className="mb-2 self-start rounded-full px-3 py-1"
									style={{ backgroundColor: getCrimeColor(getCrimeCategory(selectedCrime)) + '20' }}
								>
									<Text 
										className="text-xs font-bold uppercase"
										style={{ color: getCrimeColor(getCrimeCategory(selectedCrime)) }}
									>
										{getCrimeCategory(selectedCrime)}
									</Text>
								</View>
								<Text className="text-lg font-bold" style={{ color: colors.text }}>
									{selectedCrime.incidentType}
					</Text>
							</View>
							<TouchableOpacity onPress={() => setSelectedCrime(null)}>
								<XCircle size={24} color={colors.textSecondary} />
							</TouchableOpacity>
						</View>

						<View className="space-y-2">
							<View className="flex-row items-center">
								<MapPin size={16} color={colors.textSecondary} />
								<Text className="ml-2 text-sm" style={{ color: colors.textSecondary }}>
									{selectedCrime.barangay}, {selectedCrime.municipal}
								</Text>
							</View>
							
							<View className="flex-row items-center">
								<Calendar size={16} color={colors.textSecondary} />
								<Text className="ml-2 text-sm" style={{ color: colors.textSecondary }}>
									{selectedCrime.dateCommitted} at {selectedCrime.timeCommitted}
								</Text>
							</View>
							
						<View className="flex-row items-center">
								<MapPinned size={16} color={colors.textSecondary} />
								<Text className="ml-2 text-sm" style={{ color: colors.textSecondary }}>
									{selectedCrime.typeofPlace}
								</Text>
							</View>
						</View>

						<View className="mt-3 rounded-lg p-3" style={{ backgroundColor: colors.background }}>
							<Text className="text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>
								Offense
							</Text>
							<Text className="mt-1 text-sm" style={{ color: colors.text }}>
								{selectedCrime.offense}
							</Text>
						</View>
					</View>
				)}

				{/* Cluster Details Card with Tabs */}
				{selectedCluster && !showFilters && (
					<View 
						className="absolute bottom-24 left-4 right-4 rounded-xl p-4 shadow-2xl"
						style={{ backgroundColor: colors.card }}
					>
						<View className="mb-3 flex-row items-start justify-between">
							<View className="flex-1">
								<Text className="text-lg font-bold" style={{ color: colors.text }}>
									Incidents in this area
								</Text>
								<Text className="text-xs" style={{ color: colors.textSecondary }}>{selectedCluster.length} total</Text>
							</View>
							<TouchableOpacity onPress={() => setSelectedCluster(null)}>
								<XCircle size={24} color={colors.textSecondary} />
							</TouchableOpacity>
						</View>

						{/* Tabs */}
						<View className="mb-3 flex-row items-center">
							{(['all','violent','property','drug','traffic','other'] as const).map((tab) => {
								const label = tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1);
								const count = tab === 'all' ? selectedCluster.length : selectedCluster.filter(c => getCrimeCategory(c) === tab).length;
								const active = activeClusterTab === tab;
								return (
									<TouchableOpacity
										key={tab}
										className="mr-2 rounded-full px-3 py-1"
										style={{ backgroundColor: active ? colors.primary + '20' : colors.background, borderWidth: 1, borderColor: active ? colors.primary : colors.border }}
										onPress={() => setActiveClusterTab(tab)}
									>
										<Text style={{ color: active ? colors.primary : colors.textSecondary, fontWeight: '600' }}>
											{label} ({count})
										</Text>
									</TouchableOpacity>
								);
							})}
						</View>

						{/* List */}
						<ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
							{(activeClusterTab === 'all' ? selectedCluster : selectedCluster.filter(c => getCrimeCategory(c) === activeClusterTab)).map((crime, idx) => (
								<View key={idx} className="mb-2 rounded-lg p-3" style={{ backgroundColor: colors.background }}>
									<View className="mb-1 flex-row items-center justify-between">
										<Text className="font-semibold" style={{ color: colors.text }}>{crime.incidentType}</Text>
										<View className="self-start rounded-full px-2 py-0.5" style={{ backgroundColor: getCrimeColor(getCrimeCategory(crime)) + '20' }}>
											<Text className="text-xs" style={{ color: getCrimeColor(getCrimeCategory(crime)) }}>{getCrimeCategory(crime)}</Text>
										</View>
									</View>
									<Text className="text-xs" style={{ color: colors.textSecondary }}>{crime.barangay}, {crime.municipal} • {crime.dateCommitted} {crime.timeCommitted}</Text>
								</View>
							))}
						</ScrollView>
					</View>
				)}

				{/* Control Buttons */}
				{!showFilters && (
					<>
						{/* Filter Button */}
						<TouchableOpacity
							className="absolute left-4 top-4 flex-row items-center rounded-xl px-4 py-3 shadow-lg"
							style={{ backgroundColor: colors.card }}
							onPress={() => setShowFilters(true)}
						>
							<Filter size={20} color={colors.primary} />
							<Text className="ml-2 font-semibold" style={{ color: colors.text }}>
								Filters
							</Text>
						</TouchableOpacity>

						{/* Crime Count Badge */}
						<View 
							className="absolute right-4 top-4 rounded-xl px-4 py-3 shadow-lg"
							style={{ backgroundColor: colors.card }}
						>
							<Text className="text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>
								Showing
							</Text>
							<Text className="text-lg font-bold" style={{ color: colors.primary }}>
								{filteredCrimes.length}
							</Text>
							<Text className="text-xs" style={{ color: colors.textSecondary }}>
								of {crimes.length}
							</Text>
						</View>
					</>
				)}

				{/* Report Button */}
				{!selectedCrime && !showFilters && (
					<View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
						<TouchableOpacity
							className="flex-row items-center rounded-full px-6 py-4 shadow-2xl"
							style={{ backgroundColor: colors.primary }}
							onPress={() => router.push('/(protected)/report-incident')}
						>
							<AlertTriangle size={20} color="#FFF" />
							<Text className="ml-2 text-base font-bold text-white">
								Report Incident
							</Text>
						</TouchableOpacity>
				</View>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	map: {
		flex: 1,
	},
	markerContainer: {
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 5,
	},
	markerInner: {
		width: 28,
		height: 28,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
	},
	clusterContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 5,
	},
	clusterText: {
		color: '#FFF',
		fontWeight: '700',
	},
});

// Dark map style for better visibility
const darkMapStyle = [
	{
		elementType: 'geometry',
		stylers: [{ color: '#242f3e' }],
	},
	{
		elementType: 'labels.text.fill',
		stylers: [{ color: '#746855' }],
	},
	{
		elementType: 'labels.text.stroke',
		stylers: [{ color: '#242f3e' }],
	},
];


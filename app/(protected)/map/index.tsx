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
import { useEffect, useMemo, useState, useRef } from 'react';
import MapView, { Marker, Heatmap, PROVIDER_GOOGLE, Circle, Region } from 'react-native-maps';
import { useReports } from '@kiyoko-org/dispatch-lib';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useTheme } from 'components/ThemeContext';
import Papa from 'papaparse';
import { dbscan, kMeans, gridBinning, regionAggregation, Point, Cluster } from 'lib/clustering';
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
	X,
	RotateCcw,
	Layers,
	Grid3x3,
	Radar,
	Map as MapIcon
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
	const [showReports, setShowReports] = useState(true);
	const [filterCategory, setFilterCategory] = useState<CrimeCategory | 'all'>('all');
	const [showFilters, setShowFilters] = useState(false);
	const [mapRegion, setMapRegion] = useState<Region | null>(null);
	const [activeClusterTab, setActiveClusterTab] = useState<'all' | CrimeCategory>('all');
	const mapRef = useRef<MapView>(null);
	
	// Heatmap visualization types
	type HeatmapType = 'density' | 'choropleth' | 'graduated' | 'grid' | 'bubble';
	const [heatmapType, setHeatmapType] = useState<HeatmapType>('density');
	
	// Map type
	type MapType = 'standard' | 'satellite' | 'hybrid' | 'terrain';
	const [mapType, setMapType] = useState<MapType>('standard');
	
	// Show category circles
	const [showCategoryCircles, setShowCategoryCircles] = useState(true);

	// Reports integration
	const { reports, fetchReports } = useReports();

	useEffect(() => {
		loadCrimeData();
	}, []);

	useEffect(() => {
		fetchReports?.();
	}, [fetchReports]);

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
	}, [filteredCrimes, mapRegion]);

	// Calculate center of Tuguegarao City
	const initialRegion = {
		latitude: 17.6132,
		longitude: 121.7270,
		latitudeDelta: 0.15,
		longitudeDelta: 0.15,
	};

	// Function to reset map to initial region
	const resetMapRegion = () => {
		mapRef.current?.animateToRegion(initialRegion, 1000);
		setMapRegion(initialRegion);
	};

	// Kernel Density Estimation (KDE) - Using DBSCAN preprocessing for hotspot detection
	// The native Heatmap component uses KDE internally, we enhance with DBSCAN clustering
	const heatmapPoints = useMemo(() => {
		const points: Point[] = filteredCrimes.map(crime => ({
			lat: crime.lat,
			lon: crime.lon,
			data: crime
		}));

		// Use DBSCAN to identify hotspot clusters (500m radius, min 3 points)
		const clusters = dbscan(points, 500, 3);
		
		// Generate heatmap points with weighted density based on clusters
		const weightedPoints = filteredCrimes.map((crime) => {
			const isViolent = getCrimeCategory(crime) === 'violent';
			
			// Find if this point belongs to a cluster
			const inCluster = clusters.some(cluster => 
				cluster.points.some(p => 
					(p as any).data === crime
				)
			);
			
			// Increase weight for violent crimes and clustered points
			let weight = 1;
			if (isViolent) weight += 1;
			if (inCluster) weight += 0.5;
			
			return {
				latitude: crime.lat,
				longitude: crime.lon,
				weight
			};
		});

		return weightedPoints;
	}, [filteredCrimes]);

	// Get crime statistics
	const crimeStats = {
		total: crimes.length,
		violent: crimes.filter(c => getCrimeCategory(c) === 'violent').length,
		property: crimes.filter(c => getCrimeCategory(c) === 'property').length,
		drug: crimes.filter(c => getCrimeCategory(c) === 'drug').length,
		traffic: crimes.filter(c => getCrimeCategory(c) === 'traffic').length,
		other: crimes.filter(c => getCrimeCategory(c) === 'other').length,
	};

	// Choropleth: Aggregation by region (barangay) - Proper clustering algorithm
	const barangayCrimeData = useMemo(() => {
		const points: (Point & { crime: CrimeData })[] = filteredCrimes.map(crime => ({
			lat: crime.lat,
			lon: crime.lon,
			crime
		}));

		// Use region aggregation algorithm for choropleth
		const clusters = regionAggregation(points, (p) => `${p.crime.barangay}-${p.crime.municipal}`);
		
		const grouped: Record<string, { count: number; crimes: CrimeData[]; center?: { lat: number; lon: number } }> = {};
		
		clusters.forEach((cluster, idx) => {
			const key = `cluster-${idx}`;
			grouped[key] = {
				count: cluster.count,
				crimes: cluster.points.map(p => (p as any).crime),
				center: cluster.center
			};
		});

		return grouped;
	}, [filteredCrimes]);

	// Get color based on crime count for choropleth
	const getChoroplethColor = (count: number): string => {
		const maxCount = Math.max(...Object.values(barangayCrimeData).map(d => d.count));
		const ratio = count / maxCount;
		
		if (ratio > 0.7) return 'rgba(220, 38, 38, 0.6)'; // High - Red
		if (ratio > 0.4) return 'rgba(251, 191, 36, 0.6)'; // Medium - Yellow
		return 'rgba(59, 130, 246, 0.6)'; // Low - Blue
	};

	// Grid-based heatmap with Grid Binning + DBSCAN for micro-hotspots
	const gridHeatmapData = useMemo(() => {
		if (!mapRegion) return [];
		
		const points: Point[] = filteredCrimes.map(crime => ({
			lat: crime.lat,
			lon: crime.lon,
			data: crime
		}));

		// First: Grid binning for spatial organization (0.005° = ~500m)
		const gridClusters = gridBinning(points, 0.005);
		
		// Then: Apply DBSCAN on high-density grid cells for micro-hotspot detection
		const denseCells = gridClusters.filter(c => c.count >= 3);
		const densePoints = denseCells.flatMap(c => c.points);
		
		let finalClusters: Cluster[] = gridClusters;
		if (densePoints.length > 0) {
			const dbscanClusters = dbscan(densePoints, 300, 2); // 300m epsilon, min 2 points
			if (dbscanClusters.length > 0) {
				finalClusters = dbscanClusters;
			}
		}
		
		return finalClusters.map(c => ({
			lat: c.center.lat,
			lon: c.center.lon,
			count: c.count,
			crimes: c.points.map(p => (p as any).data as CrimeData)
		}));
	}, [filteredCrimes, mapRegion]);

	// Get graduated symbol size
	const getGraduatedSize = (count: number): number => {
		const maxCount = Math.max(...Object.values(barangayCrimeData).map(d => d.count));
		const ratio = count / maxCount;
		return 20 + (ratio * 80); // Size between 20 and 100
	};

	// Bubble visualization - K-Means or DBSCAN for incident grouping
	const bubbleData = useMemo(() => {
		// Group crimes by category first
		const crimesByCategory: Record<CrimeCategory, CrimeData[]> = {
			violent: [],
			property: [],
			drug: [],
			traffic: [],
			other: []
		};
		
		filteredCrimes.forEach(crime => {
			const category = getCrimeCategory(crime);
			crimesByCategory[category].push(crime);
		});

		// Apply K-Means clustering within each category
		const allBubbles: { 
			lat: number; 
			lon: number; 
			category: CrimeCategory; 
			count: number;
			crimes: CrimeData[];
		}[] = [];

		Object.entries(crimesByCategory).forEach(([category, crimes]) => {
			if (crimes.length === 0) return;
			
			const points: Point[] = crimes.map(crime => ({
				lat: crime.lat,
				lon: crime.lon,
				data: crime
			}));

			// Use K-Means for predefined cluster count, or DBSCAN for density-based
			const k = Math.min(Math.ceil(crimes.length / 5), 15); // Adaptive cluster count
			let clusters: Cluster[];
			
			if (crimes.length >= 10) {
				clusters = kMeans(points, k, 50); // K-Means for larger datasets
			} else {
				clusters = dbscan(points, 500, 2); // DBSCAN for smaller datasets
			}

			clusters.forEach(cluster => {
				allBubbles.push({
					lat: cluster.center.lat,
					lon: cluster.center.lon,
					category: category as CrimeCategory,
					count: cluster.count,
					crimes: cluster.points.map(p => (p as any).data as CrimeData)
				});
			});
		});
		
		return allBubbles;
	}, [filteredCrimes]);

	// Get bubble size based on count - larger sizes for better clustering visibility
	const getBubbleSize = (count: number): number => {
		const maxCount = Math.max(...bubbleData.map(b => b.count), 1);
		const ratio = count / maxCount;
		return 200 + (ratio * 600); // Size between 200 and 800 meters
	};

	// Get bubble color with transparency
	const getBubbleColor = (category: CrimeCategory): string => {
		const baseColor = getCrimeColor(category);
		// Convert hex to rgba with 0.4 opacity
		return baseColor + '66'; // Adding alpha in hex (66 = ~40% opacity)
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
					ref={mapRef}
					provider={PROVIDER_GOOGLE}
						style={styles.map}
						initialRegion={initialRegion}
						onRegionChangeComplete={(region) => setMapRegion(region)}
						showsUserLocation={true}
						showsMyLocationButton={true}
						showsBuildings={true}
						showsTraffic={false}
						showsIndoors={true}
						mapType={mapType}
						customMapStyle={mapType === 'standard' ? (isDark ? darkMapStyle : lightMapStyle) : undefined}
					>
						{/* Kernel Density Estimation (KDE) with DBSCAN preprocessing 
						    Algorithm: DBSCAN for hotspot detection + native KDE rendering
						    Use Case: Hotspot detection, intensity visualization */}
						{showHeatmap && heatmapType === 'density' && (
							<Heatmap
								points={heatmapPoints}
								opacity={0.7}
								radius={50}
								gradient={{
									colors: [
										'rgba(0, 255, 0, 0)',      // Transparent green
										'rgba(0, 255, 0, 0.5)',    // Light green
										'rgba(124, 252, 0, 0.7)',  // Lawn green
										'rgba(255, 255, 0, 0.8)',  // Yellow
										'rgba(255, 165, 0, 0.85)', // Orange
										'rgba(255, 69, 0, 0.9)',   // Red-orange
										'rgba(255, 0, 0, 0.95)',   // Red
										'rgba(139, 0, 0, 1)'       // Dark red
									],
									startPoints: [0, 0.15, 0.3, 0.5, 0.65, 0.8, 0.9, 1.0],
									colorMapSize: 512,
								}}
							/>
						)}

						{/* Choropleth Map - Region-based Aggregation
						    Algorithm: Region Aggregation by barangay/administrative boundaries
						    Use Case: Macro-level comparisons across neighborhoods */}
						{showHeatmap && heatmapType === 'choropleth' && Object.entries(barangayCrimeData).map(([key, data]) => {
							if (!data.center) return null;
							// Dynamic radius based on crime count (larger clusters = larger circles)
							const baseRadius = 400; // Start with 400m
							const maxCount = Math.max(...Object.values(barangayCrimeData).map(d => d.count));
							const ratio = data.count / maxCount;
							const radius = baseRadius + (ratio * 600); // 400m to 1000m
							
							return (
								<Circle
									key={`choropleth-${key}`}
									center={{ latitude: data.center.lat, longitude: data.center.lon }}
									radius={radius}
									fillColor={getChoroplethColor(data.count)}
									strokeColor="rgba(0, 0, 0, 0.2)"
									strokeWidth={2}
								/>
							);
						})}

						{/* Graduated Symbol Map - Uses same Region Aggregation as Choropleth
						    Algorithm: Region Aggregation with proportional symbols
						    Use Case: Comparative visualization across areas */}
						{showHeatmap && heatmapType === 'graduated' && Object.entries(barangayCrimeData).map(([key, data]) => {
							if (!data.center) return null;
							// Larger graduated sizes for better visibility (200m to 1200m)
							const maxCount = Math.max(...Object.values(barangayCrimeData).map(d => d.count));
							const ratio = data.count / maxCount;
							const size = 200 + (ratio * 1000); // Much larger range
							
							return (
								<Circle
									key={`graduated-${key}`}
									center={{ latitude: data.center.lat, longitude: data.center.lon }}
									radius={size}
									fillColor="rgba(220, 38, 38, 0.5)"
									strokeColor="rgba(220, 38, 38, 0.9)"
									strokeWidth={3}
								/>
							);
						})}

						{/* Grid-Based Area Heatmap
						    Algorithm: Grid Binning + DBSCAN for micro-hotspot detection
						    Use Case: Micro-hotspots, spatial pattern analysis */}
						{showHeatmap && heatmapType === 'grid' && gridHeatmapData.map((cell, idx) => {
							const maxCount = Math.max(...gridHeatmapData.map(c => c.count), 1);
							const ratio = cell.count / maxCount;
							
							// Color gradient based on intensity (low to high)
							let fillColor: string;
							let strokeColor: string;
							
							if (ratio < 0.2) {
								// Very Low - Light green
								fillColor = `rgba(144, 238, 144, 0.4)`;  // Light green
								strokeColor = 'rgba(144, 238, 144, 0.6)';
							} else if (ratio < 0.4) {
								// Low - Green
								fillColor = `rgba(0, 255, 0, 0.5)`;
								strokeColor = 'rgba(0, 255, 0, 0.7)';
							} else if (ratio < 0.6) {
								// Medium - Yellow-green
								fillColor = `rgba(154, 205, 50, 0.6)`;
								strokeColor = 'rgba(154, 205, 50, 0.8)';
							} else if (ratio < 0.8) {
								// High - Yellow-orange
								fillColor = `rgba(255, 215, 0, 0.7)`;
								strokeColor = 'rgba(255, 215, 0, 0.9)';
							} else {
								// Very High - Orange-red
								fillColor = `rgba(255, 69, 0, 0.8)`;
								strokeColor = 'rgba(255, 69, 0, 1)';
							}
							
							// Radius also varies with intensity for better visibility
							const baseRadius = 600;
							const radius = baseRadius + (ratio * 200); // 600-800m
							
							return (
								<Circle
									key={`grid-${idx}`}
									center={{ latitude: cell.lat, longitude: cell.lon }}
									radius={radius}
									fillColor={fillColor}
									strokeColor={strokeColor}
									strokeWidth={2}
								/>
							);
						})}

						{/* Bubble/Clustered Map
						    Algorithm: K-Means or DBSCAN (adaptive based on dataset size)
						    Use Case: Incident grouping by category, area comparison */}
						{showHeatmap && heatmapType === 'bubble' && bubbleData.map((bubble, idx) => {
							const size = getBubbleSize(bubble.count);
							const fillColor = getBubbleColor(bubble.category);
							const strokeColor = getCrimeColor(bubble.category);
							
							return (
								<Circle
									key={`bubble-${idx}`}
									center={{ latitude: bubble.lat, longitude: bubble.lon }}
									radius={size}
									fillColor={fillColor}
									strokeColor={strokeColor}
									strokeWidth={3}
								/>
							);
						})}

						{/* Category Circles Overlay (works with all heatmap types) - Better clustered */}
						{showCategoryCircles && heatmapType !== 'bubble' && bubbleData.map((bubble, idx) => {
							const size = getBubbleSize(bubble.count);
							const fillColor = getBubbleColor(bubble.category);
							const strokeColor = getCrimeColor(bubble.category);
							
							return (
								<Circle
									key={`category-circle-${idx}`}
									center={{ latitude: bubble.lat, longitude: bubble.lon }}
									radius={size}
									fillColor={fillColor}
									strokeColor={strokeColor}
									strokeWidth={2}
									zIndex={10}
								/>
							);
						})}

						{/* Markers: cluster all crimes, show count when multiple */}
						{showMarkers && clusters.map((cluster, idx) => {
							const total = cluster.items.length;
							
							// If single crime, show individual marker
							if (total === 1) {
								const crime = cluster.items[0];
								const category = getCrimeCategory(crime);
								const markerColor = getCrimeColor(category);
								return (
									<Marker
										key={`single-${idx}`}
										coordinate={{ latitude: cluster.lat, longitude: cluster.lon }}
										onPress={() => { setSelectedCrime(crime); setSelectedCluster(null); }}
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
							}
							
							// Multiple crimes - show cluster with count
							// Use category color when filter is applied, otherwise use most common category color
							let baseColor;
							if (filterCategory !== 'all') {
								// When a specific category is filtered, use that category's color
								baseColor = getCrimeColor(filterCategory);
							} else {
								// When showing all categories, use the color of the most common category
								const categoryCounts: Record<CrimeCategory, number> = {
									violent: 0,
									property: 0,
									drug: 0,
									traffic: 0,
									other: 0
								};
								
								// Count occurrences of each category
								cluster.items.forEach(crime => {
									const category = getCrimeCategory(crime);
									categoryCounts[category]++;
								});
								
								// Find the category with the highest count
								const mostCommonCategory = Object.entries(categoryCounts)
									.reduce((max, [category, count]) => 
										count > max.count ? { category: category as CrimeCategory, count } : max
									, { category: 'other' as CrimeCategory, count: 0 });
								
								baseColor = getCrimeColor(mostCommonCategory.category);
							}
							return (
								<Marker
									key={`cluster-${idx}`}
									coordinate={{ latitude: cluster.lat, longitude: cluster.lon }}
									onPress={() => { setSelectedCrime(null); setSelectedCluster(cluster.items); setActiveClusterTab(filterCategory === 'all' ? 'all' : filterCategory); }}
								>
									<View style={[styles.clusterContainer, { backgroundColor: baseColor }]}> 
										<Text style={styles.clusterText}>{total}</Text>
									</View>
								</Marker>
								);
								})}

					{/* Report Markers */}
					{showReports && reports.filter(report => report.latitude && report.longitude).map((report) => (
						<Marker
							key={`report-${report.id}`}
							coordinate={{
								latitude: report.latitude,
								longitude: report.longitude,
							}}
							onPress={() => setSelectedCrime(null)} // Clear crime selection when selecting report
							pinColor="#FF6B35" // Orange color for reports
						>
							<View style={styles.reportMarkerContainer}>
								<View style={[styles.reportMarkerInner, { backgroundColor: '#FF6B35' }]}>
									<AlertTriangle size={16} color="#FFF" />
								</View>
							</View>
						</Marker>
					))}
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

							{/* Map Type Selection */}
							<View className="mt-4 border-t pt-4" style={{ borderColor: colors.border }}>
								<Text className="mb-2 text-sm font-semibold" style={{ color: colors.textSecondary }}>
									Map Type
								</Text>
								
								<View className="flex-row flex-wrap gap-2">
									<TouchableOpacity
										className="flex-1 min-w-[45%] mb-2 rounded-lg p-3"
										style={{ backgroundColor: mapType === 'standard' ? colors.primary + '20' : colors.background }}
										onPress={() => setMapType('standard')}
									>
										<Text className="text-center font-medium" style={{ color: mapType === 'standard' ? colors.primary : colors.text }}>
											Standard
										</Text>
									</TouchableOpacity>

									<TouchableOpacity
										className="flex-1 min-w-[45%] mb-2 rounded-lg p-3"
										style={{ backgroundColor: mapType === 'satellite' ? colors.primary + '20' : colors.background }}
										onPress={() => setMapType('satellite')}
									>
										<Text className="text-center font-medium" style={{ color: mapType === 'satellite' ? colors.primary : colors.text }}>
											Satellite
										</Text>
									</TouchableOpacity>

									<TouchableOpacity
										className="flex-1 min-w-[45%] mb-2 rounded-lg p-3"
										style={{ backgroundColor: mapType === 'hybrid' ? colors.primary + '20' : colors.background }}
										onPress={() => setMapType('hybrid')}
									>
										<Text className="text-center font-medium" style={{ color: mapType === 'hybrid' ? colors.primary : colors.text }}>
											Hybrid
										</Text>
									</TouchableOpacity>

									<TouchableOpacity
										className="flex-1 min-w-[45%] mb-2 rounded-lg p-3"
										style={{ backgroundColor: mapType === 'terrain' ? colors.primary + '20' : colors.background }}
										onPress={() => setMapType('terrain')}
									>
										<Text className="text-center font-medium" style={{ color: mapType === 'terrain' ? colors.primary : colors.text }}>
											Terrain
										</Text>
									</TouchableOpacity>
								</View>
							</View>

							{/* Heatmap Type Selection */}
							<View className="mt-4 border-t pt-4" style={{ borderColor: colors.border }}>
								<Text className="mb-2 text-sm font-semibold" style={{ color: colors.textSecondary }}>
									Heatmap Visualization
								</Text>
								
								<TouchableOpacity
									className="mb-2 flex-row items-center rounded-lg p-3"
									style={{ backgroundColor: heatmapType === 'density' ? colors.primary + '20' : colors.background }}
									onPress={() => setHeatmapType('density')}
								>
									<Radar size={20} color={heatmapType === 'density' ? colors.primary : colors.textSecondary} />
									<View className="flex-1 ml-3">
										<Text className="font-medium" style={{ color: colors.text }}>
											Density Heatmap
										</Text>
										<Text className="text-xs" style={{ color: colors.textSecondary }}>
											Smooth gradient showing crime concentration
										</Text>
									</View>
								</TouchableOpacity>

								<TouchableOpacity
									className="mb-2 flex-row items-center rounded-lg p-3"
									style={{ backgroundColor: heatmapType === 'choropleth' ? colors.primary + '20' : colors.background }}
									onPress={() => setHeatmapType('choropleth')}
								>
									<Layers size={20} color={heatmapType === 'choropleth' ? colors.primary : colors.textSecondary} />
									<View className="flex-1 ml-3">
										<Text className="font-medium" style={{ color: colors.text }}>
											Choropleth (Area) Map
										</Text>
										<Text className="text-xs" style={{ color: colors.textSecondary }}>
											Color-coded areas by barangay crime rates
										</Text>
									</View>
								</TouchableOpacity>

								<TouchableOpacity
									className="mb-2 flex-row items-center rounded-lg p-3"
									style={{ backgroundColor: heatmapType === 'graduated' ? colors.primary + '20' : colors.background }}
									onPress={() => setHeatmapType('graduated')}
								>
									<MapPinned size={20} color={heatmapType === 'graduated' ? colors.primary : colors.textSecondary} />
									<View className="flex-1 ml-3">
										<Text className="font-medium" style={{ color: colors.text }}>
											Graduated Symbol Map
										</Text>
										<Text className="text-xs" style={{ color: colors.textSecondary }}>
											Varying circle sizes based on density
										</Text>
									</View>
								</TouchableOpacity>

								<TouchableOpacity
									className="mb-2 flex-row items-center rounded-lg p-3"
									style={{ backgroundColor: heatmapType === 'grid' ? colors.primary + '20' : colors.background }}
									onPress={() => setHeatmapType('grid')}
								>
									<Grid3x3 size={20} color={heatmapType === 'grid' ? colors.primary : colors.textSecondary} />
									<View className="flex-1 ml-3">
										<Text className="font-medium" style={{ color: colors.text }}>
											Grid-Based Heatmap
										</Text>
										<Text className="text-xs" style={{ color: colors.textSecondary }}>
											Geographic grid showing area-based intensity
										</Text>
									</View>
								</TouchableOpacity>

								<TouchableOpacity
									className="mb-2 flex-row items-center rounded-lg p-3"
									style={{ backgroundColor: heatmapType === 'bubble' ? colors.primary + '20' : colors.background }}
									onPress={() => setHeatmapType('bubble')}
								>
									<Activity size={20} color={heatmapType === 'bubble' ? colors.primary : colors.textSecondary} />
									<View className="flex-1 ml-3">
										<Text className="font-medium" style={{ color: colors.text }}>
											Bubble Map (Category Circles)
										</Text>
										<Text className="text-xs" style={{ color: colors.textSecondary }}>
											Color-coded circles by crime category
										</Text>
									</View>
								</TouchableOpacity>
							</View>

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

								  <TouchableOpacity
								className="mb-2 flex-row items-center justify-between rounded-lg p-3"
								style={{ backgroundColor: colors.background }}
								onPress={() => setShowReports(!showReports)}
							>
								<Text className="font-medium" style={{ color: colors.text }}>
									Show Reports
								</Text>
								<View
									className="h-6 w-11 rounded-full p-1"
									style={{ backgroundColor: showReports ? '#FF6B35' : colors.border }}
								>
									<View
										className="h-4 w-4 rounded-full bg-white"
										style={{
											transform: [{ translateX: showReports ? 20 : 0 }]
										}}
									/>
								</View>
							</TouchableOpacity>

							<TouchableOpacity
								className="flex-row items-center justify-between rounded-lg p-3"
								style={{ backgroundColor: colors.background }}
								onPress={() => setShowCategoryCircles(!showCategoryCircles)}
							>
								<View className="flex-1">
									<Text className="font-medium" style={{ color: colors.text }}>
										Show Category Circles
									</Text>
									<Text className="text-xs" style={{ color: colors.textSecondary }}>
										Overlay colored circles on other heatmaps
									</Text>
								</View>
								<View
									className="h-6 w-11 rounded-full p-1"
									style={{ backgroundColor: showCategoryCircles ? colors.primary : colors.border }}
								>
									<View
										className="h-4 w-4 rounded-full bg-white"
										style={{
											transform: [{ translateX: showCategoryCircles ? 20 : 0 }]
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
						<ScrollView 
							horizontal 
							showsHorizontalScrollIndicator={false}
							className="mb-3"
							contentContainerStyle={{ paddingRight: 16 }}
						>
							{(() => {
								// Show all tabs when filterCategory is 'all', otherwise show only 'all' and current category
								const tabsToShow = filterCategory === 'all' 
									? (['all','violent','property','drug','traffic','other'] as const)
									: (['all', filterCategory] as const);
								
								const tabsWithCounts = tabsToShow
									.map((tab) => {
										const label = tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1);
										const count = tab === 'all' ? selectedCluster.length : selectedCluster.filter(c => getCrimeCategory(c) === tab).length;
										return { tab, label, count };
									})
									.filter(({ count }) => count > 0); // Hide tabs with 0 items
								
								// If current active tab is not available, switch to 'all' tab
								const availableTabs = tabsWithCounts.map(({ tab }) => tab);
								if (!availableTabs.includes(activeClusterTab)) {
									setActiveClusterTab('all');
								}
								
								return tabsWithCounts.map(({ tab, label, count }) => {
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
								});
							})()}
						</ScrollView>

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

						{/* Reset Camera Button */}
						<TouchableOpacity
							className="absolute left-4 top-20 flex-row items-center rounded-xl px-4 py-3 shadow-lg"
							style={{ backgroundColor: colors.card }}
							onPress={resetMapRegion}
						>
							<RotateCcw size={20} color={colors.primary} />
							<Text className="ml-2 font-semibold" style={{ color: colors.text }}>
								Reset View
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

						{/* Heatmap Legend */}
						{showHeatmap && (
							<View 
								className="absolute right-4 top-32 rounded-xl px-3 py-2 shadow-lg"
								style={{ backgroundColor: colors.card }}
							>
								<Text className="mb-2 text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>
									{heatmapType === 'density' && 'Density'}
									{heatmapType === 'choropleth' && 'Crime Rate'}
									{heatmapType === 'graduated' && 'Symbol Size'}
									{heatmapType === 'grid' && 'Grid Intensity'}
								</Text>
								
								{heatmapType === 'density' && (
									<View className="space-y-1">
										<View className="flex-row items-center">
											<View className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: 'rgba(139, 0, 0, 1)' }} />
											<Text className="text-xs" style={{ color: colors.text }}>Very High</Text>
										</View>
										<View className="flex-row items-center">
											<View className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: 'rgba(255, 165, 0, 0.85)' }} />
											<Text className="text-xs" style={{ color: colors.text }}>Medium</Text>
										</View>
										<View className="flex-row items-center">
											<View className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: 'rgba(0, 255, 0, 0.5)' }} />
											<Text className="text-xs" style={{ color: colors.text }}>Low</Text>
										</View>
									</View>
								)}
								
								{heatmapType === 'choropleth' && (
									<View className="space-y-1">
										<View className="flex-row items-center">
											<View className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: 'rgba(220, 38, 38, 0.6)' }} />
											<Text className="text-xs" style={{ color: colors.text }}>High</Text>
										</View>
										<View className="flex-row items-center">
											<View className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: 'rgba(251, 191, 36, 0.6)' }} />
											<Text className="text-xs" style={{ color: colors.text }}>Medium</Text>
										</View>
										<View className="flex-row items-center">
											<View className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: 'rgba(59, 130, 246, 0.6)' }} />
											<Text className="text-xs" style={{ color: colors.text }}>Low</Text>
										</View>
									</View>
								)}
								
								{heatmapType === 'graduated' && (
									<View className="space-y-1">
										<View className="flex-row items-center">
											<View className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: 'rgba(220, 38, 38, 0.4)', borderWidth: 2, borderColor: 'rgba(220, 38, 38, 0.8)' }} />
											<Text className="text-xs" style={{ color: colors.text }}>Large</Text>
										</View>
										<View className="flex-row items-center">
											<View className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: 'rgba(220, 38, 38, 0.4)', borderWidth: 2, borderColor: 'rgba(220, 38, 38, 0.8)' }} />
											<Text className="text-xs" style={{ color: colors.text }}>Medium</Text>
										</View>
										<View className="flex-row items-center">
											<View className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: 'rgba(220, 38, 38, 0.4)', borderWidth: 2, borderColor: 'rgba(220, 38, 38, 0.8)' }} />
											<Text className="text-xs" style={{ color: colors.text }}>Small</Text>
										</View>
									</View>
								)}
								
								{heatmapType === 'grid' && (
									<View className="space-y-1">
										<View className="flex-row items-center">
											<View className="h-3 w-3 rounded mr-2" style={{ backgroundColor: 'rgba(255, 69, 0, 0.8)' }} />
											<Text className="text-xs" style={{ color: colors.text }}>Very High (80-100%)</Text>
										</View>
										<View className="flex-row items-center">
											<View className="h-3 w-3 rounded mr-2" style={{ backgroundColor: 'rgba(255, 215, 0, 0.7)' }} />
											<Text className="text-xs" style={{ color: colors.text }}>High (60-80%)</Text>
										</View>
										<View className="flex-row items-center">
											<View className="h-3 w-3 rounded mr-2" style={{ backgroundColor: 'rgba(154, 205, 50, 0.6)' }} />
											<Text className="text-xs" style={{ color: colors.text }}>Medium (40-60%)</Text>
										</View>
										<View className="flex-row items-center">
											<View className="h-3 w-3 rounded mr-2" style={{ backgroundColor: 'rgba(0, 255, 0, 0.5)' }} />
											<Text className="text-xs" style={{ color: colors.text }}>Low (20-40%)</Text>
										</View>
										<View className="flex-row items-center">
											<View className="h-3 w-3 rounded mr-2" style={{ backgroundColor: 'rgba(144, 238, 144, 0.4)' }} />
											<Text className="text-xs" style={{ color: colors.text }}>Very Low (&lt;20%)</Text>
										</View>
									</View>
								)}
								
								{heatmapType === 'bubble' && (
									<View className="space-y-1">
										<View className="flex-row items-center">
											<View className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: '#DC2626' }} />
											<Text className="text-xs" style={{ color: colors.text }}>Violent</Text>
										</View>
										<View className="flex-row items-center">
											<View className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: '#F59E0B' }} />
											<Text className="text-xs" style={{ color: colors.text }}>Property</Text>
										</View>
										<View className="flex-row items-center">
											<View className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: '#7C3AED' }} />
											<Text className="text-xs" style={{ color: colors.text }}>Drug</Text>
										</View>
										<View className="flex-row items-center">
											<View className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: '#3B82F6' }} />
											<Text className="text-xs" style={{ color: colors.text }}>Traffic</Text>
										</View>
										<View className="flex-row items-center">
											<View className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: '#6B7280' }} />
											<Text className="text-xs" style={{ color: colors.text }}>Other</Text>
										</View>
										<Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>Size = count</Text>
									</View>
								)}
							</View>
						)}
					</>
				)}

				{/* Report Button */}
				{!selectedCrime && !showFilters && !selectedCluster && (
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
	reportMarkerContainer: {
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
	reportMarkerInner: {
		width: 28,
		height: 28,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

// Light map style - enhanced visibility with subtle colors
const lightMapStyle = [
	{
		featureType: 'landscape',
		elementType: 'geometry',
		stylers: [{ color: '#f5f5f5' }],
	},
	{
		featureType: 'water',
		elementType: 'geometry',
		stylers: [{ color: '#c9e6f2' }],
	},
	{
		featureType: 'water',
		elementType: 'labels.text.fill',
		stylers: [{ color: '#7ba3c0' }],
	},
	{
		featureType: 'poi.park',
		elementType: 'geometry',
		stylers: [{ color: '#d4e5d4' }],
	},
	{
		featureType: 'road',
		elementType: 'geometry',
		stylers: [{ color: '#ffffff' }],
	},
	{
		featureType: 'road',
		elementType: 'geometry.stroke',
		stylers: [{ color: '#d6d6d6' }],
	},
	{
		featureType: 'road.highway',
		elementType: 'geometry',
		stylers: [{ color: '#ffeaa7' }],
	},
	{
		featureType: 'road.highway',
		elementType: 'geometry.stroke',
		stylers: [{ color: '#f5c842' }],
	},
	{
		featureType: 'poi',
		elementType: 'labels.icon',
		stylers: [{ visibility: 'off' }],
	},
	{
		featureType: 'transit',
		elementType: 'labels.icon',
		stylers: [{ visibility: 'off' }],
	},
];

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
	{
		featureType: 'water',
		elementType: 'geometry',
		stylers: [{ color: '#17263c' }],
	},
	{
		featureType: 'poi.park',
		elementType: 'geometry',
		stylers: [{ color: '#1a3a1a' }],
	},
	{
		featureType: 'road',
		elementType: 'geometry',
		stylers: [{ color: '#38414e' }],
	},
	{
		featureType: 'road',
		elementType: 'geometry.stroke',
		stylers: [{ color: '#212a37' }],
	},
	{
		featureType: 'road.highway',
		elementType: 'geometry',
		stylers: [{ color: '#746855' }],
	},
	{
		featureType: 'road.highway',
		elementType: 'geometry.stroke',
		stylers: [{ color: '#1f2835' }],
	},
];


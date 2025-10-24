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
import MapView, {
  Marker,
  Heatmap,
  PROVIDER_GOOGLE,
  Circle,
  Region,
  Polyline,
} from 'react-native-maps';
import { useRealtimeReports, useCategories } from '@kiyoko-org/dispatch-lib';
import type { Database } from '@kiyoko-org/dispatch-lib/database.types';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import DatePicker from 'components/DatePicker';
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
  Map as MapIcon,
} from 'lucide-react-native';

const { width, height: windowHeight } = Dimensions.get('window');

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

type CrimeCategory = 'violent' | 'property' | 'drug' | 'traffic' | 'operation' | 'other';

interface CrimeTypeConfig {
  category: CrimeCategory;
  color: string;
  icon: string;
  label: string;
}

type DispatchReport = Database['public']['Tables']['reports']['Row'];
type DispatchCategory = Database['public']['Tables']['categories']['Row'];
type ReportWithCategory = DispatchReport & {
  categoryName: string | null;
  subCategoryName: string | null;
};

export default function MapPage() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [crimes, setCrimes] = useState<CrimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrime, setSelectedCrime] = useState<CrimeData | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<CrimeData[] | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [selectedReportCluster, setSelectedReportCluster] = useState<ReportWithCategory[] | null>(
    null
  );
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [filterCategory, setFilterCategory] = useState<CrimeCategory | 'all'>('all');
  const [filterSubcategory, setFilterSubcategory] = useState<string | null>(null);
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<CrimeCategory>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Calculate center of Tuguegarao City
  const initialRegion = {
    latitude: 17.6132,
    longitude: 121.727,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  };

  const [mapRegion, setMapRegion] = useState<Region | null>(initialRegion);
  const [activeClusterTab, setActiveClusterTab] = useState<'all' | CrimeCategory>('all');
  const mapRef = useRef<MapView>(null);

  // Heatmap visualization types
  type HeatmapType = 'density' | 'choropleth' | 'graduated' | 'grid' | 'bubble';
  const [heatmapType, setHeatmapType] = useState<HeatmapType>('density');

  // Map type
  type MapType = 'standard' | 'satellite' | 'hybrid' | 'terrain';
  const [mapType, setMapType] = useState<MapType>('standard');

  // Show legend expanded/collapsed
  const [legendExpanded, setLegendExpanded] = useState(false);
  const legendContentMaxHeight = Math.min(windowHeight * 0.5, 400);

  // Reports integration
  const { reports } = useRealtimeReports();
  const { categories } = useCategories();

  const categoryMap = useMemo(() => {
    return categories.reduce((map, category) => {
      map.set(category.id, category);
      return map;
    }, new Map<number, DispatchCategory>());
  }, [categories]);

  const reportsWithCategories = useMemo<ReportWithCategory[]>(() => {
    return reports.map((report) => {
      const category =
        report.category_id !== null && report.category_id !== undefined
          ? categoryMap.get(report.category_id)
          : undefined;

      let subCategoryName: string | null = null;
      const rawSubCategory = report.sub_category as unknown;
      if (
        category?.sub_categories &&
        Array.isArray(category.sub_categories) &&
        typeof rawSubCategory === 'number' &&
        rawSubCategory >= 0
      ) {
        subCategoryName = category.sub_categories[rawSubCategory] ?? null;
      } else if (typeof rawSubCategory === 'string' && rawSubCategory.length > 0) {
        subCategoryName = rawSubCategory;
      }

      return {
        ...report,
        categoryName: category?.name ?? null,
        subCategoryName,
      };
    });
  }, [reports, categoryMap]);

  const resolvedReports = useMemo(() => {
    const startBoundary = filterStartDate ? new Date(filterStartDate) : null;
    const endBoundary = filterEndDate ? new Date(filterEndDate) : null;

    if (startBoundary) {
      startBoundary.setHours(0, 0, 0, 0);
    }
    if (endBoundary) {
      endBoundary.setHours(23, 59, 59, 999);
    }

    return reportsWithCategories.filter(
      (report): report is ReportWithCategory & { latitude: number; longitude: number } => {
        const hasCoordinates =
          typeof report.latitude === 'number' &&
          typeof report.longitude === 'number' &&
          Number.isFinite(report.latitude) &&
          Number.isFinite(report.longitude);

        if (!hasCoordinates || report.status !== 'resolved') {
          return false;
        }

        if (!startBoundary && !endBoundary) {
          return true;
        }

        const reportDate = report.created_at ? new Date(report.created_at) : null;
        if (!reportDate || Number.isNaN(reportDate.getTime())) {
          return false;
        }

        if (startBoundary && reportDate < startBoundary) {
          return false;
        }

        if (endBoundary && reportDate > endBoundary) {
          return false;
        }

        return true;
      }
    );
  }, [reportsWithCategories, filterStartDate, filterEndDate]);

  const selectedReport = useMemo(() => {
    if (selectedReportId === null) {
      return null;
    }

    return reportsWithCategories.find((report) => report.id === selectedReportId) ?? null;
  }, [reportsWithCategories, selectedReportId]);

  useEffect(() => {
    if (selectedReportId === null) {
      return;
    }

    const exists = reportsWithCategories.some((report) => report.id === selectedReportId);
    if (!exists) {
      setSelectedReportId(null);
    }
  }, [reportsWithCategories, selectedReportId]);

  const selectedReportCategoryLabel =
    selectedReport?.categoryName ?? selectedReport?.incident_category ?? null;
  const selectedReportSubcategoryLabel =
    selectedReport?.subCategoryName ?? selectedReport?.incident_subcategory ?? null;
  const selectedReportTitle =
    selectedReport?.incident_title ?? selectedReportCategoryLabel ?? 'Incident Report';

  useEffect(() => {
    loadCrimeData();
  }, []);

  const formatDateForPicker = (date: Date | null): string | undefined => {
    if (!date) {
      return undefined;
    }
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear());
    return `${month}/${day}/${year}`;
  };

  const parsePickerDate = (value: string): Date | null => {
    const [month, day, year] = value.split('/').map((part) => Number(part));
    if (!month || !day || !year) {
      return null;
    }

    const parsed = new Date(year, month - 1, day);
    parsed.setHours(0, 0, 0, 0);

    if (
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day ||
      parsed.getFullYear() !== year ||
      Number.isNaN(parsed.getTime())
    ) {
      return null;
    }

    return parsed;
  };

  const handleSelectStartDate = (value: string) => {
    const parsed = parsePickerDate(value);
    if (!parsed) {
      return;
    }

    setFilterStartDate(parsed);
    setFilterEndDate((prev) => {
      if (prev && parsed > prev) {
        return parsed;
      }
      return prev;
    });
  };

  const handleSelectEndDate = (value: string) => {
    const parsed = parsePickerDate(value);
    if (!parsed) {
      return;
    }

    setFilterEndDate(parsed);
    setFilterStartDate((prev) => {
      if (prev && prev > parsed) {
        return parsed;
      }
      return prev;
    });
  };

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

    // Check if it's an Operation first
    if (type.includes('operation')) {
      return 'operation';
    }

    // Then check for specific incident types
    if (
      type.includes('murder') ||
      type.includes('homicide') ||
      type.includes('shooting') ||
      type.includes('stabbing') ||
      type.includes('assault') ||
      type.includes('violence')
    ) {
      return 'violent';
    }
    if (
      type.includes('robbery') ||
      type.includes('theft') ||
      type.includes('carnapping') ||
      type.includes('burglary')
    ) {
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
      case 'violent':
        return '#DC2626'; // Red
      case 'property':
        return '#F59E0B'; // Orange
      case 'drug':
        return '#7C3AED'; // Purple
      case 'traffic':
        return '#3B82F6'; // Blue
      case 'operation':
        return '#10B981'; // Green
      default:
        return '#6B7280'; // Gray
    }
  };

  // Get subcategories (unique incident types) for each category
  const getSubcategories = (category: CrimeCategory): string[] => {
    const subcategories = dateFilteredCrimes
      .filter((crime) => getCrimeCategory(crime) === category)
      .map((crime) => crime.incidentType)
      .filter((value, index, self) => self.indexOf(value) === index) // unique
      .sort();
    return subcategories;
  };

  // Toggle category expansion
  const toggleCategory = (category: CrimeCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Filter crimes based on selected category, subcategory, and date range
  const dateFilteredCrimes = useMemo(() => {
    if (!filterStartDate && !filterEndDate) {
      return crimes;
    }

    const startBoundary = filterStartDate ? new Date(filterStartDate) : null;
    const endBoundary = filterEndDate ? new Date(filterEndDate) : null;

    if (startBoundary) {
      startBoundary.setHours(0, 0, 0, 0);
    }
    if (endBoundary) {
      endBoundary.setHours(23, 59, 59, 999);
    }

    return crimes.filter((crime) => {
      const crimeDate = new Date(crime.dateCommitted);
      if (Number.isNaN(crimeDate.getTime())) {
        return false;
      }

      if (startBoundary && crimeDate < startBoundary) {
        return false;
      }

      if (endBoundary && crimeDate > endBoundary) {
        return false;
      }

      return true;
    });
  }, [crimes, filterStartDate, filterEndDate]);

  const filteredCrimes = useMemo(() => {
    let filtered = dateFilteredCrimes;

    // Filter by category if selected
    if (filterCategory !== 'all') {
      filtered = filtered.filter((crime) => getCrimeCategory(crime) === filterCategory);
    }

    // Filter by subcategory if selected
    if (filterSubcategory) {
      filtered = filtered.filter((crime) => crime.incidentType === filterSubcategory);
    }

    return filtered;
  }, [dateFilteredCrimes, filterCategory, filterSubcategory]);

  // Grid-based clustering by location AND category with spidering for overlaps
  const clusters = useMemo(() => {
    if (!mapRegion)
      return [] as {
        lat: number;
        lon: number;
        originalLat: number;
        originalLon: number;
        items: CrimeData[];
        categories: Set<CrimeCategory>;
        isMixed: boolean;
        isSpider: boolean;
        locationKey: string;
      }[];

    // Use dynamic cell size based on zoom level, but with a larger minimum
    // This prevents clusters from breaking apart on small map movements
    const cellSizeLat = Math.max(mapRegion.latitudeDelta / 15, 0.001);
    const cellSizeLon = Math.max(mapRegion.longitudeDelta / 15, 0.001);

    // Key by location only (not category) to cluster at same location
    const cellKey = (lat: number, lon: number) => {
      const r = Math.floor((lat - mapRegion.latitude + mapRegion.latitudeDelta / 2) / cellSizeLat);
      const c = Math.floor(
        (lon - mapRegion.longitude + mapRegion.longitudeDelta / 2) / cellSizeLon
      );
      return `${r}:${c}`;
    };

    // Group crimes by location only
    const grid: Record<string, CrimeData[]> = {};
    for (const crime of filteredCrimes) {
      const key = cellKey(crime.lat, crime.lon);
      if (!grid[key]) grid[key] = [];
      grid[key].push(crime);
    }

    // Create clusters - one per location
    const result: {
      lat: number;
      lon: number;
      originalLat: number;
      originalLon: number;
      items: CrimeData[];
      categories: Set<CrimeCategory>;
      isMixed: boolean;
      isSpider: boolean;
      locationKey: string;
    }[] = [];

    for (const key in grid) {
      const items = grid[key];

      // Calculate centroid
      let sumLat = 0;
      let sumLon = 0;
      for (const crime of items) {
        sumLat += crime.lat;
        sumLon += crime.lon;
      }
      const centroidLat = sumLat / items.length;
      const centroidLon = sumLon / items.length;

      // Determine categories present
      const categories = new Set<CrimeCategory>();
      for (const crime of items) {
        categories.add(getCrimeCategory(crime));
      }
      const isMixed = categories.size > 1;

      const locationKey = `${centroidLat.toFixed(6)},${centroidLon.toFixed(6)}`;

      // Don't apply spidering here - will be done on click
      result.push({
        lat: centroidLat,
        lon: centroidLon,
        originalLat: centroidLat,
        originalLon: centroidLon,
        items,
        categories,
        isMixed,
        isSpider: false,
        locationKey,
      });
    }

    return result;
  }, [filteredCrimes, mapRegion]);

  // Grid-based clustering for user reports
  const reportClusters = useMemo(() => {
    if (!mapRegion)
      return [] as {
        lat: number;
        lon: number;
        originalLat: number;
        originalLon: number;
        items: ReportWithCategory[];
        locationKey: string;
      }[];

    // Use dynamic cell size based on zoom level, but with a larger minimum
    // This prevents clusters from breaking apart on small map movements
    const cellSizeLat = Math.max(mapRegion.latitudeDelta / 15, 0.001);
    const cellSizeLon = Math.max(mapRegion.longitudeDelta / 15, 0.001);

    // Key by location only to cluster at same location
    const cellKey = (lat: number, lon: number) => {
      const r = Math.floor((lat - mapRegion.latitude + mapRegion.latitudeDelta / 2) / cellSizeLat);
      const c = Math.floor(
        (lon - mapRegion.longitude + mapRegion.longitudeDelta / 2) / cellSizeLon
      );
      return `${r}:${c}`;
    };

    // Group reports by location only
    const grid: Record<string, ReportWithCategory[]> = {};
    for (const report of resolvedReports) {
      const lat = report.latitude;
      const lon = report.longitude;
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        continue;
      }

      const key = cellKey(lat, lon);
      if (!grid[key]) grid[key] = [];
      grid[key].push(report);
    }

    // Create clusters - one per location
    const result: {
      lat: number;
      lon: number;
      originalLat: number;
      originalLon: number;
      items: ReportWithCategory[];
      locationKey: string;
    }[] = [];

    for (const key in grid) {
      const items = grid[key];

      // Calculate centroid
      const validItems = items.filter(
        (report) => Number.isFinite(report.latitude) && Number.isFinite(report.longitude)
      );
      if (validItems.length === 0) {
        continue;
      }

      let sumLat = 0;
      let sumLon = 0;
      for (const report of validItems) {
        sumLat += report.latitude;
        sumLon += report.longitude;
      }
      const centroidLat = sumLat / validItems.length;
      const centroidLon = sumLon / validItems.length;
      if (!Number.isFinite(centroidLat) || !Number.isFinite(centroidLon)) {
        continue;
      }

      const locationKey = `${centroidLat.toFixed(6)},${centroidLon.toFixed(6)}`;

      result.push({
        lat: centroidLat,
        lon: centroidLon,
        originalLat: centroidLat,
        originalLon: centroidLon,
        items: validItems,
        locationKey,
      });
    }

    return result;
  }, [resolvedReports, mapRegion]);

  // Function to reset map to initial region
  const resetMapRegion = () => {
    mapRef.current?.animateToRegion(initialRegion, 1000);
    setMapRegion(initialRegion);
    setSelectedCrime(null);
    setSelectedCluster(null);
    setSelectedReportId(null);
    setSelectedReportCluster(null);
  };

  // Kernel Density Estimation (KDE) - Using cluster centroids for alignment with markers
  // This ensures heatmap centers align with visible markers on the map
  const heatmapPoints = useMemo(() => {
    // Use mapRegion if available, otherwise use initialRegion
    const region = mapRegion || initialRegion;

    // If no crimes, return empty array (will be handled by conditional rendering)
    if (filteredCrimes.length === 0) return [];

    // Use the same clustering logic as markers to ensure alignment
    const cellSizeLat = Math.max(region.latitudeDelta / 15, 0.001);
    const cellSizeLon = Math.max(region.longitudeDelta / 15, 0.001);
    const cellKey = (lat: number, lon: number) => {
      const r = Math.floor((lat - region.latitude + region.latitudeDelta / 2) / cellSizeLat);
      const c = Math.floor((lon - region.longitude + region.longitudeDelta / 2) / cellSizeLon);
      return `${r}:${c}`;
    };

    const grid: Record<string, CrimeData[]> = {};
    for (const crime of filteredCrimes) {
      const key = cellKey(crime.lat, crime.lon);
      if (!grid[key]) grid[key] = [];
      grid[key].push(crime);
    }

    const weightedPoints: Array<{ latitude: number; longitude: number; weight: number }> = [];

    for (const key in grid) {
      const items = grid[key];
      // Calculate centroid (same as marker position)
      let sumLat = 0;
      let sumLon = 0;
      for (const it of items) {
        sumLat += it.lat;
        sumLon += it.lon;
      }
      const centroidLat = sumLat / items.length;
      const centroidLon = sumLon / items.length;

      // Calculate weight based on crime count and severity
      let weight = items.length;
      const violentCount = items.filter((crime) => getCrimeCategory(crime) === 'violent').length;

      // Boost weight for violent crimes
      weight += violentCount * 0.5;

      weightedPoints.push({
        latitude: centroidLat,
        longitude: centroidLon,
        weight,
      });
    }

    return weightedPoints;
  }, [filteredCrimes, mapRegion]);

  // Get crime statistics
  const crimeStats = {
    total: dateFilteredCrimes.length,
    violent: dateFilteredCrimes.filter((c) => getCrimeCategory(c) === 'violent').length,
    property: dateFilteredCrimes.filter((c) => getCrimeCategory(c) === 'property').length,
    drug: dateFilteredCrimes.filter((c) => getCrimeCategory(c) === 'drug').length,
    traffic: dateFilteredCrimes.filter((c) => getCrimeCategory(c) === 'traffic').length,
    operation: dateFilteredCrimes.filter((c) => getCrimeCategory(c) === 'operation').length,
    other: dateFilteredCrimes.filter((c) => getCrimeCategory(c) === 'other').length,
  };

  // Choropleth: Aggregation by region (barangay) - Proper clustering algorithm
  const barangayCrimeData = useMemo(() => {
    const points: (Point & { crime: CrimeData })[] = filteredCrimes.map((crime) => ({
      lat: crime.lat,
      lon: crime.lon,
      crime,
    }));

    // Use region aggregation algorithm for choropleth
    const clusters = regionAggregation(points, (p) => `${p.crime.barangay}-${p.crime.municipal}`);

    const grouped: Record<
      string,
      { count: number; crimes: CrimeData[]; center?: { lat: number; lon: number } }
    > = {};

    clusters.forEach((cluster, idx) => {
      const key = `cluster-${idx}`;
      grouped[key] = {
        count: cluster.count,
        crimes: cluster.points.map((p) => (p as any).crime),
        center: cluster.center,
      };
    });

    return grouped;
  }, [filteredCrimes]);

  // Get color based on crime count for choropleth
  const getChoroplethColor = (count: number): string => {
    const maxCount = Math.max(...Object.values(barangayCrimeData).map((d) => d.count));
    const ratio = count / maxCount;

    if (ratio > 0.7) return 'rgba(220, 38, 38, 0.6)'; // High - Red
    if (ratio > 0.4) return 'rgba(251, 191, 36, 0.6)'; // Medium - Yellow
    return 'rgba(59, 130, 246, 0.6)'; // Low - Blue
  };

  // Grid-based heatmap with Grid Binning + DBSCAN for micro-hotspots
  const gridHeatmapData = useMemo(() => {
    if (!mapRegion) return [];

    const points: Point[] = filteredCrimes.map((crime) => ({
      lat: crime.lat,
      lon: crime.lon,
      data: crime,
    }));

    // First: Grid binning for spatial organization (0.005° = ~500m)
    const gridClusters = gridBinning(points, 0.005);

    // Then: Apply DBSCAN on high-density grid cells for micro-hotspot detection
    const denseCells = gridClusters.filter((c) => c.count >= 3);
    const densePoints = denseCells.flatMap((c) => c.points);

    let finalClusters: Cluster[] = gridClusters;
    if (densePoints.length > 0) {
      const dbscanClusters = dbscan(densePoints, 300, 2); // 300m epsilon, min 2 points
      if (dbscanClusters.length > 0) {
        finalClusters = dbscanClusters;
      }
    }

    return finalClusters.map((c) => ({
      lat: c.center.lat,
      lon: c.center.lon,
      count: c.count,
      crimes: c.points.map((p) => (p as any).data as CrimeData),
    }));
  }, [filteredCrimes, mapRegion]);

  // Get graduated symbol size
  const getGraduatedSize = (count: number): number => {
    const maxCount = Math.max(...Object.values(barangayCrimeData).map((d) => d.count));
    const ratio = count / maxCount;
    return 20 + ratio * 80; // Size between 20 and 100
  };

  // Bubble visualization - K-Means or DBSCAN for incident grouping
  const bubbleData = useMemo(() => {
    // Group crimes by category first
    const crimesByCategory: Record<CrimeCategory, CrimeData[]> = {
      violent: [],
      property: [],
      drug: [],
      traffic: [],
      operation: [],
      other: [],
    };

    filteredCrimes.forEach((crime) => {
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

      const points: Point[] = crimes.map((crime) => ({
        lat: crime.lat,
        lon: crime.lon,
        data: crime,
      }));

      // Use K-Means for predefined cluster count, or DBSCAN for density-based
      const k = Math.min(Math.ceil(crimes.length / 5), 15); // Adaptive cluster count
      let clusters: Cluster[];

      if (crimes.length >= 10) {
        clusters = kMeans(points, k, 50); // K-Means for larger datasets
      } else {
        clusters = dbscan(points, 500, 2); // DBSCAN for smaller datasets
      }

      clusters.forEach((cluster) => {
        allBubbles.push({
          lat: cluster.center.lat,
          lon: cluster.center.lon,
          category: category as CrimeCategory,
          count: cluster.count,
          crimes: cluster.points.map((p) => (p as any).data as CrimeData),
        });
      });
    });

    return allBubbles;
  }, [filteredCrimes]);

  // Get bubble size based on count - larger sizes for better clustering visibility
  const getBubbleSize = (count: number): number => {
    const maxCount = Math.max(...bubbleData.map((b) => b.count), 1);
    const ratio = count / maxCount;
    return 200 + ratio * 600; // Size between 200 and 800 meters
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
            customMapStyle={
              mapType === 'standard' ? (isDark ? darkMapStyle : lightMapStyle) : undefined
            }>
            {/* Kernel Density Estimation (KDE) with cluster-based positioning
						    Algorithm: Grid-based clustering + weighted KDE rendering
						    Use Case: Hotspot detection, intensity visualization aligned with markers */}
            {showHeatmap && heatmapType === 'density' && heatmapPoints.length > 0 && (
              <Heatmap
                points={heatmapPoints}
                opacity={0.7}
                radius={50}
                gradient={{
                  colors: [
                    'rgba(0, 255, 0, 0)', // Transparent green
                    'rgba(0, 255, 0, 0.5)', // Light green
                    'rgba(124, 252, 0, 0.7)', // Lawn green
                    'rgba(255, 255, 0, 0.8)', // Yellow
                    'rgba(255, 165, 0, 0.85)', // Orange
                    'rgba(255, 69, 0, 0.9)', // Red-orange
                    'rgba(255, 0, 0, 0.95)', // Red
                    'rgba(139, 0, 0, 1)', // Dark red
                  ],
                  startPoints: [0, 0.15, 0.3, 0.5, 0.65, 0.8, 0.9, 1.0],
                  colorMapSize: 512,
                }}
              />
            )}

            {/* Choropleth Map - Region-based Aggregation
						    Algorithm: Region Aggregation by barangay/administrative boundaries
						    Use Case: Macro-level comparisons across neighborhoods */}
            {showHeatmap &&
              heatmapType === 'choropleth' &&
              Object.entries(barangayCrimeData).map(([key, data]) => {
                if (!data.center) return null;
                // Dynamic radius based on crime count (larger clusters = larger circles)
                const baseRadius = 400; // Start with 400m
                const maxCount = Math.max(...Object.values(barangayCrimeData).map((d) => d.count));
                const ratio = data.count / maxCount;
                const radius = baseRadius + ratio * 600; // 400m to 1000m

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
            {showHeatmap &&
              heatmapType === 'graduated' &&
              Object.entries(barangayCrimeData).map(([key, data]) => {
                if (!data.center) return null;
                // Larger graduated sizes for better visibility (200m to 1200m)
                const maxCount = Math.max(...Object.values(barangayCrimeData).map((d) => d.count));
                const ratio = data.count / maxCount;
                const size = 200 + ratio * 1000; // Much larger range

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
            {showHeatmap &&
              heatmapType === 'grid' &&
              gridHeatmapData.map((cell, idx) => {
                const maxCount = Math.max(...gridHeatmapData.map((c) => c.count), 1);
                const ratio = cell.count / maxCount;

                // Color gradient based on intensity (low to high)
                let fillColor: string;
                let strokeColor: string;

                if (ratio < 0.2) {
                  // Very Low - Light green
                  fillColor = `rgba(144, 238, 144, 0.4)`; // Light green
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
                const radius = baseRadius + ratio * 200; // 600-800m

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
            {showHeatmap &&
              heatmapType === 'bubble' &&
              bubbleData.map((bubble, idx) => {
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

            {/* Markers: cluster crimes by location only */}
            {showMarkers &&
              clusters.map((cluster, idx) => {
                const total = cluster.items.length;

                // Not expanded - show single marker for the location
                // Use mixed color if multiple categories, or single category color
                let markerColor: string;
                if (cluster.isMixed) {
                  markerColor = '#9333ea'; // Purple for mixed reports
                } else {
                  const singleCategory = Array.from(cluster.categories)[0];
                  markerColor = getCrimeColor(singleCategory);
                }

                const markerKey = cluster.locationKey;

                // Single crime
                if (total === 1) {
                  const crime = cluster.items[0];
                  return (
                    <Marker
                      key={`marker-${markerKey}`}
                      coordinate={{ latitude: cluster.lat, longitude: cluster.lon }}
                      onPress={() => {
                        setSelectedCrime(crime);
                        setSelectedCluster(null);
                        setSelectedReportId(null);
                        setSelectedReportCluster(null);
                      }}
                      zIndex={3}>
                      <View style={[styles.markerContainer, { backgroundColor: markerColor }]} />
                    </Marker>
                  );
                }

                // Multiple crimes - show cluster with count, clicking shows breakdown
                return (
                  <Marker
                    key={`marker-${markerKey}`}
                    coordinate={{ latitude: cluster.lat, longitude: cluster.lon }}
                    onPress={() => {
                      setSelectedCrime(null);
                      setSelectedCluster(cluster.items);
                      setSelectedReportId(null);
                      setSelectedReportCluster(null);
                      setActiveClusterTab('all');
                    }}
                    zIndex={3}>
                    <View style={[styles.clusterContainer, { backgroundColor: markerColor }]}>
                      <Text style={styles.clusterText}>{total}</Text>
                    </View>
                  </Marker>
                );
              })}

            {/* Report Markers - Clustered resolved reports */}
            {showReports &&
              reportClusters.map((cluster, idx) => {
                const total = cluster.items.length;
                const markerColor = '#FF6B35';
                const markerKey = cluster.locationKey;
                if (!Number.isFinite(cluster.lat) || !Number.isFinite(cluster.lon)) {
                  return null;
                }

                // Single report
                if (total === 1) {
                  const report = cluster.items[0];
                  if (!Number.isFinite(report.latitude) || !Number.isFinite(report.longitude)) {
                    return null;
                  }
                  return (
                    <Marker
                      key={`report-marker-${markerKey}`}
                      coordinate={{ latitude: cluster.lat, longitude: cluster.lon }}
                      onPress={() => {
                        setSelectedCrime(null);
                        setSelectedCluster(null);
                        setSelectedReportId(report.id);
                        setSelectedReportCluster(null);
                      }}
                      zIndex={3}>
                      <View
                        style={[styles.reportMarkerContainer, { backgroundColor: markerColor }]}
                      />
                    </Marker>
                  );
                }

                // Multiple reports - show cluster with count
                return (
                  <Marker
                    key={`report-marker-${markerKey}`}
                    coordinate={{ latitude: cluster.lat, longitude: cluster.lon }}
                    onPress={() => {
                      setSelectedCrime(null);
                      setSelectedCluster(null);
                      setSelectedReportId(null);
                      setSelectedReportCluster(cluster.items);
                    }}
                    zIndex={3}>
                    <View style={[styles.clusterContainer, { backgroundColor: markerColor }]}>
                      <Text style={styles.clusterText}>{total}</Text>
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
            style={{ backgroundColor: colors.card, maxHeight: '80%' }}>
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
                Crime Categories
              </Text>

              {/* All Crimes */}
              <TouchableOpacity
                className="mb-2 flex-row items-center rounded-lg p-3"
                style={{
                  backgroundColor:
                    filterCategory === 'all' ? colors.primary + '20' : colors.background,
                }}
                onPress={() => {
                  setFilterCategory('all');
                  setFilterSubcategory(null);
                }}>
                <MapPinned size={20} color={colors.text} />
                <Text className="ml-2 flex-1 font-medium" style={{ color: colors.text }}>
                  All Crimes
                </Text>
                <Text className="font-bold" style={{ color: colors.primary }}>
                  {crimeStats.total}
                </Text>
              </TouchableOpacity>

              {/* Violent Crimes */}
              <View className="mb-2">
                <TouchableOpacity
                  className="flex-row items-center rounded-lg p-3"
                  style={{
                    backgroundColor: filterCategory === 'violent' ? '#DC262620' : colors.background,
                  }}
                  onPress={() => {
                    setFilterCategory('violent');
                    setFilterSubcategory(null);
                    toggleCategory('violent');
                  }}>
                  <AlertTriangle size={20} color="#DC2626" />
                  <Text className="ml-2 flex-1 font-medium" style={{ color: colors.text }}>
                    Violent Crimes
                  </Text>
                  <Text className="mr-2 font-bold" style={{ color: '#DC2626' }}>
                    {crimeStats.violent}
                  </Text>
                  <Text style={{ color: colors.textSecondary }}>
                    {expandedCategories.has('violent') ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>
                {expandedCategories.has('violent') && (
                  <View
                    className="ml-4 mt-1"
                    style={{
                      backgroundColor: colors.background,
                      borderLeftWidth: 2,
                      borderLeftColor: '#DC2626',
                    }}>
                    {getSubcategories('violent').map((subcategory, idx) => (
                      <TouchableOpacity
                        key={idx}
                        className="rounded px-3 py-2"
                        style={{
                          backgroundColor:
                            filterSubcategory === subcategory ? '#DC262610' : 'transparent',
                        }}
                        onPress={() => {
                          if (filterSubcategory === subcategory) {
                            setFilterSubcategory(null);
                          } else {
                            setFilterCategory('violent');
                            setFilterSubcategory(subcategory);
                          }
                        }}>
                        <Text
                          className="text-xs"
                          style={{
                            color:
                              filterSubcategory === subcategory ? '#DC2626' : colors.textSecondary,
                            fontWeight: filterSubcategory === subcategory ? 'bold' : 'normal',
                          }}>
                          • {subcategory} (
                          {dateFilteredCrimes.filter((c) => c.incidentType === subcategory).length})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Property Crimes */}
              <View className="mb-2">
                <TouchableOpacity
                  className="flex-row items-center rounded-lg p-3"
                  style={{
                    backgroundColor:
                      filterCategory === 'property' ? '#F59E0B20' : colors.background,
                  }}
                  onPress={() => {
                    setFilterCategory('property');
                    setFilterSubcategory(null);
                    toggleCategory('property');
                  }}>
                  <ShoppingBag size={20} color="#F59E0B" />
                  <Text className="ml-2 flex-1 font-medium" style={{ color: colors.text }}>
                    Property Crimes
                  </Text>
                  <Text className="mr-2 font-bold" style={{ color: '#F59E0B' }}>
                    {crimeStats.property}
                  </Text>
                  <Text style={{ color: colors.textSecondary }}>
                    {expandedCategories.has('property') ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>
                {expandedCategories.has('property') && (
                  <View
                    className="ml-4 mt-1"
                    style={{
                      backgroundColor: colors.background,
                      borderLeftWidth: 2,
                      borderLeftColor: '#F59E0B',
                    }}>
                    {getSubcategories('property').map((subcategory, idx) => (
                      <TouchableOpacity
                        key={idx}
                        className="rounded px-3 py-2"
                        style={{
                          backgroundColor:
                            filterSubcategory === subcategory ? '#F59E0B10' : 'transparent',
                        }}
                        onPress={() => {
                          if (filterSubcategory === subcategory) {
                            setFilterSubcategory(null);
                          } else {
                            setFilterCategory('property');
                            setFilterSubcategory(subcategory);
                          }
                        }}>
                        <Text
                          className="text-xs"
                          style={{
                            color:
                              filterSubcategory === subcategory ? '#F59E0B' : colors.textSecondary,
                            fontWeight: filterSubcategory === subcategory ? 'bold' : 'normal',
                          }}>
                          • {subcategory} (
                          {dateFilteredCrimes.filter((c) => c.incidentType === subcategory).length})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Drug-Related */}
              <View className="mb-2">
                <TouchableOpacity
                  className="flex-row items-center rounded-lg p-3"
                  style={{
                    backgroundColor: filterCategory === 'drug' ? '#7C3AED20' : colors.background,
                  }}
                  onPress={() => {
                    setFilterCategory('drug');
                    setFilterSubcategory(null);
                    toggleCategory('drug');
                  }}>
                  <Activity size={20} color="#7C3AED" />
                  <Text className="ml-2 flex-1 font-medium" style={{ color: colors.text }}>
                    Drug-Related
                  </Text>
                  <Text className="mr-2 font-bold" style={{ color: '#7C3AED' }}>
                    {crimeStats.drug}
                  </Text>
                  <Text style={{ color: colors.textSecondary }}>
                    {expandedCategories.has('drug') ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>
                {expandedCategories.has('drug') && (
                  <View
                    className="ml-4 mt-1"
                    style={{
                      backgroundColor: colors.background,
                      borderLeftWidth: 2,
                      borderLeftColor: '#7C3AED',
                    }}>
                    {getSubcategories('drug').map((subcategory, idx) => (
                      <TouchableOpacity
                        key={idx}
                        className="rounded px-3 py-2"
                        style={{
                          backgroundColor:
                            filterSubcategory === subcategory ? '#7C3AED10' : 'transparent',
                        }}
                        onPress={() => {
                          if (filterSubcategory === subcategory) {
                            setFilterSubcategory(null);
                          } else {
                            setFilterCategory('drug');
                            setFilterSubcategory(subcategory);
                          }
                        }}>
                        <Text
                          className="text-xs"
                          style={{
                            color:
                              filterSubcategory === subcategory ? '#7C3AED' : colors.textSecondary,
                            fontWeight: filterSubcategory === subcategory ? 'bold' : 'normal',
                          }}>
                          • {subcategory} (
                          {dateFilteredCrimes.filter((c) => c.incidentType === subcategory).length})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Traffic Incidents */}
              <View className="mb-2">
                <TouchableOpacity
                  className="flex-row items-center rounded-lg p-3"
                  style={{
                    backgroundColor: filterCategory === 'traffic' ? '#3B82F620' : colors.background,
                  }}
                  onPress={() => {
                    setFilterCategory('traffic');
                    setFilterSubcategory(null);
                    toggleCategory('traffic');
                  }}>
                  <Car size={20} color="#3B82F6" />
                  <Text className="ml-2 flex-1 font-medium" style={{ color: colors.text }}>
                    Traffic Incidents
                  </Text>
                  <Text className="mr-2 font-bold" style={{ color: '#3B82F6' }}>
                    {crimeStats.traffic}
                  </Text>
                  <Text style={{ color: colors.textSecondary }}>
                    {expandedCategories.has('traffic') ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>
                {expandedCategories.has('traffic') && (
                  <View
                    className="ml-4 mt-1"
                    style={{
                      backgroundColor: colors.background,
                      borderLeftWidth: 2,
                      borderLeftColor: '#3B82F6',
                    }}>
                    {getSubcategories('traffic').map((subcategory, idx) => (
                      <TouchableOpacity
                        key={idx}
                        className="rounded px-3 py-2"
                        style={{
                          backgroundColor:
                            filterSubcategory === subcategory ? '#3B82F610' : 'transparent',
                        }}
                        onPress={() => {
                          if (filterSubcategory === subcategory) {
                            setFilterSubcategory(null);
                          } else {
                            setFilterCategory('traffic');
                            setFilterSubcategory(subcategory);
                          }
                        }}>
                        <Text
                          className="text-xs"
                          style={{
                            color:
                              filterSubcategory === subcategory ? '#3B82F6' : colors.textSecondary,
                            fontWeight: filterSubcategory === subcategory ? 'bold' : 'normal',
                          }}>
                          • {subcategory} (
                          {dateFilteredCrimes.filter((c) => c.incidentType === subcategory).length})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Police Operations */}
              <View className="mb-2">
                <TouchableOpacity
                  className="flex-row items-center rounded-lg p-3"
                  style={{
                    backgroundColor:
                      filterCategory === 'operation' ? '#10B98120' : colors.background,
                  }}
                  onPress={() => {
                    setFilterCategory('operation');
                    setFilterSubcategory(null);
                    toggleCategory('operation');
                  }}>
                  <MapPinned size={20} color="#10B981" />
                  <Text className="ml-2 flex-1 font-medium" style={{ color: colors.text }}>
                    Police Operations
                  </Text>
                  <Text className="mr-2 font-bold" style={{ color: '#10B981' }}>
                    {crimeStats.operation}
                  </Text>
                  <Text style={{ color: colors.textSecondary }}>
                    {expandedCategories.has('operation') ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>
                {expandedCategories.has('operation') && (
                  <View
                    className="ml-4 mt-1"
                    style={{
                      backgroundColor: colors.background,
                      borderLeftWidth: 2,
                      borderLeftColor: '#10B981',
                    }}>
                    {getSubcategories('operation').map((subcategory, idx) => (
                      <TouchableOpacity
                        key={idx}
                        className="rounded px-3 py-2"
                        style={{
                          backgroundColor:
                            filterSubcategory === subcategory ? '#10B98110' : 'transparent',
                        }}
                        onPress={() => {
                          if (filterSubcategory === subcategory) {
                            setFilterSubcategory(null);
                          } else {
                            setFilterCategory('operation');
                            setFilterSubcategory(subcategory);
                          }
                        }}>
                        <Text
                          className="text-xs"
                          style={{
                            color:
                              filterSubcategory === subcategory ? '#10B981' : colors.textSecondary,
                            fontWeight: filterSubcategory === subcategory ? 'bold' : 'normal',
                          }}>
                          • {subcategory} (
                          {dateFilteredCrimes.filter((c) => c.incidentType === subcategory).length})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Other Crimes */}
              <View className="mb-2">
                <TouchableOpacity
                  className="flex-row items-center rounded-lg p-3"
                  style={{
                    backgroundColor: filterCategory === 'other' ? '#6B728020' : colors.background,
                  }}
                  onPress={() => {
                    setFilterCategory('other');
                    setFilterSubcategory(null);
                    toggleCategory('other');
                  }}>
                  <Users size={20} color="#6B7280" />
                  <Text className="ml-2 flex-1 font-medium" style={{ color: colors.text }}>
                    Other Crimes
                  </Text>
                  <Text className="mr-2 font-bold" style={{ color: '#6B7280' }}>
                    {crimeStats.other}
                  </Text>
                  <Text style={{ color: colors.textSecondary }}>
                    {expandedCategories.has('other') ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>
                {expandedCategories.has('other') && (
                  <View
                    className="ml-4 mt-1"
                    style={{
                      backgroundColor: colors.background,
                      borderLeftWidth: 2,
                      borderLeftColor: '#6B7280',
                    }}>
                    {getSubcategories('other').map((subcategory, idx) => (
                      <TouchableOpacity
                        key={idx}
                        className="rounded px-3 py-2"
                        style={{
                          backgroundColor:
                            filterSubcategory === subcategory ? '#6B728010' : 'transparent',
                        }}
                        onPress={() => {
                          if (filterSubcategory === subcategory) {
                            setFilterSubcategory(null);
                          } else {
                            setFilterCategory('other');
                            setFilterSubcategory(subcategory);
                          }
                        }}>
                        <Text
                          className="text-xs"
                          style={{
                            color:
                              filterSubcategory === subcategory ? '#6B7280' : colors.textSecondary,
                            fontWeight: filterSubcategory === subcategory ? 'bold' : 'normal',
                          }}>
                          • {subcategory} (
                          {dateFilteredCrimes.filter((c) => c.incidentType === subcategory).length})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Date Range Filter */}
              <View className="mt-4 border-t pt-4" style={{ borderColor: colors.border }}>
                <Text
                  className="mb-2 text-sm font-semibold"
                  style={{ color: colors.textSecondary }}>
                  Date Range
                </Text>

                {/* Quick Date Presets */}
                <View className="mb-3 flex-row flex-wrap gap-2">
                  <TouchableOpacity
                    className="rounded-full px-3 py-1.5"
                    style={{ backgroundColor: colors.background }}
                    onPress={() => {
                      const today = new Date();
                      setFilterStartDate(today);
                      setFilterEndDate(today);
                    }}>
                    <Text className="text-xs" style={{ color: colors.text }}>
                      Today
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="rounded-full px-3 py-1.5"
                    style={{ backgroundColor: colors.background }}
                    onPress={() => {
                      const today = new Date();
                      const weekAgo = new Date(today);
                      weekAgo.setDate(today.getDate() - 7);
                      setFilterStartDate(weekAgo);
                      setFilterEndDate(today);
                    }}>
                    <Text className="text-xs" style={{ color: colors.text }}>
                      Last 7 Days
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="rounded-full px-3 py-1.5"
                    style={{ backgroundColor: colors.background }}
                    onPress={() => {
                      const today = new Date();
                      const monthAgo = new Date(today);
                      monthAgo.setMonth(today.getMonth() - 1);
                      setFilterStartDate(monthAgo);
                      setFilterEndDate(today);
                    }}>
                    <Text className="text-xs" style={{ color: colors.text }}>
                      Last 30 Days
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="rounded-full px-3 py-1.5"
                    style={{ backgroundColor: colors.background }}
                    onPress={() => {
                      const today = new Date();
                      const yearAgo = new Date(today);
                      yearAgo.setFullYear(today.getFullYear() - 1);
                      setFilterStartDate(yearAgo);
                      setFilterEndDate(today);
                    }}>
                    <Text className="text-xs" style={{ color: colors.text }}>
                      Last Year
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="mb-3">
                  <Text className="mb-1 text-xs" style={{ color: colors.textSecondary }}>
                    Start Date
                  </Text>
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      className="flex-1 rounded-lg p-3"
                      style={{ backgroundColor: colors.background }}
                      onPress={() => setShowStartDatePicker(true)}>
                      <View className="flex-row items-center justify-between">
                        <Text style={{ color: colors.text }}>
                          {filterStartDate
                            ? filterStartDate.toLocaleDateString()
                            : 'Select start date'}
                        </Text>
                        <Calendar size={18} color={colors.textSecondary} />
                      </View>
                    </TouchableOpacity>
                    {filterStartDate && (
                      <TouchableOpacity
                        className="ml-2 p-2"
                        onPress={() => setFilterStartDate(null)}>
                        <X size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View className="mb-2">
                  <Text className="mb-1 text-xs" style={{ color: colors.textSecondary }}>
                    End Date
                  </Text>
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      className="flex-1 rounded-lg p-3"
                      style={{ backgroundColor: colors.background }}
                      onPress={() => setShowEndDatePicker(true)}>
                      <View className="flex-row items-center justify-between">
                        <Text style={{ color: colors.text }}>
                          {filterEndDate ? filterEndDate.toLocaleDateString() : 'Select end date'}
                        </Text>
                        <Calendar size={18} color={colors.textSecondary} />
                      </View>
                    </TouchableOpacity>
                    {filterEndDate && (
                      <TouchableOpacity className="ml-2 p-2" onPress={() => setFilterEndDate(null)}>
                        <X size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {(filterStartDate || filterEndDate) && (
                  <TouchableOpacity
                    className="mt-2 rounded-lg p-2"
                    style={{ backgroundColor: colors.primary + '20' }}
                    onPress={() => {
                      setFilterStartDate(null);
                      setFilterEndDate(null);
                    }}>
                    <Text
                      className="text-center text-xs font-medium"
                      style={{ color: colors.primary }}>
                      Clear Date Filters
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Map Type Selection */}
              <View className="mt-4 border-t pt-4" style={{ borderColor: colors.border }}>
                <Text
                  className="mb-2 text-sm font-semibold"
                  style={{ color: colors.textSecondary }}>
                  Map Type
                </Text>

                <View className="flex-row flex-wrap gap-2">
                  <TouchableOpacity
                    className="mb-2 min-w-[45%] flex-1 rounded-lg p-3"
                    style={{
                      backgroundColor:
                        mapType === 'standard' ? colors.primary + '20' : colors.background,
                    }}
                    onPress={() => setMapType('standard')}>
                    <Text
                      className="text-center font-medium"
                      style={{ color: mapType === 'standard' ? colors.primary : colors.text }}>
                      Standard
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="mb-2 min-w-[45%] flex-1 rounded-lg p-3"
                    style={{
                      backgroundColor:
                        mapType === 'satellite' ? colors.primary + '20' : colors.background,
                    }}
                    onPress={() => setMapType('satellite')}>
                    <Text
                      className="text-center font-medium"
                      style={{ color: mapType === 'satellite' ? colors.primary : colors.text }}>
                      Satellite
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="mb-2 min-w-[45%] flex-1 rounded-lg p-3"
                    style={{
                      backgroundColor:
                        mapType === 'hybrid' ? colors.primary + '20' : colors.background,
                    }}
                    onPress={() => setMapType('hybrid')}>
                    <Text
                      className="text-center font-medium"
                      style={{ color: mapType === 'hybrid' ? colors.primary : colors.text }}>
                      Hybrid
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="mb-2 min-w-[45%] flex-1 rounded-lg p-3"
                    style={{
                      backgroundColor:
                        mapType === 'terrain' ? colors.primary + '20' : colors.background,
                    }}
                    onPress={() => setMapType('terrain')}>
                    <Text
                      className="text-center font-medium"
                      style={{ color: mapType === 'terrain' ? colors.primary : colors.text }}>
                      Terrain
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Heatmap Type Selection */}
              <View className="mt-4 border-t pt-4" style={{ borderColor: colors.border }}>
                <Text
                  className="mb-2 text-sm font-semibold"
                  style={{ color: colors.textSecondary }}>
                  Heatmap Visualization
                </Text>

                <TouchableOpacity
                  className="mb-2 flex-row items-center rounded-lg p-3"
                  style={{
                    backgroundColor:
                      heatmapType === 'density' ? colors.primary + '20' : colors.background,
                  }}
                  onPress={() => setHeatmapType('density')}>
                  <Radar
                    size={20}
                    color={heatmapType === 'density' ? colors.primary : colors.textSecondary}
                  />
                  <View className="ml-3 flex-1">
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
                  style={{
                    backgroundColor:
                      heatmapType === 'choropleth' ? colors.primary + '20' : colors.background,
                  }}
                  onPress={() => setHeatmapType('choropleth')}>
                  <Layers
                    size={20}
                    color={heatmapType === 'choropleth' ? colors.primary : colors.textSecondary}
                  />
                  <View className="ml-3 flex-1">
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
                  style={{
                    backgroundColor:
                      heatmapType === 'graduated' ? colors.primary + '20' : colors.background,
                  }}
                  onPress={() => setHeatmapType('graduated')}>
                  <MapPinned
                    size={20}
                    color={heatmapType === 'graduated' ? colors.primary : colors.textSecondary}
                  />
                  <View className="ml-3 flex-1">
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
                  style={{
                    backgroundColor:
                      heatmapType === 'grid' ? colors.primary + '20' : colors.background,
                  }}
                  onPress={() => setHeatmapType('grid')}>
                  <Grid3x3
                    size={20}
                    color={heatmapType === 'grid' ? colors.primary : colors.textSecondary}
                  />
                  <View className="ml-3 flex-1">
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
                  style={{
                    backgroundColor:
                      heatmapType === 'bubble' ? colors.primary + '20' : colors.background,
                  }}
                  onPress={() => setHeatmapType('bubble')}>
                  <Activity
                    size={20}
                    color={heatmapType === 'bubble' ? colors.primary : colors.textSecondary}
                  />
                  <View className="ml-3 flex-1">
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
                <Text
                  className="mb-2 text-sm font-semibold"
                  style={{ color: colors.textSecondary }}>
                  Display Options
                </Text>

                <TouchableOpacity
                  className="mb-2 flex-row items-center justify-between rounded-lg p-3"
                  style={{ backgroundColor: colors.background }}
                  onPress={() => setShowHeatmap(!showHeatmap)}>
                  <Text className="font-medium" style={{ color: colors.text }}>
                    Show Heatmap
                  </Text>
                  <View
                    className="h-6 w-11 rounded-full p-1"
                    style={{ backgroundColor: showHeatmap ? colors.primary : colors.border }}>
                    <View
                      className="h-4 w-4 rounded-full bg-white"
                      style={{
                        transform: [{ translateX: showHeatmap ? 20 : 0 }],
                      }}
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center justify-between rounded-lg p-3"
                  style={{ backgroundColor: colors.background }}
                  onPress={() => setShowMarkers(!showMarkers)}>
                  <Text className="font-medium" style={{ color: colors.text }}>
                    Show Markers
                  </Text>
                  <View
                    className="h-6 w-11 rounded-full p-1"
                    style={{ backgroundColor: showMarkers ? colors.primary : colors.border }}>
                    <View
                      className="h-4 w-4 rounded-full bg-white"
                      style={{
                        transform: [{ translateX: showMarkers ? 20 : 0 }],
                      }}
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className="mb-2 flex-row items-center justify-between rounded-lg p-3"
                  style={{ backgroundColor: colors.background }}
                  onPress={() => setShowReports(!showReports)}>
                  <Text className="font-medium" style={{ color: colors.text }}>
                    Show Reports
                  </Text>
                  <View
                    className="h-6 w-11 rounded-full p-1"
                    style={{ backgroundColor: showReports ? '#FF6B35' : colors.border }}>
                    <View
                      className="h-4 w-4 rounded-full bg-white"
                      style={{
                        transform: [{ translateX: showReports ? 20 : 0 }],
                      }}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}

        {/* Crime Details Card */}
        {selectedCrime && !showFilters && !selectedCluster && !selectedReport && (
          <View
            className="absolute bottom-24 left-4 right-4 rounded-xl p-4 shadow-2xl"
            style={{ backgroundColor: colors.card }}>
            <View className="mb-3 flex-row items-start justify-between">
              <View className="flex-1">
                <View
                  className="mb-2 self-start rounded-full px-3 py-1"
                  style={{
                    backgroundColor: getCrimeColor(getCrimeCategory(selectedCrime)) + '20',
                  }}>
                  <Text
                    className="text-xs font-bold uppercase"
                    style={{ color: getCrimeColor(getCrimeCategory(selectedCrime)) }}>
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
              <Text
                className="text-xs font-semibold uppercase"
                style={{ color: colors.textSecondary }}>
                Offense
              </Text>
              <Text className="mt-1 text-sm" style={{ color: colors.text }}>
                {selectedCrime.offense}
              </Text>
            </View>
          </View>
        )}

        {/* User Report Details Card */}
        {selectedReport &&
          !showFilters &&
          !selectedCluster &&
          !selectedCrime &&
          !selectedReportCluster && (
            <View
              className="absolute bottom-24 left-4 right-4 rounded-xl p-4 shadow-2xl"
              style={{ backgroundColor: colors.card, maxHeight: '70%' }}>
              <View className="mb-3 flex-row items-start justify-between">
                <View className="flex-1">
                  <View
                    className="mb-2 self-start rounded-full px-3 py-1"
                    style={{ backgroundColor: '#FF6B35' + '20' }}>
                    <Text className="text-xs font-bold uppercase" style={{ color: '#FF6B35' }}>
                      User Report
                    </Text>
                  </View>
                  <Text className="text-lg font-bold" style={{ color: colors.text }}>
                    {selectedReportTitle}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedReportId(null)}>
                  <XCircle size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                <View className="space-y-2">
                  {selectedReportCategoryLabel && (
                    <View className="flex-row items-center">
                      <AlertTriangle size={16} color={colors.textSecondary} />
                      <Text className="ml-2 text-sm font-semibold" style={{ color: colors.text }}>
                        Category: {selectedReportCategoryLabel}
                        {selectedReportSubcategoryLabel && ` - ${selectedReportSubcategoryLabel}`}
                      </Text>
                    </View>
                  )}

                  {(selectedReport.street_address || selectedReport.nearby_landmark) && (
                    <View className="flex-row items-start">
                      <MapPin size={16} color={colors.textSecondary} style={{ marginTop: 2 }} />
                      <View className="ml-2 flex-1">
                        {selectedReport.street_address && (
                          <Text className="text-sm" style={{ color: colors.textSecondary }}>
                            {selectedReport.street_address}
                          </Text>
                        )}
                        {selectedReport.nearby_landmark && (
                          <Text className="text-sm" style={{ color: colors.textSecondary }}>
                            Near: {selectedReport.nearby_landmark}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}

                  {(selectedReport.incident_date || selectedReport.incident_time) && (
                    <View className="flex-row items-center">
                      <Calendar size={16} color={colors.textSecondary} />
                      <Text className="ml-2 text-sm" style={{ color: colors.textSecondary }}>
                        {selectedReport.incident_date && selectedReport.incident_date}
                        {selectedReport.incident_time && ` at ${selectedReport.incident_time}`}
                      </Text>
                    </View>
                  )}
                </View>

                {selectedReport.what_happened && (
                  <View
                    className="mt-3 rounded-lg p-3"
                    style={{ backgroundColor: colors.background }}>
                    <Text
                      className="text-xs font-semibold uppercase"
                      style={{ color: colors.textSecondary }}>
                      Description
                    </Text>
                    <Text className="mt-1 text-sm" style={{ color: colors.text }}>
                      {selectedReport.what_happened}
                    </Text>
                  </View>
                )}

                {selectedReport.who_was_involved && (
                  <View
                    className="mt-2 rounded-lg p-3"
                    style={{ backgroundColor: colors.background }}>
                    <Text
                      className="text-xs font-semibold uppercase"
                      style={{ color: colors.textSecondary }}>
                      People Involved
                    </Text>
                    <Text className="mt-1 text-sm" style={{ color: colors.text }}>
                      {selectedReport.who_was_involved}
                    </Text>
                  </View>
                )}

                {selectedReport.suspect_description && (
                  <View
                    className="mt-2 rounded-lg p-3"
                    style={{ backgroundColor: colors.background }}>
                    <Text
                      className="text-xs font-semibold uppercase"
                      style={{ color: colors.textSecondary }}>
                      Suspect Description
                    </Text>
                    <Text className="mt-1 text-sm" style={{ color: colors.text }}>
                      {selectedReport.suspect_description}
                    </Text>
                  </View>
                )}

                {(selectedReport.number_of_witnesses ||
                  selectedReport.injuries_reported ||
                  selectedReport.property_damage) && (
                  <View
                    className="mt-2 rounded-lg p-3"
                    style={{ backgroundColor: colors.background }}>
                    <Text
                      className="mb-2 text-xs font-semibold uppercase"
                      style={{ color: colors.textSecondary }}>
                      Additional Details
                    </Text>
                    {selectedReport.number_of_witnesses && (
                      <Text className="mb-1 text-sm" style={{ color: colors.text }}>
                        • Witnesses: {selectedReport.number_of_witnesses}
                      </Text>
                    )}
                    {selectedReport.injuries_reported && (
                      <Text className="mb-1 text-sm" style={{ color: colors.text }}>
                        • Injuries: {selectedReport.injuries_reported}
                      </Text>
                    )}
                    {selectedReport.property_damage && (
                      <Text className="text-sm" style={{ color: colors.text }}>
                        • Property Damage: {selectedReport.property_damage}
                      </Text>
                    )}
                  </View>
                )}
              </ScrollView>
            </View>
          )}

        {/* Report Cluster Details Card */}
        {selectedReportCluster && !showFilters && (
          <View
            className="absolute bottom-24 left-4 right-4 rounded-xl p-4 shadow-2xl"
            style={{ backgroundColor: colors.card, maxHeight: '70%' }}>
            <View className="mb-3 flex-row items-start justify-between">
              <View style={{ flex: 1, marginRight: 12 }}>
                <View
                  className="mb-2 self-start rounded-full px-3 py-1"
                  style={{ backgroundColor: '#FF6B35' + '20' }}>
                  <Text className="text-xs font-bold uppercase" style={{ color: '#FF6B35' }}>
                    User Reports
                  </Text>
                </View>
                <Text className="text-lg font-bold" style={{ color: colors.text }}>
                  {selectedReportCluster.length} Report{selectedReportCluster.length > 1 ? 's' : ''}{' '}
                  at this location
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedReportCluster(null)}
                style={{ marginTop: 2 }}>
                <XCircle size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              {selectedReportCluster.map((report, idx) => {
                const categoryLabel = report.categoryName ?? report.incident_category ?? null;
                const subCategoryLabel =
                  report.subCategoryName ?? report.incident_subcategory ?? null;
                const reportTitle = report.incident_title ?? categoryLabel ?? 'Incident Report';

                return (
                  <TouchableOpacity
                    key={report.id}
                    className="mb-3 rounded-lg p-3"
                    style={{ backgroundColor: colors.background }}
                    onPress={() => {
                      setSelectedReportCluster(null);
                      setSelectedReportId(report.id);
                    }}>
                    <View className="mb-2 flex-row items-start justify-between">
                      <Text className="flex-1 font-bold" style={{ color: colors.text }}>
                        {reportTitle}
                      </Text>
                    </View>

                    {categoryLabel && (
                      <View className="mb-2 flex-row items-center">
                        <AlertTriangle size={14} color={colors.textSecondary} />
                        <Text className="ml-2 text-xs" style={{ color: colors.textSecondary }}>
                          {categoryLabel}
                          {subCategoryLabel && ` - ${subCategoryLabel}`}
                        </Text>
                      </View>
                    )}

                    {(report.incident_date || report.incident_time) && (
                      <View className="mb-1 flex-row items-center">
                        <Calendar size={14} color={colors.textSecondary} />
                        <Text className="ml-2 text-xs" style={{ color: colors.textSecondary }}>
                          {report.incident_date && report.incident_date}
                          {report.incident_time && ` at ${report.incident_time}`}
                        </Text>
                      </View>
                    )}

                    {report.street_address && (
                      <View className="flex-row items-start">
                        <MapPin size={14} color={colors.textSecondary} style={{ marginTop: 2 }} />
                        <Text
                          className="ml-2 flex-1 text-xs"
                          style={{ color: colors.textSecondary }}>
                          {report.street_address}
                        </Text>
                      </View>
                    )}

                    {report.what_happened && (
                      <Text
                        className="mt-2 text-xs"
                        style={{ color: colors.text }}
                        numberOfLines={2}>
                        {report.what_happened}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Cluster Details Card with Category Breakdown */}
        {selectedCluster && !showFilters && (
          <View
            className="absolute bottom-24 left-4 right-4 rounded-xl p-4 shadow-2xl"
            style={{ backgroundColor: colors.card, maxHeight: '70%' }}>
            <View className="mb-3 flex-row items-start justify-between">
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text className="text-lg font-bold" style={{ color: colors.text }}>
                  {selectedCluster.length} Incident{selectedCluster.length > 1 ? 's' : ''} at this
                  location
                </Text>
                {/* Category Summary - Scrollable horizontally if too many */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mt-2"
                  style={{ maxWidth: '100%' }}>
                  {(() => {
                    const categoryCounts: Record<CrimeCategory, number> = {
                      violent: 0,
                      property: 0,
                      drug: 0,
                      traffic: 0,
                      operation: 0,
                      other: 0,
                    };
                    selectedCluster.forEach((crime) => {
                      const cat = getCrimeCategory(crime);
                      categoryCounts[cat]++;
                    });
                    return (Object.keys(categoryCounts) as CrimeCategory[])
                      .filter((cat) => categoryCounts[cat] > 0)
                      .map((cat) => (
                        <View
                          key={cat}
                          className="mr-2 rounded-full px-3 py-1"
                          style={{ backgroundColor: getCrimeColor(cat) + '20' }}>
                          <Text
                            className="text-xs font-semibold"
                            style={{ color: getCrimeColor(cat) }}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}: {categoryCounts[cat]}
                          </Text>
                        </View>
                      ));
                  })()}
                </ScrollView>
              </View>
              <TouchableOpacity onPress={() => setSelectedCluster(null)} style={{ marginTop: 2 }}>
                <XCircle size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3"
              contentContainerStyle={{ paddingRight: 16 }}>
              {(() => {
                // Show all tabs when filterCategory is 'all', otherwise show only 'all' and current category
                const tabsToShow =
                  filterCategory === 'all'
                    ? (['all', 'violent', 'property', 'drug', 'traffic', 'other'] as const)
                    : (['all', filterCategory] as const);

                const tabsWithCounts = tabsToShow
                  .map((tab) => {
                    const label =
                      tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1);
                    const count =
                      tab === 'all'
                        ? selectedCluster.length
                        : selectedCluster.filter((c) => getCrimeCategory(c) === tab).length;
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
                      style={{
                        backgroundColor: active ? colors.primary + '20' : colors.background,
                        borderWidth: 1,
                        borderColor: active ? colors.primary : colors.border,
                      }}
                      onPress={() => setActiveClusterTab(tab)}>
                      <Text
                        style={{
                          color: active ? colors.primary : colors.textSecondary,
                          fontWeight: '600',
                        }}>
                        {label} ({count})
                      </Text>
                    </TouchableOpacity>
                  );
                });
              })()}
            </ScrollView>

            {/* List grouped by subcategory (incident type) */}
            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              {(() => {
                const filteredCrimes =
                  activeClusterTab === 'all'
                    ? selectedCluster
                    : selectedCluster.filter((c) => getCrimeCategory(c) === activeClusterTab);

                // Group by incident type (subcategory)
                const grouped: Record<string, CrimeData[]> = {};
                filteredCrimes.forEach((crime) => {
                  if (!grouped[crime.incidentType]) {
                    grouped[crime.incidentType] = [];
                  }
                  grouped[crime.incidentType].push(crime);
                });

                return Object.entries(grouped).map(([incidentType, crimes]) => {
                  const category = getCrimeCategory(crimes[0]);
                  const color = getCrimeColor(category);

                  return (
                    <View key={incidentType} className="mb-3">
                      <View
                        className="mb-2"
                        style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            marginRight: 8,
                          }}>
                          <View
                            style={{
                              width: 4,
                              height: 16,
                              borderRadius: 2,
                              backgroundColor: color,
                              marginRight: 8,
                              marginTop: 2,
                            }}
                          />
                          <View style={{ flex: 1 }}>
                            <Text
                              className="font-bold"
                              style={{ color: colors.text, flexWrap: 'wrap' }}>
                              {incidentType}
                            </Text>
                            <Text
                              className="mt-0.5 text-xs"
                              style={{ color: colors.textSecondary }}>
                              {crimes.length} incident{crimes.length > 1 ? 's' : ''}
                            </Text>
                          </View>
                        </View>
                        <View
                          className="rounded-full px-2 py-0.5"
                          style={{ backgroundColor: color + '20', marginTop: 2 }}>
                          <Text className="text-xs font-semibold" style={{ color }}>
                            {category}
                          </Text>
                        </View>
                      </View>
                      {crimes.map((crime, idx) => (
                        <View
                          key={idx}
                          className="mb-1 ml-4 rounded p-2"
                          style={{ backgroundColor: colors.background }}>
                          <Text className="text-xs" style={{ color: colors.textSecondary }}>
                            {crime.barangay}, {crime.municipal}
                          </Text>
                          <Text className="text-xs" style={{ color: colors.textSecondary }}>
                            {crime.dateCommitted} at {crime.timeCommitted}
                          </Text>
                        </View>
                      ))}
                    </View>
                  );
                });
              })()}
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
              onPress={() => setShowFilters(true)}>
              <Filter size={20} color={colors.primary} />
              <Text className="ml-2 font-semibold" style={{ color: colors.text }}>
                Filters
              </Text>
            </TouchableOpacity>

            {/* Reset Camera Button */}
            <TouchableOpacity
              className="absolute left-4 top-20 flex-row items-center rounded-xl px-4 py-3 shadow-lg"
              style={{ backgroundColor: colors.card }}
              onPress={resetMapRegion}>
              <RotateCcw size={20} color={colors.primary} />
              <Text className="ml-2 font-semibold" style={{ color: colors.text }}>
                Reset View
              </Text>
            </TouchableOpacity>

            {/* Crime Count Badge */}
            <View
              className="absolute right-4 top-4 rounded-xl px-4 py-3 shadow-lg"
              style={{ backgroundColor: colors.card }}>
              <Text
                className="text-xs font-semibold uppercase"
                style={{ color: colors.textSecondary }}>
                Showing
              </Text>
              <Text className="text-lg font-bold" style={{ color: colors.primary }}>
                {filteredCrimes.length}
              </Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                of {crimes.length}
              </Text>
            </View>

            {/* Comprehensive Legend */}
            <TouchableOpacity
              className="absolute right-4 top-32 rounded-xl shadow-lg"
              style={{ backgroundColor: colors.card, maxWidth: width - 100 }}
              onPress={() => setLegendExpanded(!legendExpanded)}
              activeOpacity={0.8}>
              <View className="px-3 py-2">
                <View className="mb-1 flex-row items-center justify-between">
                  <Text
                    className="text-xs font-bold uppercase"
                    style={{ color: colors.textSecondary }}>
                    Legend
                  </Text>
                  <Text className="text-xs" style={{ color: colors.primary }}>
                    {legendExpanded ? '▼' : '▶'}
                  </Text>
                </View>

                {/* Always show current visualization type */}
                <Text className="mb-2 text-xs font-semibold" style={{ color: colors.text }}>
                  {heatmapType === 'density' && '📊 Density Heatmap'}
                  {heatmapType === 'choropleth' && '🗺️ Choropleth (Area) Map'}
                  {heatmapType === 'graduated' && '⭕ Graduated Symbol Map'}
                  {heatmapType === 'grid' && '🔲 Grid-Based Heatmap'}
                  {heatmapType === 'bubble' && '🎯 Bubble Map (Categories)'}
                </Text>

                {legendExpanded && (
                  <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                    {/* Heatmap Visualization Legend */}
                    {showHeatmap && (
                      <>
                        <View className="mb-3 border-b pb-3" style={{ borderColor: colors.border }}>
                          <Text
                            className="mb-1 text-xs font-semibold"
                            style={{ color: colors.textSecondary }}>
                            HEATMAP INTENSITY
                          </Text>

                          {heatmapType === 'density' && (
                            <>
                              <Text
                                className="mb-2 text-xs"
                                style={{ color: colors.textSecondary }}>
                                Color gradient shows crime concentration hotspots
                              </Text>
                              <View className="space-y-1.5">
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-4 w-4 rounded-full"
                                    style={{ backgroundColor: 'rgba(139, 0, 0, 1)' }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    Very High Density
                                  </Text>
                                </View>
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-4 w-4 rounded-full"
                                    style={{ backgroundColor: 'rgba(255, 0, 0, 0.95)' }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    High Density
                                  </Text>
                                </View>
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-4 w-4 rounded-full"
                                    style={{ backgroundColor: 'rgba(255, 165, 0, 0.85)' }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    Medium-High
                                  </Text>
                                </View>
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-4 w-4 rounded-full"
                                    style={{ backgroundColor: 'rgba(255, 255, 0, 0.8)' }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    Medium
                                  </Text>
                                </View>
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-4 w-4 rounded-full"
                                    style={{ backgroundColor: 'rgba(124, 252, 0, 0.7)' }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    Low-Medium
                                  </Text>
                                </View>
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-4 w-4 rounded-full"
                                    style={{ backgroundColor: 'rgba(0, 255, 0, 0.5)' }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    Low Density
                                  </Text>
                                </View>
                              </View>
                            </>
                          )}

                          {heatmapType === 'choropleth' && (
                            <>
                              <Text
                                className="mb-2 text-xs"
                                style={{ color: colors.textSecondary }}>
                                Circle size and color show area crime rates. Based on barangay
                                aggregation.
                              </Text>
                              <View className="space-y-1.5">
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-5 w-5 rounded-full"
                                    style={{ backgroundColor: 'rgba(220, 38, 38, 0.6)' }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    High Rate
                                  </Text>
                                </View>
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-4 w-4 rounded-full"
                                    style={{ backgroundColor: 'rgba(251, 191, 36, 0.6)' }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    Medium Rate
                                  </Text>
                                </View>
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-3 w-3 rounded-full"
                                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.6)' }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    Low Rate
                                  </Text>
                                </View>
                              </View>
                              <Text
                                className="mt-2 text-xs"
                                style={{ color: colors.textSecondary }}>
                                Color based on crime concentration{'\n'}Radius: 400-1000m based on
                                count
                              </Text>
                            </>
                          )}

                          {heatmapType === 'graduated' && (
                            <>
                              <Text
                                className="mb-2 text-xs"
                                style={{ color: colors.textSecondary }}>
                                Circle size represents crime density. Larger = more incidents.
                              </Text>
                              <View className="space-y-1.5">
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-6 w-6 rounded-full"
                                    style={{
                                      backgroundColor: 'rgba(220, 38, 38, 0.5)',
                                      borderWidth: 2,
                                      borderColor: 'rgba(220, 38, 38, 0.9)',
                                    }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    Large (Most incidents)
                                  </Text>
                                </View>
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-5 w-5 rounded-full"
                                    style={{
                                      backgroundColor: 'rgba(220, 38, 38, 0.5)',
                                      borderWidth: 2,
                                      borderColor: 'rgba(220, 38, 38, 0.9)',
                                    }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    Medium
                                  </Text>
                                </View>
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-3 w-3 rounded-full"
                                    style={{
                                      backgroundColor: 'rgba(220, 38, 38, 0.5)',
                                      borderWidth: 2,
                                      borderColor: 'rgba(220, 38, 38, 0.9)',
                                    }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    Small (Fewest incidents)
                                  </Text>
                                </View>
                              </View>
                              <Text
                                className="mt-2 text-xs"
                                style={{ color: colors.textSecondary }}>
                                Size proportional to crime count{'\n'}Radius: 200-1200m
                              </Text>
                            </>
                          )}

                          {heatmapType === 'grid' && (
                            <>
                              <Text
                                className="mb-2 text-xs"
                                style={{ color: colors.textSecondary }}>
                                Geographic grid cells (~600-800m). Color intensity shows crime
                                concentration.
                              </Text>
                              <View className="space-y-1.5">
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-4 w-6 rounded"
                                    style={{ backgroundColor: 'rgba(255, 69, 0, 0.8)' }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    Very High Density
                                  </Text>
                                </View>
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-4 w-6 rounded"
                                    style={{ backgroundColor: 'rgba(255, 215, 0, 0.7)' }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    High Density
                                  </Text>
                                </View>
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-4 w-6 rounded"
                                    style={{ backgroundColor: 'rgba(154, 205, 50, 0.6)' }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    Medium Density
                                  </Text>
                                </View>
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-4 w-6 rounded"
                                    style={{ backgroundColor: 'rgba(0, 255, 0, 0.5)' }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    Low Density
                                  </Text>
                                </View>
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-4 w-6 rounded"
                                    style={{ backgroundColor: 'rgba(144, 238, 144, 0.4)' }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    Very Low Density
                                  </Text>
                                </View>
                              </View>
                              <Text
                                className="mt-2 text-xs"
                                style={{ color: colors.textSecondary }}>
                                Color based on relative crime density
                              </Text>
                            </>
                          )}

                          {heatmapType === 'bubble' && (
                            <>
                              <Text
                                className="mb-2 text-xs"
                                style={{ color: colors.textSecondary }}>
                                Circles grouped by crime category. Size = incident count.
                              </Text>
                              <View className="space-y-1.5">
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-4 w-4 rounded-full"
                                    style={{ backgroundColor: '#DC2626' }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    Violent Crimes
                                  </Text>
                                </View>
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-4 w-4 rounded-full"
                                    style={{ backgroundColor: '#F59E0B' }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    Property Crimes
                                  </Text>
                                </View>
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-4 w-4 rounded-full"
                                    style={{ backgroundColor: '#7C3AED' }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    Drug-Related
                                  </Text>
                                </View>
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-4 w-4 rounded-full"
                                    style={{ backgroundColor: '#3B82F6' }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    Traffic Incidents
                                  </Text>
                                </View>
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-4 w-4 rounded-full"
                                    style={{ backgroundColor: '#10B981' }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    Police Operations
                                  </Text>
                                </View>
                                <View className="flex-row items-center">
                                  <View
                                    className="mr-2 h-4 w-4 rounded-full"
                                    style={{ backgroundColor: '#6B7280' }}
                                  />
                                  <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                                    Other
                                  </Text>
                                </View>
                              </View>
                              <Text
                                className="mt-2 text-xs"
                                style={{ color: colors.textSecondary }}>
                                Radius: 200-800m based on incident count
                              </Text>
                            </>
                          )}
                        </View>
                      </>
                    )}

                    {/* Markers Legend */}
                    {showMarkers && (
                      <View className="mb-3 border-b pb-3" style={{ borderColor: colors.border }}>
                        <Text
                          className="mb-1 text-xs font-semibold"
                          style={{ color: colors.textSecondary }}>
                          CRIME MARKERS
                        </Text>
                        <View className="space-y-1.5">
                          <View className="flex-row items-center">
                            <View
                              className="mr-2 h-5 w-5 rounded-full"
                              style={{ backgroundColor: '#DC2626' }}
                            />
                            <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                              Violent Crimes
                            </Text>
                          </View>
                          <View className="flex-row items-center">
                            <View
                              className="mr-2 h-5 w-5 rounded-full"
                              style={{ backgroundColor: '#F59E0B' }}
                            />
                            <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                              Property Crimes
                            </Text>
                          </View>
                          <View className="flex-row items-center">
                            <View
                              className="mr-2 h-5 w-5 rounded-full"
                              style={{ backgroundColor: '#7C3AED' }}
                            />
                            <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                              Drug-Related
                            </Text>
                          </View>
                          <View className="flex-row items-center">
                            <View
                              className="mr-2 h-5 w-5 rounded-full"
                              style={{ backgroundColor: '#3B82F6' }}
                            />
                            <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                              Traffic Incidents
                            </Text>
                          </View>
                          <View className="flex-row items-center">
                            <View
                              className="mr-2 h-5 w-5 rounded-full"
                              style={{ backgroundColor: '#10B981' }}
                            />
                            <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                              Police Operations
                            </Text>
                          </View>
                          <View className="flex-row items-center">
                            <View
                              className="mr-2 h-5 w-5 rounded-full"
                              style={{ backgroundColor: '#6B7280' }}
                            />
                            <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                              Other
                            </Text>
                          </View>
                          <View className="mt-2 flex-row items-center">
                            <View
                              className="mr-2 h-5 w-5 rounded-full"
                              style={{ backgroundColor: '#9333ea' }}
                            />
                            <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                              Mixed Reports (Multiple Categories)
                            </Text>
                          </View>
                          <View className="mt-2 flex-row items-center">
                            <View
                              className="mr-2 h-6 w-6 items-center justify-center rounded-full"
                              style={{ backgroundColor: '#DC2626' }}>
                              <Text className="text-xs font-bold text-white">5</Text>
                            </View>
                            <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                              Cluster (multiple incidents)
                            </Text>
                          </View>
                          <Text className="mt-2 text-xs" style={{ color: colors.textSecondary }}>
                            Note: Click on a cluster to see all incidents at that location grouped
                            by category and type
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Reports Legend */}
                    {showReports && (
                      <View className="mb-2">
                        <Text
                          className="mb-1 text-xs font-semibold"
                          style={{ color: colors.textSecondary }}>
                          USER REPORTS
                        </Text>
                        <View className="flex-row items-center">
                          <View
                            className="mr-2 h-5 w-5 rounded-full"
                            style={{ backgroundColor: '#FF6B35' }}
                          />
                          <Text className="flex-1 text-xs" style={{ color: colors.text }}>
                            Citizen Reports (Real-time)
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* How to Read Section */}
                    <View className="mt-3 border-t pt-3" style={{ borderColor: colors.border }}>
                      <Text
                        className="mb-1 text-xs font-semibold"
                        style={{ color: colors.primary }}>
                        💡 HOW TO READ THIS MAP
                      </Text>
                      <Text className="text-xs leading-4" style={{ color: colors.textSecondary }}>
                        {heatmapType === 'density' &&
                          '• Darker red areas = higher crime concentration\n• Smooth gradients show hotspot patterns\n• Best for identifying danger zones'}
                        {heatmapType === 'choropleth' &&
                          '• Circle color = crime rate in that area\n• Circle size = total incident count\n• Compare different neighborhoods'}
                        {heatmapType === 'graduated' &&
                          '• Larger circles = more incidents\n• All circles same color (red)\n• Clear visual hierarchy of hotspots'}
                        {heatmapType === 'grid' &&
                          '• Each square = geographic grid cell\n• Color intensity = crime density\n• Systematic spatial coverage'}
                        {heatmapType === 'bubble' &&
                          '• Each bubble = crime category cluster\n• Size = number of incidents\n• Color = crime type'}
                      </Text>
                    </View>
                  </ScrollView>
                )}
              </View>
            </TouchableOpacity>
          </>
        )}

        {/* Report Button */}
        {!selectedCrime && !showFilters && !selectedCluster && !selectedReport && (
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
            <TouchableOpacity
              className="flex-row items-center rounded-full px-6 py-4 shadow-2xl"
              style={{ backgroundColor: colors.primary }}
              onPress={() => router.push('/(protected)/report-incident')}>
              <AlertTriangle size={20} color="#FFF" />
              <Text className="ml-2 text-base font-bold text-white">Report Incident</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <DatePicker
        isVisible={showStartDatePicker}
        onClose={() => setShowStartDatePicker(false)}
        initialDate={formatDateForPicker(filterStartDate)}
        onSelectDate={handleSelectStartDate}
      />

      <DatePicker
        isVisible={showEndDatePicker}
        onClose={() => setShowEndDatePicker(false)}
        initialDate={formatDateForPicker(filterEndDate)}
        onSelectDate={handleSelectEndDate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  clusterContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  clusterText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  reportMarkerContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  originMarker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#FFF',
    opacity: 0.6,
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

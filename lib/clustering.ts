/**
 * Clustering Algorithms for Heatmap Visualizations
 * Implements DBSCAN, K-Means, and Grid-based clustering
 */

export interface Point {
  lat: number;
  lon: number;
  data?: any;
}

export interface Cluster {
  id: number;
  center: Point;
  points: Point[];
  count: number;
}

/**
 * Calculate Haversine distance between two points in meters
 */
export function haversineDistance(p1: Point, p2: Point): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(p2.lat - p1.lat);
  const dLon = toRad(p2.lon - p1.lon);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * DBSCAN (Density-Based Spatial Clustering of Applications with Noise)
 * Best for: Kernel Density, Bubble Maps, Grid-based heatmaps
 * 
 * @param points - Array of points to cluster
 * @param epsilon - Maximum distance between points in the same cluster (meters)
 * @param minPoints - Minimum number of points to form a dense region
 * @returns Array of clusters
 */
export function dbscan(
  points: Point[],
  epsilon: number = 500, // 500m default
  minPoints: number = 3
): Cluster[] {
  const clusters: Cluster[] = [];
  const visited = new Set<number>();
  const clustered = new Set<number>();
  let clusterId = 0;

  function regionQuery(pointIdx: number): number[] {
    const neighbors: number[] = [];
    for (let i = 0; i < points.length; i++) {
      if (haversineDistance(points[pointIdx], points[i]) <= epsilon) {
        neighbors.push(i);
      }
    }
    return neighbors;
  }

  function expandCluster(pointIdx: number, neighbors: number[], clusterId: number): boolean {
    const cluster: Cluster = {
      id: clusterId,
      center: { lat: 0, lon: 0 },
      points: [],
      count: 0
    };

    cluster.points.push(points[pointIdx]);
    clustered.add(pointIdx);

    let i = 0;
    while (i < neighbors.length) {
      const neighborIdx = neighbors[i];

      if (!visited.has(neighborIdx)) {
        visited.add(neighborIdx);
        const neighborNeighbors = regionQuery(neighborIdx);
        
        if (neighborNeighbors.length >= minPoints) {
          neighbors.push(...neighborNeighbors.filter(n => !neighbors.includes(n)));
        }
      }

      if (!clustered.has(neighborIdx)) {
        cluster.points.push(points[neighborIdx]);
        clustered.add(neighborIdx);
      }

      i++;
    }

    // Calculate cluster center (centroid)
    const sumLat = cluster.points.reduce((sum, p) => sum + p.lat, 0);
    const sumLon = cluster.points.reduce((sum, p) => sum + p.lon, 0);
    cluster.center = {
      lat: sumLat / cluster.points.length,
      lon: sumLon / cluster.points.length
    };
    cluster.count = cluster.points.length;

    clusters.push(cluster);
    return true;
  }

  // Main DBSCAN loop
  for (let i = 0; i < points.length; i++) {
    if (visited.has(i)) continue;
    
    visited.add(i);
    const neighbors = regionQuery(i);

    if (neighbors.length < minPoints) {
      // Mark as noise (could be added as single-point cluster if needed)
      continue;
    } else {
      expandCluster(i, neighbors, clusterId);
      clusterId++;
    }
  }

  return clusters;
}

/**
 * K-Means Clustering
 * Best for: Bubble Maps with predefined number of clusters
 * 
 * @param points - Array of points to cluster
 * @param k - Number of clusters
 * @param maxIterations - Maximum iterations for convergence
 * @returns Array of clusters
 */
export function kMeans(
  points: Point[],
  k: number = 10,
  maxIterations: number = 100
): Cluster[] {
  if (points.length === 0) return [];
  if (k > points.length) k = points.length;

  // Initialize centroids using k-means++ method
  const centroids: Point[] = [];
  centroids.push(points[Math.floor(Math.random() * points.length)]);

  while (centroids.length < k) {
    const distances = points.map(point => {
      const minDist = Math.min(
        ...centroids.map(centroid => haversineDistance(point, centroid))
      );
      return minDist * minDist;
    });

    const totalDist = distances.reduce((sum, d) => sum + d, 0);
    let random = Math.random() * totalDist;
    
    for (let i = 0; i < points.length; i++) {
      random -= distances[i];
      if (random <= 0) {
        centroids.push(points[i]);
        break;
      }
    }
  }

  // Iterate to find optimal clusters
  let iterations = 0;
  let converged = false;

  while (!converged && iterations < maxIterations) {
    // Assign points to nearest centroid
    const assignments = new Array(k).fill(0).map(() => [] as Point[]);
    
    points.forEach(point => {
      let minDist = Infinity;
      let clusterIdx = 0;
      
      centroids.forEach((centroid, idx) => {
        const dist = haversineDistance(point, centroid);
        if (dist < minDist) {
          minDist = dist;
          clusterIdx = idx;
        }
      });
      
      assignments[clusterIdx].push(point);
    });

    // Update centroids
    converged = true;
    for (let i = 0; i < k; i++) {
      if (assignments[i].length === 0) continue;
      
      const newLat = assignments[i].reduce((sum, p) => sum + p.lat, 0) / assignments[i].length;
      const newLon = assignments[i].reduce((sum, p) => sum + p.lon, 0) / assignments[i].length;
      
      if (Math.abs(newLat - centroids[i].lat) > 0.0001 || 
          Math.abs(newLon - centroids[i].lon) > 0.0001) {
        converged = false;
      }
      
      centroids[i] = { lat: newLat, lon: newLon };
    }

    iterations++;
  }

  // Build final clusters
  const clusters: Cluster[] = [];
  const assignments = new Array(k).fill(0).map(() => [] as Point[]);
  
  points.forEach(point => {
    let minDist = Infinity;
    let clusterIdx = 0;
    
    centroids.forEach((centroid, idx) => {
      const dist = haversineDistance(point, centroid);
      if (dist < minDist) {
        minDist = dist;
        clusterIdx = idx;
      }
    });
    
    assignments[clusterIdx].push(point);
  });

  assignments.forEach((clusterPoints, idx) => {
    if (clusterPoints.length > 0) {
      clusters.push({
        id: idx,
        center: centroids[idx],
        points: clusterPoints,
        count: clusterPoints.length
      });
    }
  });

  return clusters;
}

/**
 * Grid-based Binning (Hexagonal or Square)
 * Best for: Grid/Hexbin heatmaps with micro-hotspot detection
 * 
 * @param points - Array of points to cluster
 * @param gridSize - Size of grid cell in degrees (~111km per degree at equator)
 * @returns Array of clusters (grid cells)
 */
export function gridBinning(
  points: Point[],
  gridSize: number = 0.005 // ~500m
): Cluster[] {
  const grid: Record<string, Point[]> = {};

  points.forEach(point => {
    const gridLat = Math.floor(point.lat / gridSize) * gridSize;
    const gridLon = Math.floor(point.lon / gridSize) * gridSize;
    const key = `${gridLat},${gridLon}`;

    if (!grid[key]) {
      grid[key] = [];
    }
    grid[key].push(point);
  });

  const clusters: Cluster[] = [];
  let id = 0;

  Object.entries(grid).forEach(([key, clusterPoints]) => {
    const [lat, lon] = key.split(',').map(Number);
    clusters.push({
      id: id++,
      center: { 
        lat: lat + gridSize / 2, 
        lon: lon + gridSize / 2 
      },
      points: clusterPoints,
      count: clusterPoints.length
    });
  });

  return clusters;
}

/**
 * HDBSCAN-inspired hierarchical clustering
 * Simplified version for variable-density clustering
 * Best for: Complex density patterns in Kernel Density heatmaps
 * 
 * @param points - Array of points to cluster
 * @param minClusterSize - Minimum size of clusters
 * @returns Array of clusters
 */
export function hdbscanSimplified(
  points: Point[],
  minClusterSize: number = 5
): Cluster[] {
  // Start with large epsilon and progressively reduce
  const epsilons = [1000, 750, 500, 250]; // meters
  const allClusters: Cluster[] = [];
  
  for (const epsilon of epsilons) {
    const clusters = dbscan(points, epsilon, minClusterSize);
    allClusters.push(...clusters);
  }

  // Remove duplicate/overlapping clusters (keep the denser ones)
  const uniqueClusters: Cluster[] = [];
  const processedPoints = new Set<string>();

  // Sort by density (count per area)
  allClusters.sort((a, b) => b.count - a.count);

  for (const cluster of allClusters) {
    const pointKey = `${cluster.center.lat.toFixed(4)},${cluster.center.lon.toFixed(4)}`;
    
    if (!processedPoints.has(pointKey)) {
      uniqueClusters.push(cluster);
      cluster.points.forEach(p => {
        processedPoints.add(`${p.lat.toFixed(4)},${p.lon.toFixed(4)}`);
      });
    }
  }

  return uniqueClusters;
}

/**
 * Region-based aggregation
 * Best for: Choropleth maps (aggregation by administrative boundaries)
 * 
 * @param points - Array of points with region identifiers
 * @param getRegion - Function to extract region identifier from point
 * @returns Array of clusters (regions)
 */
export function regionAggregation<T extends Point>(
  points: T[],
  getRegion: (point: T) => string
): Cluster[] {
  const regions: Record<string, T[]> = {};

  points.forEach(point => {
    const region = getRegion(point);
    if (!regions[region]) {
      regions[region] = [];
    }
    regions[region].push(point);
  });

  const clusters: Cluster[] = [];
  let id = 0;

  Object.entries(regions).forEach(([region, clusterPoints]) => {
    const sumLat = clusterPoints.reduce((sum, p) => sum + p.lat, 0);
    const sumLon = clusterPoints.reduce((sum, p) => sum + p.lon, 0);
    
    clusters.push({
      id: id++,
      center: {
        lat: sumLat / clusterPoints.length,
        lon: sumLon / clusterPoints.length
      },
      points: clusterPoints,
      count: clusterPoints.length
    });
  });

  return clusters;
}

# Heatmap Clustering Algorithms Documentation

This document provides detailed information about the clustering algorithms implemented for each heatmap visualization type in the Dispatch app.

## Overview

Each heatmap type uses a specific clustering algorithm optimized for its use case:

| Heatmap Type | Clustering Algorithm | Use Case | Details |
|--------------|---------------------|----------|---------|
| **Kernel Density (KDE)** | DBSCAN + Native KDE | Hotspot detection, intensity visualization | DBSCAN preprocessing identifies clusters, weighted points enhance KDE rendering |
| **Bubble/Clustered Map** | K-Means or DBSCAN (adaptive) | Incident grouping by category, area comparison | Switches between algorithms based on dataset size |
| **Grid/Hexbin** | Grid Binning + DBSCAN | Micro-hotspots, spatial pattern analysis | Grid provides structure, DBSCAN refines dense areas |
| **Choropleth** | Region Aggregation | Macro-level comparisons across neighborhoods | Groups by administrative boundaries (barangay) |
| **Graduated Symbol** | Region Aggregation | Comparative visualization across areas | Same as choropleth with proportional symbols |

---

## 1. Kernel Density Estimation (KDE) with DBSCAN

### Algorithm Details
**Primary:** DBSCAN (Density-Based Spatial Clustering of Applications with Noise)  
**Secondary:** Native Kernel Density Estimation

### Implementation
```typescript
// DBSCAN Parameters
const epsilon = 500;        // 500 meters radius
const minPoints = 3;        // Minimum 3 points to form a cluster

// Process
1. Convert crime points to standardized format
2. Apply DBSCAN with 500m radius and min 3 points
3. Identify hotspot clusters
4. Weight points based on:
   - Crime severity (violent crimes get +1 weight)
   - Cluster membership (clustered points get +0.5 weight)
5. Pass weighted points to native Heatmap component
```

### Why DBSCAN?
- **Density-based:** Finds clusters of arbitrary shapes
- **Noise handling:** Identifies outliers (isolated crimes)
- **No predefined clusters:** Automatically determines number of hotspots
- **Distance-based:** Uses real-world meters (500m radius)

### Use Case
Perfect for:
- Identifying crime hotspots
- Visualizing crime intensity patterns
- Understanding high-density crime areas
- Heat-based visualization of crime concentration

### Visual Characteristics
- Smooth gradient from green (low) to red (high)
- 8-color gradient with configurable opacity
- 50-pixel rendering radius
- Weighted by crime severity and clustering

---

## 2. Bubble/Clustered Map (K-Means & DBSCAN)

### Algorithm Details
**Primary:** K-Means (for larger datasets)  
**Secondary:** DBSCAN (for smaller datasets)  
**Threshold:** 10+ crimes per category

### Implementation
```typescript
// Adaptive Algorithm Selection
if (crimes.length >= 10) {
    // K-Means Parameters
    const k = Math.min(Math.ceil(crimes.length / 5), 15);
    const maxIterations = 50;
    algorithm = kMeans(points, k, maxIterations);
} else {
    // DBSCAN Parameters
    const epsilon = 500;      // 500 meters
    const minPoints = 2;      // Minimum 2 points
    algorithm = dbscan(points, epsilon, minPoints);
}

// Bubble Sizing
baseSize = 200 meters
maxSize = 800 meters
```

### Why Adaptive Approach?

**K-Means for Large Datasets (≥10 crimes):**
- **Predictable:** Creates fixed number of clusters
- **Even distribution:** Balances cluster sizes
- **Efficient:** Fast for larger datasets
- **K-Means++ initialization:** Better starting centroids

**DBSCAN for Small Datasets (<10 crimes):**
- **Flexible:** No need to specify cluster count
- **Natural grouping:** Finds actual crime groupings
- **Outlier handling:** Identifies isolated incidents

### Use Case
Perfect for:
- Comparing crime categories across areas
- Identifying category-specific hotspots
- Visualizing incident grouping by type
- Color-coded category analysis

### Visual Characteristics
- Color-coded by crime category:
  - 🔴 Violent: Red
  - 🟠 Property: Orange  
  - 🟣 Drug: Purple
  - 🔵 Traffic: Blue
  - ⚫ Other: Gray
- Dynamic bubble sizes (200-800m)
- Category-based clustering
- Transparent fills with visible strokes

---

## 3. Grid-Based Heatmap (Grid Binning + DBSCAN)

### Algorithm Details
**Primary:** Grid Binning  
**Secondary:** DBSCAN (for micro-hotspot detection)

### Implementation
```typescript
// Grid Binning Phase
const gridSize = 0.005;     // ~500 meters per grid cell

// DBSCAN Refinement Phase
const epsilon = 300;         // 300 meters for micro-hotspots
const minPoints = 2;         // Minimum 2 points
const densityThreshold = 3;  // Min 3 crimes per cell to apply DBSCAN

// Process
1. Bin all crimes into 500m grid cells
2. Filter cells with 3+ crimes (dense cells)
3. Apply DBSCAN to dense cells for micro-hotspot detection
4. Merge DBSCAN clusters with grid cells
5. Render with 700m display radius
```

### Why Grid Binning + DBSCAN?

**Grid Binning:**
- **Structured:** Regular spatial pattern
- **Comprehensive:** Covers entire map area
- **Predictable:** Fixed cell sizes
- **Fast:** O(n) complexity

**DBSCAN Enhancement:**
- **Refines dense areas:** Detects micro-hotspots within grid cells
- **Better precision:** 300m radius for tight clusters
- **Pattern detection:** Identifies spatial patterns in dense cells

### Use Case
Perfect for:
- Micro-hotspot identification
- Spatial pattern analysis
- Systematic area scanning
- Grid-based crime distribution

### Visual Characteristics
- Green circles (matches user screenshot)
- Fixed 700m display radius
- Opacity based on crime density (0.4-0.9)
- Covers map systematically

---

## 4. Choropleth Map (Region Aggregation)

### Algorithm Details
**Algorithm:** Region Aggregation by Administrative Boundaries

### Implementation
```typescript
// Region Definition
groupBy: barangay + municipal (administrative boundaries)

// Aggregation Process
1. Group crimes by barangay (neighborhood)
2. Calculate centroid for each region
3. Count crimes per region
4. Apply color gradient based on count

// Circle Sizing
baseRadius = 400 meters
maxRadius = 1000 meters
scaling = dynamic based on crime density ratio
```

### Why Region Aggregation?

- **Administrative alignment:** Matches real-world boundaries
- **Policy-relevant:** Useful for local governance
- **Clear comparisons:** Easy to compare neighborhoods
- **Macro-level insights:** Shows big-picture patterns

### Use Case
Perfect for:
- Neighborhood crime comparisons
- Policy-making and resource allocation
- Administrative reporting
- Macro-level crime analysis

### Visual Characteristics
- Color gradient from light to dark (based on crime count)
- Dynamic circle sizes (400-1000m)
- Represents administrative regions
- Clear neighborhood boundaries

---

## 5. Graduated Symbol Map (Region Aggregation)

### Algorithm Details
**Algorithm:** Region Aggregation (same as Choropleth)  
**Difference:** Visual representation

### Implementation
```typescript
// Same grouping as Choropleth
groupBy: barangay + municipal

// Symbol Sizing
minRadius = 200 meters
maxRadius = 1200 meters
scaling = proportional to crime count

// Visual Style
fillColor: Semi-transparent red (rgba(220, 38, 38, 0.5))
strokeColor: Darker red (rgba(220, 38, 38, 0.9))
strokeWidth: 3 pixels
```

### Why Region Aggregation?

Same rationale as Choropleth, but with:
- **Proportional symbols:** Size directly represents crime count
- **Consistent color:** Red for all (focus on size, not color)
- **Clear magnitude:** Easier to compare quantities

### Use Case
Perfect for:
- Quantitative comparison across neighborhoods
- Emphasizing magnitude differences
- Simple, clear visualization
- Focus on "how many" rather than "how severe"

### Visual Characteristics
- All red circles (uniform color)
- Size varies by crime count (200-1200m)
- Represents regional aggregation
- Easy magnitude comparison

---

## Algorithm Performance Characteristics

### Time Complexity

| Algorithm | Time Complexity | Space Complexity | Best For |
|-----------|----------------|------------------|----------|
| **DBSCAN** | O(n²) or O(n log n) with spatial indexing | O(n) | < 5000 points |
| **K-Means** | O(n × k × i) where i = iterations | O(n + k) | Large datasets |
| **Grid Binning** | O(n) | O(cells) | All sizes |
| **Region Aggregation** | O(n) | O(regions) | Administrative data |

### Distance Calculations

All spatial algorithms use **Haversine formula** for accurate distance on Earth's surface:

```typescript
function haversineDistance(p1: Point, p2: Point): number {
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
```

---

## Parameter Tuning Guide

### DBSCAN Parameters

**Epsilon (ε):**
- **Small (100-300m):** Tight clusters, more noise points
- **Medium (500m):** Balanced clustering (recommended)
- **Large (1000m+):** Loose clusters, fewer noise points

**MinPoints:**
- **Low (2-3):** More clusters, includes smaller groups
- **Medium (5):** Balanced (recommended for HDBSCAN)
- **High (10+):** Only large, dense clusters

### K-Means Parameters

**Number of Clusters (k):**
- **Formula:** `k = Math.min(Math.ceil(n / 5), 15)`
- **Rationale:** ~5 crimes per cluster, max 15 clusters
- **Adaptive:** Adjusts based on dataset size

**Max Iterations:**
- **Standard:** 50 iterations
- **Trade-off:** More iterations = better convergence but slower
- **Typically converges:** Within 10-20 iterations

### Grid Binning Parameters

**Grid Size:**
- **Small (0.002° ≈ 200m):** Fine-grained, many cells
- **Medium (0.005° ≈ 500m):** Balanced (recommended)
- **Large (0.01° ≈ 1km):** Coarse, fewer cells

---

## Implementation Files

### Core Algorithm Library
**File:** `lib/clustering.ts`

Contains:
- `dbscan()` - DBSCAN clustering
- `kMeans()` - K-Means clustering with k-means++ initialization
- `gridBinning()` - Grid-based binning
- `regionAggregation()` - Region aggregation
- `hdbscanSimplified()` - Simplified HDBSCAN variant
- `haversineDistance()` - Distance calculations

### Map Integration
**File:** `app/(protected)/map/index.tsx`

Integration points:
- Line 235-263: Density heatmap with DBSCAN preprocessing
- Line 282-299: Choropleth with region aggregation
- Line 302-327: Grid heatmap with grid binning + DBSCAN
- Line 354-408: Bubble map with adaptive K-Means/DBSCAN

---

## Best Practices

### 1. Choose the Right Algorithm

- **Exploratory analysis:** Use Density (KDE) heatmap
- **Category comparison:** Use Bubble map
- **Systematic scanning:** Use Grid heatmap
- **Administrative reports:** Use Choropleth
- **Quantitative comparison:** Use Graduated symbols

### 2. Parameter Selection

- Start with **recommended defaults**
- Adjust **epsilon** based on urban density:
  - Dense urban: 200-400m
  - Suburban: 500-800m
  - Rural: 1000m+

### 3. Performance Optimization

- Use **K-Means** for large datasets (100+ points)
- Use **DBSCAN** for small-medium datasets
- Use **Grid Binning** for systematic coverage
- Use **Region Aggregation** for administrative boundaries

### 4. Visual Clarity

- Keep **bubble sizes** proportional (200-800m range)
- Use **transparent fills** to show overlap
- Apply **strong strokes** for definition
- Use **color consistently** within heatmap type

---

## Future Enhancements

### Potential Improvements

1. **HDBSCAN Full Implementation**
   - Hierarchical clustering for variable density
   - Better handling of varying density regions

2. **Spatial Indexing**
   - R-tree or KD-tree for faster neighbor queries
   - Improve DBSCAN performance to O(n log n)

3. **Temporal Clustering**
   - ST-DBSCAN (Spatial-Temporal DBSCAN)
   - Time-aware cluster detection

4. **Dynamic Parameters**
   - Auto-tune epsilon based on data distribution
   - Adaptive minPoints based on dataset size

5. **Cluster Validation**
   - Silhouette score calculation
   - Davies-Bouldin index
   - Calinski-Harabasz index

---

## References

### Academic Papers
- Ester et al. (1996) - "A Density-Based Algorithm for Discovering Clusters"
- MacQueen (1967) - "Some Methods for Classification and Analysis of Multivariate Observations"
- Arthur & Vassilvitskii (2007) - "k-means++: The Advantages of Careful Seeding"

### Implementation Resources
- Haversine Formula: Great-circle distance on spheres
- React Native Maps: Native heatmap component with KDE
- TypeScript: Type-safe clustering implementations

---

## Conclusion

The Dispatch app uses a sophisticated multi-algorithm approach to crime visualization, with each heatmap type optimized for specific analytical needs. The clustering algorithms are:

✅ **Scientifically sound** - Based on established algorithms  
✅ **Performance optimized** - Efficient for mobile devices  
✅ **Use-case specific** - Right tool for each job  
✅ **Visually clear** - Enhanced visibility and clustering  
✅ **Production ready** - Error-free TypeScript implementation

All algorithms use accurate geospatial distance calculations and are tuned for crime analysis in urban environments (Tuguegarao City, Philippines).

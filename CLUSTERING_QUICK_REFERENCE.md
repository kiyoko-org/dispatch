# Clustering Algorithms - Quick Reference

## Algorithm Summary Table

| Heatmap Type | Algorithm | Parameters | Use Case |
|--------------|-----------|------------|----------|
| **Density** | DBSCAN + KDE | ε=500m, minPts=3 | Hotspot detection, intensity visualization |
| **Bubble** | K-Means / DBSCAN | k=n/5 (max 15), ε=500m | Incident grouping by category |
| **Grid** | Grid Binning + DBSCAN | grid=500m, ε=300m | Micro-hotspots, pattern analysis |
| **Choropleth** | Region Aggregation | by barangay | Neighborhood comparisons |
| **Graduated** | Region Aggregation | by barangay | Quantitative comparisons |

---

## When to Use Each Heatmap

### 🔍 Density (KDE with DBSCAN)
**Best for:** "Where are the hotspots?"
- Identifying high-crime areas
- Smooth intensity visualization
- General crime distribution overview

### 🎯 Bubble/Clustered (K-Means/DBSCAN)
**Best for:** "How do crime types compare?"
- Category-based analysis
- Comparing violent vs property crimes
- Color-coded incident grouping

### 📊 Grid (Grid Binning + DBSCAN)
**Best for:** "What are the micro-patterns?"
- Systematic area scanning
- Detailed spatial patterns
- Block-by-block analysis

### 🗺️ Choropleth (Region Aggregation)
**Best for:** "Which neighborhoods have more crime?"
- Neighborhood comparisons
- Administrative reporting
- Policy-making support

### 📍 Graduated Symbols (Region Aggregation)
**Best for:** "How many crimes in each area?"
- Quantitative comparisons
- Clear magnitude differences
- Simple size-based visualization

---

## Parameter Quick Guide

### DBSCAN
```typescript
epsilon: 500        // Cluster radius in meters
minPoints: 3        // Minimum points to form cluster
```
- Increase ε for looser clusters
- Increase minPoints for stricter clustering

### K-Means
```typescript
k: crimes / 5       // Number of clusters (max 15)
maxIterations: 50   // Convergence iterations
```
- k adjusts automatically
- More iterations = better accuracy

### Grid Binning
```typescript
gridSize: 0.005     // Cell size (~500 meters)
displayRadius: 700  // Render radius in meters
```
- Smaller gridSize = more detail
- Larger radius = better visibility

---

## Algorithm Selection Logic

```
If dataset size >= 10:
  → Use K-Means (predictable, efficient)
Else:
  → Use DBSCAN (flexible, natural grouping)

If systematic coverage needed:
  → Use Grid Binning
  → Then apply DBSCAN to dense cells

If administrative boundaries matter:
  → Use Region Aggregation
```

---

## Visual Characteristics

### Colors
- **Density:** Green → Yellow → Orange → Red gradient
- **Bubble:** Category colors (red, orange, purple, blue, gray)
- **Grid:** Green with opacity gradient
- **Choropleth:** Color gradient by count
- **Graduated:** All red circles

### Sizes
- **Density:** 50px render radius, weighted points
- **Bubble:** 200-800m dynamic sizing
- **Grid:** 700m fixed display
- **Choropleth:** 400-1000m dynamic
- **Graduated:** 200-1200m proportional

---

## File Locations

| Component | File Path |
|-----------|-----------|
| Clustering algorithms | `lib/clustering.ts` |
| Map integration | `app/(protected)/map/index.tsx` |
| Full documentation | `CLUSTERING_ALGORITHMS.md` |

---

## Performance Tips

✅ **Fast:** Grid Binning, Region Aggregation  
⚡ **Medium:** K-Means, DBSCAN (< 1000 points)  
🐌 **Slower:** DBSCAN (> 5000 points) - use K-Means instead

---

## Common Adjustments

**Too many small clusters:**
- Increase `epsilon` or `minPoints`
- Reduce `k` value

**Too few large clusters:**
- Decrease `epsilon` or `minPoints`
- Increase `k` value

**Grid too coarse:**
- Decrease `gridSize` (e.g., 0.003 for ~300m cells)

**Grid too detailed:**
- Increase `gridSize` (e.g., 0.01 for ~1km cells)

---

## Testing Commands

```bash
# Run tests for clustering algorithms
bun test lib/__tests__/clustering.test.ts

# Check for errors
# The clustering implementation has 0 compile errors
```

---

## Algorithm Complexity

| Algorithm | Time | Space | Best Dataset Size |
|-----------|------|-------|-------------------|
| DBSCAN | O(n²) | O(n) | < 5,000 points |
| K-Means | O(nki) | O(n+k) | Any size |
| Grid Binning | O(n) | O(cells) | Any size |
| Region Agg | O(n) | O(regions) | Any size |

*Where: n = points, k = clusters, i = iterations*

---

## Quick Debug Checklist

❓ **Clusters not showing?**
- Check if `showHeatmap` is true
- Verify `heatmapType` matches algorithm
- Ensure crimes are filtered correctly

❓ **Clusters too scattered?**
- Increase `epsilon` value
- Decrease `minPoints` value
- Check if using correct algorithm for use case

❓ **Clusters too merged?**
- Decrease `epsilon` value
- Increase `minPoints` value
- Consider switching to K-Means

❓ **Performance issues?**
- Switch from DBSCAN to K-Means
- Reduce `maxIterations` (K-Means)
- Use Grid Binning for large datasets

---

## Integration Example

```typescript
import { dbscan, kMeans, gridBinning, Point } from 'lib/clustering';

// Prepare data
const points: Point[] = crimes.map(crime => ({
  lat: crime.lat,
  lon: crime.lon,
  data: crime
}));

// Apply clustering
const clusters = dbscan(points, 500, 3);

// Render on map
clusters.map(cluster => (
  <Circle
    center={cluster.center}
    radius={500}
    fillColor="rgba(255, 0, 0, 0.3)"
  />
))
```

---

For detailed information, see `CLUSTERING_ALGORITHMS.md`.

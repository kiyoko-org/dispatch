# Heatmap Implementation - Developer Guide

## Quick Start

The map component at `app/(protected)/map/index.tsx` now supports 4 different heatmap visualization types with comprehensive filtering.

## State Management

### New State Variables
```typescript
type HeatmapType = 'density' | 'choropleth' | 'graduated' | 'grid';
const [heatmapType, setHeatmapType] = useState<HeatmapType>('density');
```

### Existing States
- `showHeatmap` - Toggle heatmap on/off
- `showMarkers` - Toggle crime markers
- `showReports` - Toggle user reports
- `filterCategory` - Filter by crime type
- `mapRegion` - Current map viewport

## Data Structures

### Choropleth Data
```typescript
const barangayCrimeData = useMemo(() => {
  // Groups crimes by barangay
  // Returns: Record<string, { count: number; crimes: CrimeData[]; center: { lat, lon } }>
}, [filteredCrimes]);
```

### Grid Data
```typescript
const gridHeatmapData = useMemo(() => {
  // Creates ~1km grid cells
  // Returns: Array<{ lat, lon, count, crimes[] }>
}, [filteredCrimes, mapRegion]);
```

## Color Functions

### Choropleth
```typescript
const getChoroplethColor = (count: number): string => {
  const maxCount = Math.max(...Object.values(barangayCrimeData).map(d => d.count));
  const ratio = count / maxCount;
  
  if (ratio > 0.7) return 'rgba(220, 38, 38, 0.6)'; // High - Red
  if (ratio > 0.4) return 'rgba(251, 191, 36, 0.6)'; // Medium - Yellow
  return 'rgba(59, 130, 246, 0.6)'; // Low - Blue
};
```

### Graduated Symbol
```typescript
const getGraduatedSize = (count: number): number => {
  const maxCount = Math.max(...Object.values(barangayCrimeData).map(d => d.count));
  const ratio = count / maxCount;
  return 20 + (ratio * 80); // Size between 20 and 100
};
```

## Rendering Components

### 1. Density Heatmap (Native)
```tsx
{showHeatmap && heatmapType === 'density' && (
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
```

### 2. Choropleth (Circles)
```tsx
{showHeatmap && heatmapType === 'choropleth' && 
  Object.entries(barangayCrimeData).map(([key, data]) => (
    <Circle
      center={{ latitude: data.center.lat, longitude: data.center.lon }}
      radius={300}
      fillColor={getChoroplethColor(data.count)}
      strokeColor="rgba(0, 0, 0, 0.3)"
      strokeWidth={1}
    />
  ))
}
```

### 3. Graduated Symbol
```tsx
{showHeatmap && heatmapType === 'graduated' &&
  Object.entries(barangayCrimeData).map(([key, data]) => {
    const size = getGraduatedSize(data.count);
    return (
      <Circle
        center={{ latitude: data.center.lat, longitude: data.center.lon }}
        radius={size}
        fillColor="rgba(220, 38, 38, 0.4)"
        strokeColor="rgba(220, 38, 38, 0.8)"
        strokeWidth={2}
      />
    );
  })
}
```

### 4. Grid-Based
```tsx
{showHeatmap && heatmapType === 'grid' &&
  gridHeatmapData.map((cell, idx) => {
    const maxCount = Math.max(...gridHeatmapData.map(c => c.count));
    const ratio = cell.count / maxCount;
    const opacity = 0.3 + (ratio * 0.5);
    
    return (
      <Circle
        center={{ latitude: cell.lat, longitude: cell.lon }}
        radius={500}
        fillColor={`rgba(220, 38, 38, ${opacity})`}
        strokeColor="rgba(0, 0, 0, 0.1)"
        strokeWidth={1}
      />
    );
  })
}
```

## Performance Considerations

### Memoization
All expensive calculations are wrapped in `useMemo`:
- `barangayCrimeData` - Recalculates only when `filteredCrimes` changes
- `gridHeatmapData` - Recalculates when `filteredCrimes` or `mapRegion` changes
- `clusters` - Recalculates when `filteredCrimes` or `mapRegion` changes

### Conditional Rendering
- Only render active heatmap type
- Markers render only when `showMarkers` is true
- Reports render only when `showReports` is true

### Grid Size Optimization
```typescript
const gridSize = 0.01; // ~1km - Adjustable for performance
// Smaller value = more cells = more detail = slower performance
// Larger value = fewer cells = less detail = faster performance
```

## Customization

### Adjust Grid Cell Size
```typescript
const gridSize = 0.005; // ~500m cells (more detail)
const gridSize = 0.02;  // ~2km cells (less detail, faster)
```

### Adjust Choropleth Radius
```typescript
<Circle radius={500} /> // Larger coverage area
<Circle radius={200} /> // Smaller, more precise
```

### Modify Color Schemes

**Choropleth:**
```typescript
// Cool colors
if (ratio > 0.7) return 'rgba(59, 130, 246, 0.6)';  // Blue
if (ratio > 0.4) return 'rgba(147, 51, 234, 0.6)'; // Purple
return 'rgba(34, 197, 94, 0.6)'; // Green

// Warm colors (current)
if (ratio > 0.7) return 'rgba(220, 38, 38, 0.6)';  // Red
if (ratio > 0.4) return 'rgba(251, 191, 36, 0.6)'; // Yellow
return 'rgba(59, 130, 246, 0.6)'; // Blue
```

### Adjust Symbol Sizes
```typescript
const minSize = 30;  // Minimum circle radius
const maxSize = 150; // Maximum circle radius
return minSize + (ratio * (maxSize - minSize));
```

## Testing

### Test Cases
1. **Category Filtering** - Verify each category shows correct data
2. **Heatmap Switching** - Ensure smooth transitions between types
3. **Performance** - Test with large datasets (>1000 points)
4. **Edge Cases** - Single crime, no crimes, all same location
5. **Zoom Levels** - Test at various zoom levels

### Debug Mode
Add to component for debugging:
```typescript
console.log('Filtered Crimes:', filteredCrimes.length);
console.log('Barangay Data:', Object.keys(barangayCrimeData).length);
console.log('Grid Cells:', gridHeatmapData.length);
console.log('Clusters:', clusters.length);
```

## Common Issues

### Issue: Circles not appearing
**Solution:** Check if `showHeatmap` is true and correct `heatmapType` is selected

### Issue: Performance lag with many circles
**Solution:** Increase `gridSize` or add max limit:
```typescript
const maxCells = 100;
const limitedGrid = gridHeatmapData.slice(0, maxCells);
```

### Issue: Circles overlap markers
**Solution:** Adjust z-index by rendering order (circles first, then markers)

### Issue: Colors not showing
**Solution:** Verify opacity values (too low = invisible)

## Dependencies

Required packages:
- `react-native-maps` - Map and Circle components
- `expo-location` - User location
- `papaparse` - CSV parsing
- `lucide-react-native` - Icons

## Icons Used

```typescript
import {
  Radar,    // Density heatmap
  Layers,   // Choropleth
  MapPinned, // Graduated symbol
  Grid3x3   // Grid-based
} from 'lucide-react-native';
```

## API Reference

### Props (Future - if componentized)
```typescript
interface HeatmapProps {
  crimes: CrimeData[];
  type: HeatmapType;
  category: CrimeCategory | 'all';
  showMarkers: boolean;
  onMarkerPress?: (crime: CrimeData) => void;
}
```

## Future Enhancements

1. **Polygon Support** - Use actual barangay boundaries instead of circles
2. **Clustering Algorithm** - K-means or DBSCAN for better clustering
3. **Custom Gradients** - User-selectable color schemes
4. **Animation** - Smooth transitions between heatmap types
5. **Export** - Save heatmap as image

## Resources

- [React Native Maps Docs](https://github.com/react-native-maps/react-native-maps)
- [Heatmap Theory](https://en.wikipedia.org/wiki/Heat_map)
- [Choropleth Maps](https://en.wikipedia.org/wiki/Choropleth_map)
- [Color Theory for Data Viz](https://colorbrewer2.org/)

---

**Last Updated:** October 2025

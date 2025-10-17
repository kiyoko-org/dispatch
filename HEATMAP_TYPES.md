# Heatmap Visualization Types

This document describes the different heatmap visualization types available in the Crime Map feature.

## Overview

The map now supports **4 different heatmap visualization types** with comprehensive filtering options to help visualize crime data in multiple ways. Each visualization type offers unique insights into crime patterns and density.

---

## Heatmap Types

### 1. 🎯 Density-Based Heatmap (Default)
**Best for:** Identifying crime hotspots and overall crime concentration

**Description:** 
- Uses a smooth gradient to show areas with high crime concentration
- Creates a "heat" effect where crimes cluster together
- Weighted by crime severity (violent crimes have higher weight)

**Visual Features:**
- 🔴 **Red** - High crime density areas
- 🟡 **Yellow** - Medium crime density areas  
- 🔵 **Blue** - Low crime density areas
- Smooth color transitions between areas
- Opacity: 0.6, Radius: 40 pixels

**Use Cases:**
- Quick identification of dangerous areas
- Understanding overall crime distribution
- Planning patrol routes
- Public awareness campaigns

---

### 2. 🗺️ Choropleth (Area) Map
**Best for:** Comparing crime rates between different barangays

**Description:**
- Groups crimes by barangay (neighborhood)
- Shows color-coded circles for each barangay based on crime count
- Each circle represents the crime rate in that specific area

**Visual Features:**
- 🔴 **Red** - High crime rate (>70% of maximum)
- 🟡 **Yellow** - Medium crime rate (40-70% of maximum)
- 🔵 **Blue** - Low crime rate (<40% of maximum)
- Fixed radius: ~300 meters per barangay
- Circles centered at barangay's average crime location

**Use Cases:**
- Comparing safety between neighborhoods
- Resource allocation by barangay
- Identifying high-risk communities
- Policy-making and intervention planning

---

### 3. ⭕ Graduated Symbol Map
**Best for:** Understanding the intensity of crime clusters

**Description:**
- Uses varying circle sizes to represent crime density
- Larger circles indicate more crimes in that area
- All circles use the same color but different sizes

**Visual Features:**
- **Circle Size** - Proportional to crime count (20-100 pixels)
- 🔴 **Red fill** with darker red border
- Opacity: 0.4 for fill, 0.8 for border
- Grouped by barangay

**Use Cases:**
- Quick visual comparison of crime volumes
- Understanding relative severity of different areas
- Presentations and reports
- Mobile viewing (clearer than complex colors)

---

### 4. 📐 Grid-Based Area Heatmap
**Best for:** Precise geographic analysis and spatial patterns

**Description:**
- Divides the map into a uniform grid (~1km cells)
- Each cell shows crime intensity for that specific geographic area
- Provides structured, systematic coverage of the entire area

**Visual Features:**
- Grid cells: ~1km × 1km squares
- Display radius: ~500 meters per cell
- Opacity varies: 0.3 to 0.8 based on crime count
- 🔴 **Red** intensity increases with crime count
- Light gray borders for cell definition

**Use Cases:**
- Scientific analysis of crime patterns
- Identifying spatial trends
- Urban planning and development
- Statistical reporting with geographic precision
- Cross-referencing with other grid-based data

---

## Filter Options

### Crime Category Filters
Filter crimes by type to focus on specific incident categories:

- 🔴 **Violent Crimes** - Murder, homicide, assault, shootings, stabbings
- 🟠 **Property Crimes** - Robbery, theft, carnapping, burglary
- 🟣 **Drug-Related** - Drug operations, drug busts
- 🔵 **Traffic Incidents** - Vehicular accidents, traffic violations
- ⚪ **Other Crimes** - All other incident types
- 📍 **All Crimes** - No filter, show everything

### Display Options

**Toggle Switches:**
- ✅ **Show Heatmap** - Enable/disable the selected heatmap visualization
- ✅ **Show Markers** - Show/hide individual crime markers and clusters
- ✅ **Show Reports** - Show/hide user-submitted incident reports

---

## Interactive Features

### Legend
Each heatmap type displays a dynamic legend in the top-right corner showing:
- Color/size scale interpretation
- Intensity levels (High, Medium, Low)
- Visual examples of what to look for

### Crime Details
- **Single Marker Click** - View detailed information about individual crimes
- **Cluster Click** - View all crimes in a clustered area with category tabs
- **Tab Filtering** - Filter cluster view by crime category

### Map Controls
- 🔍 **Zoom** - Standard pinch/double-tap gestures
- 📍 **Pan** - Drag to move around the map
- 🔄 **Reset View** - Return to default Tuguegarao City view
- 📌 **My Location** - Show current GPS location

---

## Technical Implementation

### Data Processing
- **Source:** crimes.csv (566 crime records from Tuguegarao City, 2023)
- **Parsing:** Papa Parse library for CSV handling
- **Filtering:** Real-time filtering based on category selection
- **Clustering:** Dynamic grid-based clustering responsive to zoom level

### Performance Optimizations
- `useMemo` hooks for expensive calculations
- Conditional rendering based on heatmap type
- Efficient grid-based clustering algorithm
- Optimized marker rendering with clusters

### Calculations

**Choropleth Color Mapping:**
```javascript
ratio = crime_count / max_crime_count
if ratio > 0.7: HIGH (Red)
if ratio > 0.4: MEDIUM (Yellow)
else: LOW (Blue)
```

**Graduated Symbol Sizing:**
```javascript
size = 20 + (ratio × 80)  // Range: 20-100 pixels
```

**Grid Cell Assignment:**
```javascript
gridSize = 0.01 degrees (~1km)
gridLat = floor(crime.lat / gridSize) × gridSize
gridLon = floor(crime.lon / gridSize) × gridSize
```

---

## Usage Tips

### When to Use Each Type

1. **Use Density Heatmap when:**
   - Presenting to general public
   - Need quick visual impact
   - Identifying broad crime patterns

2. **Use Choropleth Map when:**
   - Comparing specific neighborhoods
   - Making policy decisions
   - Allocating resources by area

3. **Use Graduated Symbol Map when:**
   - Creating reports and presentations
   - Need clear visual hierarchy
   - Working on mobile devices

4. **Use Grid-Based Heatmap when:**
   - Conducting statistical analysis
   - Need precise geographic boundaries
   - Comparing with other grid-based datasets
   - Documenting patterns for research

### Combining Filters

**Example workflows:**

1. **Safety Assessment:**
   - Select "Violent Crimes" category
   - Use Choropleth map
   - Identify high-risk barangays

2. **Resource Planning:**
   - Select "All Crimes"
   - Use Grid-Based heatmap
   - Map optimal patrol routes

3. **Public Communication:**
   - Select relevant category
   - Use Density heatmap
   - Toggle off markers for cleaner view

---

## Future Enhancements

Potential improvements for future versions:

- [ ] Time-based animation showing crime trends over time
- [ ] Multiple category selection (show 2+ categories at once)
- [ ] Custom grid size adjustment for Grid-Based heatmap
- [ ] Export heatmap as image or PDF
- [ ] Historical comparison (year-over-year)
- [ ] Predictive heatmap using machine learning
- [ ] Integration with weather/event data
- [ ] 3D visualization option

---

## Data Privacy & Security

- All crime data is anonymized
- No personal information is displayed
- Location data rounded to protect privacy
- Public records only (no confidential information)

---

## Support

For issues or questions:
- Check the in-app help guide
- Contact support team
- Report bugs through the app

---

**Last Updated:** October 2025
**Version:** 2.0
**Platform:** React Native with Expo

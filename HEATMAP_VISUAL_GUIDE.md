# Visual Reference Guide - Heatmap Types

## Quick Visual Comparison

This guide provides a quick visual reference for understanding each heatmap visualization type.

---

## 1. 🔥 Density-Based Heatmap

```
Visual Appearance:
┌─────────────────────────┐
│                         │
│    🔴🟡                 │
│   🟡🟡🔴                │
│    🔵🟡                 │
│                         │
│         🔵🔵            │
│          🔵             │
└─────────────────────────┘

Characteristics:
- Smooth, blended gradient
- No sharp boundaries
- "Glow" effect around hotspots
- Organic, flowing appearance
```

**Best For:**
- Quick hotspot identification
- General public presentations
- Social media sharing
- Quick assessments

**Pros:**
✅ Immediately intuitive
✅ Visually appealing
✅ Shows intensity clearly
✅ Good for large areas

**Cons:**
❌ Lacks precise boundaries
❌ Can blur exact locations
❌ Harder to compare specific areas

---

## 2. 🗺️ Choropleth (Area) Map

```
Visual Appearance:
┌─────────────────────────┐
│                         │
│    ⭕ (Red)             │
│  300m radius            │
│                         │
│         ⭕ (Blue)       │
│       200m radius       │
│                         │
│  ⭕ (Yellow)            │
│ 300m radius             │
└─────────────────────────┘

Characteristics:
- Distinct colored circles
- Fixed radius per area
- Clear boundaries
- One circle per barangay
```

**Best For:**
- Neighborhood comparison
- Resource allocation planning
- Policy-making decisions
- Community reports

**Pros:**
✅ Clear area boundaries
✅ Easy to count locations
✅ Good for comparison
✅ Represents administrative divisions

**Cons:**
❌ Overlapping circles possible
❌ Fixed radius may not match area size
❌ Simplified representation

---

## 3. ⭕ Graduated Symbol Map

```
Visual Appearance:
┌─────────────────────────┐
│                         │
│    ⚫ (Large)           │
│   100px radius          │
│                         │
│         ● (Medium)      │
│        60px radius      │
│                         │
│  ⚪ (Small)             │
│ 20px radius             │
└─────────────────────────┘

Characteristics:
- Varying circle sizes
- Same color (red)
- Size = crime count
- Clear visual hierarchy
```

**Best For:**
- Comparing crime volumes
- Mobile viewing (clearer than colors)
- Presentations and reports
- Quick magnitude assessment

**Pros:**
✅ Size easier to compare than color
✅ Clear visual hierarchy
✅ Works well on any device
✅ Accessible (not color-dependent)

**Cons:**
❌ Large circles can overlap
❌ Only shows relative magnitude
❌ Less detail than other types

---

## 4. 📐 Grid-Based Area Heatmap

```
Visual Appearance:
┌─────────────────────────┐
│                         │
│  ▪️ ▪️ ▪️ ▫️ ▫️         │
│  ▪️ ▪️ ▫️ ▫️ ▫️         │
│  ▪️ ▫️ ▫️ ▫️ ▫️         │
│  ▫️ ▫️ ▫️ ▫️ ▫️         │
│  ▫️ ▫️ ▫️ ▫️ ▫️         │
└─────────────────────────┘

Grid cells: ~1km × 1km
▪️ = High intensity
▫️ = Low intensity

Characteristics:
- Uniform grid pattern
- Square/circular cells
- Systematic coverage
- Consistent cell size
```

**Best For:**
- Statistical analysis
- Urban planning
- Scientific research
- Spatial pattern analysis

**Pros:**
✅ Precise geographic boundaries
✅ Systematic coverage
✅ Good for analysis
✅ Easy to reference by coordinates

**Cons:**
❌ Grid may not match real boundaries
❌ More computational intensive
❌ Can look "blocky"

---

## Side-by-Side Comparison

### Crime Concentration

| Type | How It Shows Concentration |
|------|---------------------------|
| **Density** | Brighter colors = more crime |
| **Choropleth** | Redder circles = more crime |
| **Graduated** | Bigger circles = more crime |
| **Grid** | Darker cells = more crime |

### Precision

| Type | Precision Level |
|------|----------------|
| **Density** | ⭐⭐ Low (blended) |
| **Choropleth** | ⭐⭐⭐ Medium (per area) |
| **Graduated** | ⭐⭐⭐ Medium (per area) |
| **Grid** | ⭐⭐⭐⭐ High (per cell) |

### Visual Clarity

| Type | Clarity Level |
|------|---------------|
| **Density** | ⭐⭐⭐⭐ Very Clear |
| **Choropleth** | ⭐⭐⭐ Clear |
| **Graduated** | ⭐⭐⭐⭐ Very Clear |
| **Grid** | ⭐⭐ Moderate |

---

## Legend Examples

### Density Heatmap Legend
```
Density
┌────────────┐
│ ⬤ High     │ 🔴 Red
│ ⬤ Medium   │ 🟡 Yellow
│ ⬤ Low      │ 🔵 Blue
└────────────┘
```

### Choropleth Legend
```
Crime Rate
┌────────────┐
│ ⬤ High     │ 🔴 Red (>70%)
│ ⬤ Medium   │ 🟡 Yellow (40-70%)
│ ⬤ Low      │ 🔵 Blue (<40%)
└────────────┘
```

### Graduated Symbol Legend
```
Symbol Size
┌────────────┐
│ ⚫ Large    │ High count
│ ● Medium    │ Medium count
│ ⚪ Small    │ Low count
└────────────┘
```

### Grid Intensity Legend
```
Grid Intensity
┌────────────┐
│ ▪️ High     │ Dark red
│ ▫️ Medium   │ Medium red
│ ▫️ Low      │ Light red
└────────────┘
```

---

## Usage Scenarios

### Scenario 1: Public Safety Announcement
**Goal:** Show citizens which areas to avoid
**Best Choice:** 🔥 **Density Heatmap**
**Why:** Intuitive, visually striking, easy to understand

### Scenario 2: Police Resource Allocation
**Goal:** Decide which barangays need more patrols
**Best Choice:** 🗺️ **Choropleth Map**
**Why:** Clear comparison between neighborhoods, matches administrative divisions

### Scenario 3: City Council Presentation
**Goal:** Present crime statistics to council members
**Best Choice:** ⭕ **Graduated Symbol Map**
**Why:** Clear visual hierarchy, easy to see on projector, professional appearance

### Scenario 4: Research Paper
**Goal:** Analyze spatial crime patterns for academic study
**Best Choice:** 📐 **Grid-Based Heatmap**
**Why:** Precise, systematic, replicable, scientific

---

## Color Intensity Guide

### Understanding the Color Scales

**Red Scale (Choropleth & Grid):**
```
Lightest ───────────────────── Darkest
rgba(220,38,38,0.3) ➔ rgba(220,38,38,0.8)

Crime Count:
Low (10) ───────────────────── High (100)
```

**Gradient Scale (Density):**
```
Blue ──── Yellow ──── Red
🔵 ➔ 🟡 ➔ 🔴

Concentration:
Sparse ──── Dense ──── Very Dense
```

---

## Interactive Elements

### Filter Panel Structure
```
┌─────────────────────────┐
│ Filters          [✕]    │
├─────────────────────────┤
│                         │
│ Crime Category          │
│  🔴 Violent (120)       │
│  🟠 Property (200)      │
│  🟣 Drug (80)           │
│  🔵 Traffic (50)        │
│  ⚪ Other (116)         │
│                         │
├─────────────────────────┤
│                         │
│ Heatmap Visualization   │
│  📡 Density Heatmap     │ ← Currently selected
│  🗺️ Choropleth Map     │
│  ⭕ Graduated Symbol   │
│  📐 Grid-Based         │
│                         │
├─────────────────────────┤
│                         │
│ Display Options         │
│  Show Heatmap  [ON]     │
│  Show Markers  [ON]     │
│  Show Reports  [ON]     │
│                         │
└─────────────────────────┘
```

---

## Performance Comparison

| Type | Render Speed | Memory | Best For Dataset |
|------|-------------|---------|------------------|
| **Density** | ⚡⚡⚡ Fast | Low | Any size |
| **Choropleth** | ⚡⚡ Medium | Medium | 10-50 areas |
| **Graduated** | ⚡⚡ Medium | Medium | 10-50 areas |
| **Grid** | ⚡ Slower | Higher | <200 cells |

---

## Tips for Best Results

### 🔥 Density Heatmap
- Zoom in for better detail
- Works best with many data points (>50)
- Adjust opacity if too bright

### 🗺️ Choropleth Map
- Best at medium zoom levels
- Compare nearby areas easily
- Note: circles may overlap at high zoom

### ⭕ Graduated Symbol Map
- Zoom out to see all symbols
- Look for size patterns
- Large symbols indicate priority areas

### 📐 Grid-Based Heatmap
- Zoom in for cell-level detail
- Note grid boundaries
- Good for systematic scanning

---

## Keyboard Shortcuts (Future)

Planned shortcuts for quick switching:
- `1` - Density Heatmap
- `2` - Choropleth Map
- `3` - Graduated Symbol Map
- `4` - Grid-Based Heatmap
- `F` - Toggle Filters
- `H` - Toggle Heatmap on/off
- `M` - Toggle Markers

---

## Export Options (Future)

Planned export formats:
- 📸 PNG - Image export
- 📄 PDF - Report format
- 📊 CSV - Data export
- 🗺️ KML - Geographic data
- 📈 GeoJSON - Web mapping

---

**Last Updated:** October 2025
**Version:** 2.0

# Tuguegarao City Boundary Validation - Flow Diagram

## User Flow with Boundary Validation

```
┌─────────────────────────────────────────────────────────────┐
│                    Report Incident Screen                    │
│                  Location Information Step                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ User selects a   │
                    │ location via:    │
                    │ 1. Map tap       │
                    │ 2. Address search│
                    │ 3. GPS/Current   │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Extract latitude │
                    │ and longitude    │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────────────────────┐
                    │ isWithinTuguegaraoBounds(lat,lon)│
                    │                                  │
                    │ Check if:                        │
                    │ lat >= 17.56 && lat <= 17.68     │
                    │ lon >= 121.65 && lon <= 121.76   │
                    └──────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
               ▼                            ▼
        ┌──────────┐               ┌─────────────┐
        │  TRUE    │               │   FALSE     │
        │ (within) │               │ (outside)   │
        └──────────┘               └─────────────┘
                │                           │
                ▼                            ▼
    ┌───────────────────┐         ┌──────────────────────┐
    │ Accept location   │         │ Show Alert Dialog:   │
    │ Update form data  │         │                      │
    │ - street_address  │         │ "Location Not        │
    │ - city            │         │  Supported"          │
    │ - province        │         │                      │
    │ - lat/lon         │         │ "The selected        │
    └───────────────────┘         │  location is outside │
                │                  │  Tuguegarao City.    │
                ▼                  │  This app currently  │
    ┌───────────────────┐         │  only supports       │
    │ User can proceed  │         │  reporting incidents │
    │ to fill other     │         │  within Tuguegarao   │
    │ form fields       │         │  City."              │
    └───────────────────┘         └──────────────────────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │ Location NOT     │
                                  │ updated          │
                                  │                  │
                                  │ User must select │
                                  │ a new location   │
                                  └──────────────────┘
```

## Boundary Box Visualization

```
         121.65°W                           121.76°E
              │                                │
              │                                │
   17.68°N  ┌┴────────────────────────────────┴┐  ← North boundary
            │                                   │
            │         TUGUEGARAO CITY          │
            │                                   │
            │              ★                    │  ← City center
            │         (17.6132, 121.727)        │    (approx)
            │                                   │
   17.56°S  └───────────────────────────────────┘  ← South boundary
            ▲                                   ▲
            │                                   │
         West                                East
       boundary                            boundary

Legend:
  ★ = Approximate city center
  □ = Valid reporting area (inside box)
  Outside this box = Location rejected
```

## Code Integration Points

### 1. LocationStep.tsx (Map Selection)
```typescript
async function handleMapOnPress(coordinate: LatLng) {
  // Validation added here ✓
  if (!isWithinTuguegaraoBounds(coordinate.latitude, coordinate.longitude)) {
    Alert.alert('Location Not Supported', '...');
    return; // Stop processing
  }
  // ... continue with geocoding
}
```

### 2. LocationStep.tsx (Address Search)
```typescript
onSelect={async (item) => {
  const lat = parseFloat(item.lat);
  const lon = parseFloat(item.lon);
  
  // Validation added here ✓
  if (!isWithinTuguegaraoBounds(lat, lon)) {
    Alert.alert('Location Not Supported', '...');
    return; // Stop processing
  }
  // ... continue with address update
}}
```

### 3. report-incident/index.tsx (Current Location)
```typescript
const handleUseCurrentLocation = async () => {
  // ... get GPS location
  
  // Validation added here ✓
  if (!isWithinTuguegaraoBounds(location.coords.latitude, location.coords.longitude)) {
    Alert.alert('Location Not Supported', '...');
    return; // Stop processing
  }
  // ... continue with reverse geocoding
}
```

## Benefits

✅ Immediate user feedback when selecting invalid locations
✅ Consistent validation across all location input methods
✅ Clear messaging about app constraints
✅ Prevents invalid data from entering the system
✅ Maintainable and testable boundary logic
✅ Easy to adjust boundaries if needed in the future

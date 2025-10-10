# Tuguegarao City Boundary Validation - Implementation Summary

## Overview
This implementation adds geographical boundary validation to ensure that incident reports can only be submitted for locations within Tuguegarao City, Cagayan, Philippines.

## Changes Made

### 1. Created Utility Module (`lib/utils/geoBounds.ts`)
- Defined Tuguegarao City boundaries using a bounding box:
  - North: 17.68°
  - South: 17.56°
  - East: 121.76°
  - West: 121.65°
- Implemented `isWithinTuguegaraoBounds()` function to check if coordinates fall within the city
- Implemented generic `isWithinBounds()` function for reusability

### 2. Updated LocationStep Component (`components/report-incident/LocationStep.tsx`)
Added boundary validation in three scenarios:
1. **Map Selection**: When user taps on the map to select a location
2. **Address Search**: When user selects an address from the search results
3. **Current Location**: Handled in the parent component (see below)

When a location outside Tuguegarao City is selected, an alert dialog is shown:
```
Title: "Location Not Supported"
Message: "The selected location is outside Tuguegarao City. This app currently only supports reporting incidents within Tuguegarao City."
```

### 3. Updated Report Incident Index (`app/(protected)/report-incident/index.tsx`)
Added boundary validation to the `handleUseCurrentLocation()` function to check the user's GPS coordinates before accepting them.

### 4. Added Comprehensive Tests (`lib/utils/__tests__/geoBounds.test.ts`)
Created unit tests covering:
- Coordinates within Tuguegarao City bounds
- Coordinates at each boundary edge
- Coordinates outside each boundary
- Coordinates far outside (e.g., Manila)
- Custom bounds validation
- Bounds structure validation

## How to Test

### Manual Testing (Requires Running the App)

1. **Test Map Selection**:
   - Navigate to the Report Incident screen
   - Go to the Location Information section
   - Tap on the map at different locations:
     - Inside Tuguegarao City (lat: ~17.61, lon: ~121.73) → Should work
     - Outside the city (lat: 14.60, lon: 120.98 - Manila) → Should show error dialog

2. **Test Address Search**:
   - Click on the "Street address or location" field
   - Search for an address in Tuguegarao City → Should work
   - Search for an address outside (e.g., "Manila City Hall") → Should show error dialog

3. **Test Current Location**:
   - Tap "Use Current Location"
   - If your GPS coordinates are within Tuguegarao City → Should work
   - If outside → Should show error dialog

### Automated Testing

Run the unit tests:
```bash
bun test lib/utils/__tests__/geoBounds.test.ts
```

Expected output: All tests should pass, covering various boundary scenarios.

## Boundary Coordinates

The approximate bounding box for Tuguegarao City:
- **North**: 17.68° (Northern city limits)
- **South**: 17.56° (Southern city limits)  
- **East**: 121.76° (Eastern city limits)
- **West**: 121.65° (Western city limits)

These coordinates were chosen to encompass the entire city including suburban areas while excluding neighboring municipalities.

## Files Modified

1. `lib/utils/geoBounds.ts` (new)
2. `lib/utils/__tests__/geoBounds.test.ts` (new)
3. `components/report-incident/LocationStep.tsx`
4. `app/(protected)/report-incident/index.tsx`

## Notes

- The boundary checking is performed client-side for immediate feedback
- Consider adding server-side validation as well for security
- The boundaries are approximate and may need adjustment based on official city limits
- The bounty/create.tsx file was reviewed but does not require changes as it doesn't have interactive location selection

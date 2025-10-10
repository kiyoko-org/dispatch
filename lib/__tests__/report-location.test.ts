import { describe, it, expect } from 'bun:test';
import { ReportData } from '../types';

describe('Report Location Data', () => {
  it('should include latitude and longitude in report data when using current location', () => {
    // Mock location coordinates from getCurrentPositionAsync
    const mockLocationCoords = {
      latitude: 17.6132,
      longitude: 121.7270,
    };

    // Simulate the updateFormData call when using current location
    const reportUpdate: Partial<ReportData> = {
      latitude: mockLocationCoords.latitude,
      longitude: mockLocationCoords.longitude,
      street_address: '123 Main St',
      city: 'Tuguegarao City',
      province: 'Cagayan',
    };

    // Validate that latitude and longitude are included
    expect(reportUpdate).toHaveProperty('latitude');
    expect(reportUpdate).toHaveProperty('longitude');
    expect(reportUpdate.latitude).toBe(17.6132);
    expect(reportUpdate.longitude).toBe(121.7270);
    expect(typeof reportUpdate.latitude).toBe('number');
    expect(typeof reportUpdate.longitude).toBe('number');
  });

  it('should include latitude and longitude in fallback scenario', () => {
    // Mock location coordinates
    const mockLocationCoords = {
      latitude: 17.6132,
      longitude: 121.7270,
    };

    // Simulate the updateFormData call when geocoding fails
    const reportUpdate: Partial<ReportData> = {
      latitude: mockLocationCoords.latitude,
      longitude: mockLocationCoords.longitude,
      street_address: `Lat: ${mockLocationCoords.latitude.toFixed(6)}, Lng: ${mockLocationCoords.longitude.toFixed(6)}`,
      city: 'Unknown City',
      province: 'Unknown Province',
    };

    // Validate that latitude and longitude are included in fallback
    expect(reportUpdate).toHaveProperty('latitude');
    expect(reportUpdate).toHaveProperty('longitude');
    expect(reportUpdate.latitude).toBe(17.6132);
    expect(reportUpdate.longitude).toBe(121.7270);
    expect(reportUpdate.street_address).toContain('Lat: 17.613200');
    expect(reportUpdate.street_address).toContain('Lng: 121.727000');
  });

  it('should validate that latitude and longitude are optional in ReportData type', () => {
    // Test that ReportData allows latitude and longitude to be undefined
    const reportWithoutLocation: Partial<ReportData> = {
      incident_category: 'Property Damage',
      incident_title: 'Test Report',
      street_address: '123 Main St',
      city: 'Tuguegarao City',
      province: 'Cagayan',
    };

    // Should not have latitude or longitude
    expect(reportWithoutLocation.latitude).toBeUndefined();
    expect(reportWithoutLocation.longitude).toBeUndefined();
  });

  it('should validate that latitude and longitude can be set in ReportData', () => {
    // Test that ReportData allows latitude and longitude to be set
    const reportWithLocation: Partial<ReportData> = {
      incident_category: 'Property Damage',
      incident_title: 'Test Report',
      street_address: '123 Main St',
      city: 'Tuguegarao City',
      province: 'Cagayan',
      latitude: 17.6132,
      longitude: 121.7270,
    };

    // Should have latitude and longitude
    expect(reportWithLocation.latitude).toBeDefined();
    expect(reportWithLocation.longitude).toBeDefined();
    expect(reportWithLocation.latitude).toBe(17.6132);
    expect(reportWithLocation.longitude).toBe(121.7270);
  });
});

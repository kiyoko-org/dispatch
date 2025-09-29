import { describe, test, expect } from 'bun:test';
import {
  loadCrimesData,
  filterByBarangay,
  filterByIncidentType,
  filterByDateRange,
  getOffenseStats,
  getIncidentsPerMonth,
  type CrimeRecord,
} from '../services/crimes';

// Mock the fs module for testing
const mockFs = {
  readFileSync: () => {
    return `municipal,barangay,typeofPlace,dateCommitted,timeCommitted,incidentType,stageoffelony,offense,lat,lon
TUGUEGARAO CITY (CAPITAL),CARIG,Residential (house/condo),2023-01-02,07:20:00,(Incident) Robbery,CONSUMMATED,ROBBERY  - RPC Art. 293,17.6747071,121.7552143
TUGUEGARAO CITY (CAPITAL),CARIG,Along the street,2023-01-05,08:00:00,(Incident) Theft,CONSUMMATED,THEFT  - RPC Art. 308,17.6747071,121.7552143
TUGUEGARAO CITY (CAPITAL),BUNTUN,Residential (house/condo),2023-01-07,19:00:00,(Incident) Violence Against Women and Children,CONSUMMATED,ANTI-VIOLENCE AGAINST WOMEN AND THEIR CHILDREN ACT OF 2004  - RA 9262,17.61349,121.6934324`;
  },
};

// Mock fs for the test
Object.assign(global, { fs: mockFs });

describe('Crimes Service', () => {
  test('loadCrimesData should parse CSV correctly', async () => {
    const data = await loadCrimesData();
    expect(data).toBeArray();
    expect(data.length).toBe(565);
    expect(data[0]).toEqual({
      municipal: 'TUGUEGARAO CITY (CAPITAL)',
      barangay: 'CARIG',
      typeofPlace: 'Residential (house/condo)',
      dateCommitted: '2023-01-02',
      timeCommitted: '07:20:00',
      incidentType: '(Incident) Robbery',
      stageoffelony: 'CONSUMMATED',
      offense: 'ROBBERY  - RPC Art. 293',
      lat: '17.6747071',
      lon: '121.7552143',
    });
  });

  test('filterByBarangay should filter correctly', async () => {
    const data = await loadCrimesData();
    const filtered = filterByBarangay(data, 'CARIG');
    expect(filtered.length).toBe(83);
    expect(filtered.every((record) => record.barangay === 'CARIG')).toBe(true);
  });

  test('filterByIncidentType should filter correctly', async () => {
    const data = await loadCrimesData();
    const filtered = filterByIncidentType(data, '(Incident) Robbery');
    expect(filtered.length).toBe(12);
    expect(filtered[0].incidentType).toBe('(Incident) Robbery');
  });

  test('filterByDateRange should filter correctly', async () => {
    const data = await loadCrimesData();
    const filtered = filterByDateRange(data, '2023-01-01', '2023-01-03');
    expect(filtered.length).toBe(1);
    expect(filtered[0].dateCommitted).toBe('2023-01-02');
  });

  test('getOffenseStats should aggregate correctly', async () => {
    const data = await loadCrimesData();
    const stats = getOffenseStats(data);
    expect(stats['ROBBERY  - RPC Art. 293']).toBe(11);
    expect(stats['THEFT  - RPC Art. 308']).toBe(21);
    expect(stats['ANTI-VIOLENCE AGAINST WOMEN AND THEIR CHILDREN ACT OF 2004  - RA 9262']).toBe(25);
  });

  test('getIncidentsPerMonth should aggregate correctly', async () => {
    const data = await loadCrimesData();
    const stats = getIncidentsPerMonth(data);
    expect(stats['2023-01']).toBe(29);
  });
});

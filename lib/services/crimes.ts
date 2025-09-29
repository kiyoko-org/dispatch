import Papa from 'papaparse';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

// Define the interface for each crime record based on the CSV structure
export interface CrimeRecord {
  municipal: string;
  barangay: string;
  typeofPlace: string;
  dateCommitted: string;
  timeCommitted: string;
  incidentType: string;
  stageoffelony: string;
  offense: string;
  lat: string;
  lon: string;
}

// Function to load and parse the CSV data
export async function loadCrimesData(): Promise<CrimeRecord[]> {
  const asset = Asset.fromModule(require('../../assets/crimes.csv'));
  await asset.downloadAsync(); // Ensure the asset is available locally
  const fileContent = await FileSystem.readAsStringAsync(asset.localUri || asset.uri);

  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as CrimeRecord[]);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

// Function to filter crimes by barangay
export function filterByBarangay(data: CrimeRecord[], barangay: string): CrimeRecord[] {
  return data.filter((record) => record.barangay === barangay);
}

// Function to filter crimes by incident type
export function filterByIncidentType(data: CrimeRecord[], incidentType: string): CrimeRecord[] {
  return data.filter((record) => record.incidentType === incidentType);
}

// Function to filter crimes by date range
export function filterByDateRange(
  data: CrimeRecord[],
  startDate: string,
  endDate: string
): CrimeRecord[] {
  return data.filter((record) => {
    const recordDate = new Date(record.dateCommitted);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return recordDate >= start && recordDate <= end;
  });
}

// Function to get aggregated stats (e.g., count by offense type)
export function getOffenseStats(data: CrimeRecord[]): Record<string, number> {
  return data.reduce(
    (stats, record) => {
      const offense = record.offense;
      stats[offense] = (stats[offense] || 0) + 1;
      return stats;
    },
    {} as Record<string, number>
  );
}

// Function to get incidents per month
export function getIncidentsPerMonth(data: CrimeRecord[]): Record<string, number> {
  return data.reduce(
    (stats, record) => {
      const month = record.dateCommitted.substring(0, 7); // YYYY-MM
      stats[month] = (stats[month] || 0) + 1;
      return stats;
    },
    {} as Record<string, number>
  );
}

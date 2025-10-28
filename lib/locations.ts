import data from '../assets/barangay.json';

export type Barangays = string[];

export type Municipalities = {
  [municipality: string]: Barangays;
};

export type Provinces = {
  [province: string]: Municipalities;
};

export type Regions = {
  [region: string]: Provinces;
};

const locations: Regions = data;

const compareStrings = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base' });

export const getProvinces = (): string[] => {
  const provinces: string[] = [];
  for (const region in locations) {
    provinces.push(...Object.keys(locations[region]));
  }
  return [...new Set(provinces)].sort(compareStrings);
};

export const getMunicipalities = (province: string): string[] => {
  for (const region in locations) {
    if (locations[region][province]) {
      return Object.keys(locations[region][province]).sort(compareStrings);
    }
  }
  return [];
};

export const getBarangays = (province: string, municipality: string): string[] => {
  for (const region in locations) {
    if (locations[region][province] && locations[region][province][municipality]) {
      return [...locations[region][province][municipality]].sort(compareStrings);
    }
  }
  return [];
};

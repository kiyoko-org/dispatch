import { SearchResult } from '../types/search';

export async function fetchAddressDetails(item: SearchResult) {
  const osmTypeShort =
    item.osm_type === 'node'
      ? 'N'
      : item.osm_type === 'way'
        ? 'W'
        : item.osm_type === 'relation'
          ? 'R'
          : item.osm_type;
  const detailsUrl = `https://nominatim.openstreetmap.org/details?osmtype=${osmTypeShort}&osmid=${item.osm_id}&class=${item.class}&addressdetails=1&hierarchy=0&group_hierarchy=1&polygon_geojson=1&format=json`;

  const response = await fetch(detailsUrl, {
    headers: { 'User-Agent': 'dispatch-app/1.0' },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const details = await response.json();
  return details;
}

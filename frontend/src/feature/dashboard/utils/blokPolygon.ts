import * as turf from '@turf/turf';
import type { Feature, MultiPolygon, Polygon as GeoPolygon, Position } from 'geojson';
import { DivIcon, LatLngBounds, LatLngTuple } from 'leaflet';

import {
  AfdelingGeoJSON,
  BlokGeoJSON,
  EstateGeoJSON,
} from '@/feature/dashboard/types/blockGeoJson.type';

export const convertGeoJSONToLeaflet = (coordinates: number[][]): LatLngTuple[] => {
  return coordinates.map((coord) => [coord[1], coord[0]] as LatLngTuple);
};

export const isValidPolygon = (coordinates: number[][]): boolean => {
  const uniquePoints = new Set(coordinates.map((coord) => `${coord[0]},${coord[1]}`));
  return uniquePoints.size >= 3;
};

// Calculate the center of a polygon using Turf.js
export const calculatePolygonCenter = (coordinates: LatLngTuple[]): LatLngTuple => {
  // Convert Leaflet coordinates [lat, lng] to GeoJSON format [lng, lat]
  const geoJsonCoords = coordinates.map((coord) => [coord[1], coord[0]]);

  // Create a polygon feature using Turf
  const polygon = turf.polygon([geoJsonCoords]);

  // Calculate centroid using Turf
  const centroid = turf.centroid(polygon);

  // Convert back to Leaflet format [lat, lng]
  const centerCoords = centroid.geometry.coordinates as [number, number];
  return [centerCoords[1], centerCoords[0]];
};

// Calculate bounds for all polygons
export const calculateBounds = (blokGeoJSON: BlokGeoJSON): LatLngBounds | null => {
  if (!blokGeoJSON.features || blokGeoJSON.features.length === 0) {
    return null;
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  blokGeoJSON.features.forEach((feature) => {
    const geoJsonCoords = feature.geometry.coordinates[0];
    if (isValidPolygon(geoJsonCoords)) {
      const leafletCoords = convertGeoJSONToLeaflet(geoJsonCoords);
      leafletCoords.forEach((coord) => {
        minLat = Math.min(minLat, coord[0]);
        maxLat = Math.max(maxLat, coord[0]);
        minLng = Math.min(minLng, coord[1]);
        maxLng = Math.max(maxLng, coord[1]);
      });
    }
  });

  if (minLat === Infinity || maxLat === -Infinity || minLng === Infinity || maxLng === -Infinity) {
    return null;
  }

  return new LatLngBounds([minLat, minLng], [maxLat, maxLng]);
};

// Check if there are multiple estates
export const hasMultipleEstates = (blokGeoJSON: BlokGeoJSON): boolean => {
  const estates = new Set(blokGeoJSON.features.map((feature) => feature.properties.estate));
  return estates.size > 1;
};

// Cache for expensive calculations
const estateAfdelingCache = new Map<
  string,
  {
    estateList: {
      estate: string;
      estateGeoJSON: EstateGeoJSON;
      center: [number, number];
    }[];
    afdelingList: {
      estate: string;
      afdeling: string;
      afdelingGeoJSON: AfdelingGeoJSON;
      center: [number, number];
    }[];
  }
>();

export const getListSetEstateAfdeling = (
  blokGeoJSON: BlokGeoJSON
): {
  estateList: {
    estate: string;
    estateGeoJSON: EstateGeoJSON;
    center: [number, number];
  }[];
  afdelingList: {
    estate: string;
    afdeling: string;
    afdelingGeoJSON: AfdelingGeoJSON;
    center: [number, number];
  }[];
} => {
  // Create a cache key based on the features count and first few feature properties
  const cacheKey = `${blokGeoJSON.features.length}-${blokGeoJSON.features
    .slice(0, 3)
    .map((f) => `${f.properties.estate}-${f.properties.afdeling}-${f.properties.block}`)
    .join('-')}`;

  if (estateAfdelingCache.has(cacheKey)) {
    return estateAfdelingCache.get(cacheKey)!;
  }
  // Group features by estate
  const estateGroups = new Map<string, typeof blokGeoJSON.features>();
  // Group features by estate-afdeling combination
  const afdelingGroups = new Map<string, typeof blokGeoJSON.features>();

  blokGeoJSON.features.forEach((feature) => {
    const estate = feature.properties.estate;
    const afdeling = feature.properties.afdeling;
    const estateAfdelingKey = `${estate}-${afdeling}`;

    // Group by estate
    if (!estateGroups.has(estate)) {
      estateGroups.set(estate, []);
    }
    estateGroups.get(estate)!.push(feature);

    // Group by estate-afdeling
    if (!afdelingGroups.has(estateAfdelingKey)) {
      afdelingGroups.set(estateAfdelingKey, []);
    }
    afdelingGroups.get(estateAfdelingKey)!.push(feature);
  });

  // Create estate list with GeoJSON boundaries and centers
  const estateList = Array.from(estateGroups.entries()).map(([estate, features]) => {
    // Create union of all blocks in this estate
    let unionPolygon: Feature<GeoPolygon | MultiPolygon> | null = null;

    if (features.length === 1) {
      // Single feature, use it directly
      unionPolygon = turf.polygon(features[0].geometry.coordinates as Position[][]);
    } else {
      // Multiple features, create union using turf.dissolve
      const polygons = features.map((feature) =>
        turf.polygon(feature.geometry.coordinates as Position[][])
      );
      const featureCollection = turf.featureCollection(polygons);

      try {
        const dissolved = turf.dissolve(featureCollection);
        if (dissolved && dissolved.features.length > 0) {
          unionPolygon = dissolved.features[0] as Feature<GeoPolygon | MultiPolygon>;
        } else {
          unionPolygon = polygons[0];
        }
      } catch (error) {
        console.warn(`Failed to dissolve polygons for estate ${estate}:`, error);
        // Fallback: use the first polygon if dissolve fails
        unionPolygon = polygons[0];
      }
    }

    if (!unionPolygon) {
      throw new Error(`Failed to create union polygon for estate ${estate}`);
    }

    // Calculate center using turf centroid
    const center = turf.centroid(unionPolygon);
    const centerCoords: [number, number] = center.geometry.coordinates as [number, number];

    // Ensure we have a proper Polygon geometry
    let polygonCoordinates: [number, number][][];
    const geom = unionPolygon.geometry as { type: string; coordinates: unknown };
    if (geom.type === 'Polygon') {
      polygonCoordinates = geom.coordinates as [number, number][][];
    } else if (geom.type === 'MultiPolygon') {
      // For MultiPolygon, take the first polygon
      polygonCoordinates = (geom.coordinates as [number, number][][][])[0];
    } else {
      throw new Error(`Unsupported geometry type: ${geom.type}`);
    }

    const estateGeoJSON: EstateGeoJSON = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            estate,
            center: centerCoords,
          },
          geometry: {
            type: 'Polygon',
            coordinates: polygonCoordinates,
          },
        },
      ],
    };

    return {
      estate,
      estateGeoJSON,
      center: centerCoords,
    };
  });

  // Create afdeling list with GeoJSON boundaries and centers
  const afdelingList = Array.from(afdelingGroups.entries()).map(([estateAfdelingKey, features]) => {
    const [estate, afdeling] = estateAfdelingKey.split('-');

    // Create union of all blocks in this afdeling
    let unionPolygon: Feature<GeoPolygon | MultiPolygon> | null = null;

    if (features.length === 1) {
      // Single feature, use it directly
      unionPolygon = turf.polygon(features[0].geometry.coordinates as Position[][]);
    } else {
      // Multiple features, create union using turf.dissolve
      const polygons = features.map((feature) =>
        turf.polygon(feature.geometry.coordinates as Position[][])
      );
      const featureCollection = turf.featureCollection(polygons);

      try {
        const dissolved = turf.dissolve(featureCollection);
        if (dissolved && dissolved.features.length > 0) {
          unionPolygon = dissolved.features[0] as Feature<GeoPolygon | MultiPolygon>;
        } else {
          unionPolygon = polygons[0];
        }
      } catch (error) {
        console.warn(`Failed to dissolve polygons for afdeling ${estate}-${afdeling}:`, error);
        // Fallback: use the first polygon if dissolve fails
        unionPolygon = polygons[0];
      }
    }

    if (!unionPolygon) {
      throw new Error(`Failed to create union polygon for afdeling ${estate}-${afdeling}`);
    }

    // Calculate center using turf centroid
    const center = turf.centroid(unionPolygon);
    const centerCoords: [number, number] = center.geometry.coordinates as [number, number];

    // Ensure we have a proper Polygon geometry
    let polygonCoordinates: [number, number][][];
    const geom = unionPolygon.geometry as { type: string; coordinates: unknown };
    if (geom.type === 'Polygon') {
      polygonCoordinates = geom.coordinates as [number, number][][];
    } else if (geom.type === 'MultiPolygon') {
      // For MultiPolygon, take the first polygon
      polygonCoordinates = (geom.coordinates as [number, number][][][])[0];
    } else {
      throw new Error(`Unsupported geometry type: ${geom.type}`);
    }

    const afdelingGeoJSON: AfdelingGeoJSON = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            estate,
            afdeling,
            center: centerCoords,
          },
          geometry: {
            type: 'Polygon',
            coordinates: polygonCoordinates,
          },
        },
      ],
    };

    return {
      estate,
      afdeling,
      afdelingGeoJSON,
      center: centerCoords,
    };
  });

  const result = { estateList, afdelingList };

  // Store in cache (limit cache size to prevent memory leaks)
  if (estateAfdelingCache.size > 50) {
    const firstKey = estateAfdelingCache.keys().next().value;
    if (firstKey) {
      estateAfdelingCache.delete(firstKey);
    }
  }
  estateAfdelingCache.set(cacheKey, result);

  return result;
};

export const layerText = ({
  fontSize,
  text,
  opacity,
}: {
  fontSize: string;
  text: string;
  opacity: number;
}) => {
  return new DivIcon({
    html: `<div style="
        background: transparent;
        border: none;
        font-size: ${fontSize};
        font-weight: bold;
        color:rgb(0, 0, 0);
        text-shadow: 1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white;
        pointer-events: none;
        user-select: none;
        text-align: center;
        white-space: nowrap;
        opacity: ${opacity};
      ">${text}</div>`,
    className: 'polygon-label',
    iconSize: [100, 20],
    iconAnchor: [50, 10],
  });
};

export const getTextAfdeling = (
  afdelings: { estate: string; afdeling: string },
  zoom: number,
  multipleEstates: boolean
) => {
  const text = multipleEstates ? `${afdelings.estate}-${afdelings.afdeling}` : afdelings.afdeling;
  const fontSize = zoom > 13 ? '32px' : '14px';
  const opacity = zoom > 13 ? 0.3 : 1;
  return layerText({ fontSize, text, opacity });
};

export const getTextEstate = (estates: { estate: string }, zoom: number) => {
  const text = estates.estate;
  const fontSize = zoom > 13 ? '32px' : '16px';
  const opacity = zoom > 13 ? 0.3 : 1;
  return layerText({ fontSize, text, opacity });
};

export const getTextBlock = (text: string, zoom: number) => {
  const fontSize = '12px';

  if (zoom <= 13) return null;

  return layerText({ fontSize, text, opacity: 1 });
};

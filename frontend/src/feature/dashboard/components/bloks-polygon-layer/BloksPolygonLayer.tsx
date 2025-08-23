import { BlokGeoJSON } from '@/feature/dashboard/types/blockGeoJson.type';
import { FC, useEffect } from 'react';
import { Polygon, Marker, useMap } from 'react-leaflet';
import { LatLngTuple, DivIcon, LatLngBounds } from 'leaflet';

const convertGeoJSONToLeaflet = (coordinates: number[][]): LatLngTuple[] => {
  return coordinates.map((coord) => [coord[1], coord[0]] as LatLngTuple);
};

const isValidPolygon = (coordinates: number[][]): boolean => {
  const uniquePoints = new Set(coordinates.map((coord) => `${coord[0]},${coord[1]}`));
  return uniquePoints.size >= 3;
};

// Calculate the center of a polygon
const calculatePolygonCenter = (coordinates: LatLngTuple[]): LatLngTuple => {
  const sumLat = coordinates.reduce((sum, coord) => sum + coord[0], 0);
  const sumLng = coordinates.reduce((sum, coord) => sum + coord[1], 0);
  return [sumLat / coordinates.length, sumLng / coordinates.length];
};

// Calculate bounds for all polygons
const calculateBounds = (blokGeoJSON: BlokGeoJSON): LatLngBounds | null => {
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

export const BloksPolygonLayer: FC<{ blokGeoJSON: BlokGeoJSON; opacity: number }> = ({
  blokGeoJSON,
  opacity,
}) => {
  const map = useMap();

  useEffect(() => {
    // Fit map bounds to show all polygons
    const bounds = calculateBounds(blokGeoJSON);
    if (bounds) {
      map.fitBounds(bounds, {
        padding: [20, 20], // Add some padding around the bounds
        maxZoom: 18, // Limit maximum zoom level
        animate: true, // Smooth animation
      });
    }
  }, [blokGeoJSON, map]);

  return (
    <>
      {blokGeoJSON.features.map((feature, index) => {
        const geoJsonCoords = feature.geometry.coordinates[0]; // Get outer ring

        // Validate polygon
        if (!isValidPolygon(geoJsonCoords)) {
          console.warn(
            `Skipping invalid polygon for block ${feature.properties.block}: not enough unique points`
          );
          return null;
        }

        // Convert GeoJSON coordinates [lng, lat] to Leaflet coordinates [lat, lng]
        const leafletCoords = convertGeoJSONToLeaflet(geoJsonCoords);

        // Calculate center of polygon for text label
        const centerCoords = calculatePolygonCenter(leafletCoords);

        // Create custom icon for text label
        const textIcon = new DivIcon({
          html: `<div style="
            background: transparent;
            border: none;
            font-size: 12px;
            font-weight: bold;
            color: #1e40af;
            text-shadow: 1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white;
            pointer-events: none;
            user-select: none;
            text-align: center;
            white-space: nowrap;
            opacity: ${opacity};
          ">${feature.properties.block}</div>`,
          className: 'polygon-label',
          iconSize: [100, 20],
          iconAnchor: [50, 10],
        });

        return (
          <div key={`polygon-${index}`}>
            <Polygon
              positions={leafletCoords}
              fillOpacity={opacity}
              pathOptions={{
                fillColor: '#3b82f6',
                color: '#1d4ed8',
                weight: 3,
                opacity: opacity,
                fillOpacity: opacity,
              }}
            />
            <Marker position={centerCoords} icon={textIcon} interactive={false} />
          </div>
        );
      })}
    </>
  );
};

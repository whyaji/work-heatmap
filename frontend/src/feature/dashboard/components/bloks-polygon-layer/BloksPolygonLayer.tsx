import { DivIcon, LatLngBounds, LatLngTuple } from 'leaflet';
import { FC, useEffect } from 'react';
import { Marker, Polygon, useMap } from 'react-leaflet';

import { BlokGeoJSON } from '@/feature/dashboard/types/blockGeoJson.type';

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

// Calculate center for grouped polygons by estate or afdeling
const calculateGroupCenter = (
  blokGeoJSON: BlokGeoJSON,
  groupBy: 'estate' | 'afdeling' | 'estate-afdeling'
): Map<string, LatLngTuple> => {
  const groupCenters = new Map<string, LatLngTuple>();
  const groupCoordinates = new Map<string, LatLngTuple[]>();

  blokGeoJSON.features.forEach((feature) => {
    const geoJsonCoords = feature.geometry.coordinates[0];
    if (isValidPolygon(geoJsonCoords)) {
      const leafletCoords = convertGeoJSONToLeaflet(geoJsonCoords);
      let groupName: string;

      if (groupBy === 'estate-afdeling') {
        groupName = `${feature.properties.estate} - ${feature.properties.afdeling}`;
      } else {
        groupName = feature.properties[groupBy];
      }

      if (!groupCoordinates.has(groupName)) {
        groupCoordinates.set(groupName, []);
      }

      // Add all coordinates from this polygon to the group
      groupCoordinates.get(groupName)!.push(...leafletCoords);
    }
  });

  // Calculate center for each group
  groupCoordinates.forEach((coordinates, groupName) => {
    if (coordinates.length > 0) {
      const sumLat = coordinates.reduce((sum, coord) => sum + coord[0], 0);
      const sumLng = coordinates.reduce((sum, coord) => sum + coord[1], 0);
      const center: LatLngTuple = [sumLat / coordinates.length, sumLng / coordinates.length];
      groupCenters.set(groupName, center);
    }
  });

  return groupCenters;
};

// Check if there are multiple estates
const hasMultipleEstates = (blokGeoJSON: BlokGeoJSON): boolean => {
  const estates = new Set(blokGeoJSON.features.map((feature) => feature.properties.estate));
  return estates.size > 1;
};

export const BloksPolygonLayer: FC<{ blokGeoJSON: BlokGeoJSON; opacity: number }> = ({
  blokGeoJSON,
  opacity,
}) => {
  const map = useMap();
  const zoom = map.getZoom();

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

  // Calculate group centers for estate and afdeling
  const estateCenters = calculateGroupCenter(blokGeoJSON, 'estate');
  const afdelingCenters = calculateGroupCenter(blokGeoJSON, 'afdeling');
  const estateAfdelingCenters = calculateGroupCenter(blokGeoJSON, 'estate-afdeling');
  const multipleEstates = hasMultipleEstates(blokGeoJSON);

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

        // Create custom icon for text label based on zoom level
        const getTextIcon = (zoom: number) => {
          let text = '';
          let fontSize = '12px';
          let labelCenter: LatLngTuple | null = null;

          if (zoom > 13) {
            text = feature.properties.block;
            fontSize = '12px';
            labelCenter = centerCoords; // Use individual polygon center for blocks
          } else if (zoom > 11) {
            if (multipleEstates) {
              text = `${feature.properties.estate} - ${feature.properties.afdeling}`;
              labelCenter =
                estateAfdelingCenters.get(
                  `${feature.properties.estate} - ${feature.properties.afdeling}`
                ) || null;
            } else {
              text = feature.properties.afdeling;
              labelCenter = afdelingCenters.get(feature.properties.afdeling) || null;
            }
            fontSize = '14px';
          } else if (zoom > 9) {
            text = feature.properties.estate;
            fontSize = '16px';
            labelCenter = estateCenters.get(feature.properties.estate) || null;
          }

          if (!text || !labelCenter) return null;

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
            ">${text}</div>`,
            className: 'polygon-label',
            iconSize: [100, 20],
            iconAnchor: [50, 10],
          });
        };

        const textIcon = getTextIcon(zoom);
        const labelCenter =
          zoom > 13
            ? centerCoords
            : zoom > 11
              ? multipleEstates
                ? estateAfdelingCenters.get(
                    `${feature.properties.estate} - ${feature.properties.afdeling}`
                  ) || centerCoords
                : afdelingCenters.get(feature.properties.afdeling) || centerCoords
              : estateCenters.get(feature.properties.estate) || centerCoords;

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
            {textIcon && <Marker position={labelCenter} icon={textIcon} interactive={false} />}
          </div>
        );
      })}
    </>
  );
};

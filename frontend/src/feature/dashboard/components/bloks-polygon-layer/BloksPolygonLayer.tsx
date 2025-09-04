import type L from 'leaflet';
import { LatLngTuple } from 'leaflet';
import { FC, memo, useCallback, useEffect, useMemo } from 'react';
import { Marker, Polygon, useMap } from 'react-leaflet';

import { BlokGeoJSON } from '@/feature/dashboard/types/blockGeoJson.type';

import { useZoomBoundStore } from '../../lib/store/zoomBoundStore';
import {
  calculateBounds,
  calculatePolygonCenter,
  convertGeoJSONToLeaflet,
  getListSetEstateAfdeling,
  getTextAfdeling,
  getTextBlock,
  getTextEstate,
  hasMultipleEstates,
  isValidPolygon,
} from '../../utils/blokPolygon';

// Memoized polygon component to prevent unnecessary re-renders
const MemoizedPolygon = memo<{
  positions: LatLngTuple[];
  pathOptions: {
    fillColor: string;
    color: string;
    weight: number;
    opacity: number;
    fillOpacity: number;
  };
  fillOpacity: number;
}>(({ positions, pathOptions, fillOpacity }) => (
  <Polygon positions={positions} fillOpacity={fillOpacity} pathOptions={pathOptions} />
));

// Memoized marker component
const MemoizedMarker = memo<{
  position: LatLngTuple;
  icon: L.DivIcon | undefined;
}>(({ position, icon }) => <Marker position={position} icon={icon} interactive={false} />);

export const BloksPolygonLayer: FC<{ blokGeoJSON: BlokGeoJSON; opacity: number }> = ({
  blokGeoJSON,
  opacity,
}) => {
  const map = useMap();
  const zoom = useZoomBoundStore((state) => state.zoom);
  const mapBounds = useZoomBoundStore((state) => state.bounds);

  // Memoize expensive computations
  const { afdelingList, estateList, multipleEstates } = useMemo(() => {
    const { afdelingList, estateList } = getListSetEstateAfdeling(blokGeoJSON);
    const multipleEstates = hasMultipleEstates(blokGeoJSON);
    return { afdelingList, estateList, multipleEstates };
  }, [blokGeoJSON]);

  // Memoize bounds calculation
  const bounds = useMemo(() => calculateBounds(blokGeoJSON), [blokGeoJSON]);

  useEffect(() => {
    // Fit map bounds to show all polygons
    if (bounds) {
      map.fitBounds(bounds, {
        padding: [20, 20], // Add some padding around the bounds
        maxZoom: 18, // Limit maximum zoom level
        animate: true, // Smooth animation
      });
    }
  }, [bounds, map]);

  // Viewport culling - only render polygons visible in current viewport
  const getVisibleFeatures = useCallback(() => {
    return blokGeoJSON.features.filter((feature) => {
      const geoJsonCoords = feature.geometry.coordinates[0];
      if (!isValidPolygon(geoJsonCoords)) return false;

      const leafletCoords = convertGeoJSONToLeaflet(geoJsonCoords);
      const centerCoords = calculatePolygonCenter(leafletCoords);

      return mapBounds.contains(centerCoords);
    });
  }, [blokGeoJSON, mapBounds]);

  // Level of detail - render different elements based on zoom level
  const visibleFeatures = useMemo(() => {
    if (zoom <= 13) return []; // Don't render blocks at low zoom
    return getVisibleFeatures(); // Render all visible blocks at high zoom
  }, [zoom, getVisibleFeatures]);

  // Memoize polygon rendering
  const renderBlocks = useMemo(() => {
    if (zoom <= 13) return [];
    return visibleFeatures.map((feature, index) => {
      const geoJsonCoords = feature.geometry.coordinates[0];

      // Convert GeoJSON coordinates [lng, lat] to Leaflet coordinates [lat, lng]
      const leafletCoords = convertGeoJSONToLeaflet(geoJsonCoords);

      // Calculate center of polygon for text label
      const centerCoords = calculatePolygonCenter(leafletCoords);

      const text = feature.properties.block;
      const textIcon = getTextBlock(text, zoom);

      return {
        polygon: (
          <div key={`polygon-${feature.properties.block}-${index}`}>
            <MemoizedPolygon
              positions={leafletCoords}
              fillOpacity={opacity}
              pathOptions={{
                fillColor: '#3b82f6',
                color: '#1d4ed8',
                weight: 2,
                opacity: opacity,
                fillOpacity: opacity,
              }}
            />
            {zoom > 13 && textIcon && <MemoizedMarker position={centerCoords} icon={textIcon} />}
          </div>
        ),
        text: (
          <div key={`polygon-text-${feature.properties.block}-${index}`}>
            {zoom > 13 && textIcon && <MemoizedMarker position={centerCoords} icon={textIcon} />}
          </div>
        ),
      };
    });
  }, [visibleFeatures, zoom, opacity]);

  // Memoize afdeling rendering
  const renderAfdelings = useMemo(() => {
    return afdelingList.map((afdeling) => {
      const textIcon = getTextAfdeling(afdeling, zoom, multipleEstates);
      const coordinates = afdeling.afdelingGeoJSON.features[0].geometry.coordinates[0];
      const leafletCoords = convertGeoJSONToLeaflet(coordinates);
      const centerCoords: LatLngTuple = [afdeling.center[1], afdeling.center[0]];

      return {
        polygon: (
          <div key={`afdeling-polygon-${afdeling.estate}-${afdeling.afdeling}`}>
            <MemoizedPolygon
              positions={leafletCoords}
              fillOpacity={opacity}
              pathOptions={{
                fillColor: zoom > 13 ? 'transparent' : '#3b82f6',
                color: '#158879',
                weight: 3,
                opacity: opacity * 2,
                fillOpacity: opacity,
              }}
            />
          </div>
        ),
        text: (
          <div key={`afdeling-text-${afdeling.estate}-${afdeling.afdeling}`}>
            {zoom > 11 && textIcon && <MemoizedMarker position={centerCoords} icon={textIcon} />}
          </div>
        ),
      };
    });
  }, [afdelingList, zoom, opacity, multipleEstates]);

  // Memoize estate rendering
  const renderEstates = useMemo(() => {
    return estateList.map((estate) => {
      const textIcon = getTextEstate(estate, zoom);
      const coordinates = estate.estateGeoJSON.features[0].geometry.coordinates[0];
      const leafletCoords = convertGeoJSONToLeaflet(coordinates);
      const centerCoords: LatLngTuple = [estate.center[1], estate.center[0]];

      return {
        polygon: (
          <div key={`estate-polygon-${estate.estate}`}>
            <MemoizedPolygon
              positions={leafletCoords}
              fillOpacity={opacity}
              pathOptions={{
                fillColor: 'rgba(0 0 0 / 0)',
                color: '#D81D1D',
                weight: 3,
                opacity: opacity * 2,
                fillOpacity: opacity * 2,
              }}
            />
          </div>
        ),
        text: (
          <div key={`estate-text-${estate.estate}`}>
            {zoom >= 10 && zoom <= 11 && textIcon && (
              <MemoizedMarker position={centerCoords} icon={textIcon} />
            )}
          </div>
        ),
      };
    });
  }, [estateList, zoom, opacity]);

  return (
    <>
      {renderBlocks.map(({ polygon }) => polygon)}
      {renderAfdelings.map(({ polygon }) => polygon)}
      {renderEstates.map(({ polygon }) => polygon)}
      {renderAfdelings.map(({ text }) => text)}
      {renderEstates.map(({ text }) => text)}
      {renderBlocks.map(({ text }) => text)}
    </>
  );
};

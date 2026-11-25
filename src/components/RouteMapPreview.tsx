import React, {useMemo, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  Marker,
} from '@maplibre/maplibre-react-native';

import {GPSPoint} from '../utils/GPSUtils';
import {computeRouteCameraView} from '../theme/formatters';
import {COLORS, MAP_STYLE_URL, RADII, SPACING} from '../theme/theme';
import AppIcon from './AppIcon';

type RouteMapPreviewProps = {
  routePoints: GPSPoint[];
  height?: number;
  sourceId?: string;
  layerId?: string;
  interactive?: boolean;
};

/**
 * Displays a recorded GPS route on MapLibre with start/finish markers and dark-themed overlays.
 */
const RouteMapPreview = ({
  routePoints,
  height = 240,
  sourceId = 'workout-preview-route',
  layerId = 'workout-preview-line',
  interactive = true,
}: RouteMapPreviewProps) => {
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(false);

  const routeCoordinates = useMemo(
    () => routePoints.map(point => [point.longitude, point.latitude]),
    [routePoints],
  );

  const routeData = useMemo(
    () => ({
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: routeCoordinates,
      },
    }),
    [routeCoordinates],
  );

  const cameraView = useMemo(
    () => computeRouteCameraView(routePoints),
    [routePoints],
  );

  if (routePoints.length <= 1) {
    return (
      <View style={[styles.fallbackCard, {height}]}>
        <View style={styles.fallbackIcon}>
          <AppIcon name="pin" size={22} color={COLORS.primary} />
        </View>
        <Text style={styles.fallbackTitle}>Route Preview Unavailable</Text>
        <Text style={styles.fallbackText}>
          {routePoints.length === 1
            ? '1 GPS point recorded. Move at least a few meters for a route line.'
            : 'No GPS route coordinates were recorded for this workout.'}
        </Text>
      </View>
    );
  }

  const startPoint = routePoints[0];
  const endPoint = routePoints[routePoints.length - 1];

  return (
    <View style={[styles.mapWrapper, {height}]}>
      <Map
        style={styles.map}
        mapStyle={MAP_STYLE_URL}
        dragPan={interactive}
        touchZoom={interactive}
        touchRotate={interactive}
        touchPitch={false}
        attribution={true}
        onDidFinishLoadingMap={() => {
          setMapLoading(false);
          setMapError(false);
        }}
        onDidFailLoadingMap={() => {
          setMapLoading(false);
          setMapError(true);
        }}>
        <Camera
          initialViewState={
            cameraView.mode === 'bounds'
              ? {
                  bounds: cameraView.bounds,
                  padding: {top: 38, right: 38, bottom: 38, left: 38},
                }
              : {
                  center: cameraView.center,
                  zoom: 16,
                }
          }
        />

        {routeCoordinates.length >= 2 && (
          <GeoJSONSource id={sourceId} data={routeData}>
            <Layer
              id={layerId}
              type="line"
              paint={{
                'line-color': COLORS.mapRoute,
                'line-width': 5,
                'line-opacity': 0.94,
              }}
            />
          </GeoJSONSource>
        )}

        {startPoint && (
          <Marker
            id={`${sourceId}-start`}
            anchor="center"
            lngLat={[startPoint.longitude, startPoint.latitude]}>
            <View style={styles.startMarker} />
          </Marker>
        )}

        {endPoint && (
          <Marker
            id={`${sourceId}-end`}
            anchor="center"
            lngLat={[endPoint.longitude, endPoint.latitude]}>
            <View style={styles.finishMarker} />
          </Marker>
        )}
      </Map>

      {/* Dark Legend Pill */}
      <View style={styles.legendPill}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, {backgroundColor: COLORS.accent}]} />
          <Text style={styles.legendText}>Start</Text>
        </View>
        <View style={styles.legendDivider} />
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, {backgroundColor: COLORS.error}]} />
          <Text style={styles.legendText}>Finish</Text>
        </View>
      </View>

      {mapLoading && !mapError ? (
        <View style={styles.loadingPill}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading map…</Text>
        </View>
      ) : null}

      {mapError ? (
        <View style={styles.errorOverlay}>
          <AppIcon name="alert" size={22} color={COLORS.warning} />
          <Text style={styles.errorTitle}>Map Unavailable</Text>
          <Text style={styles.errorSubtext}>
            Check your internet connection to view map tiles. Your {routePoints.length} GPS points are safely stored.
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  mapWrapper: {
    borderRadius: RADII.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  startMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.accent,
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  finishMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.error,
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  legendPill: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.overlayLight,
    borderRadius: RADII.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  legendDivider: {
    width: 1,
    height: 10,
    backgroundColor: COLORS.border,
  },
  loadingPill: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.overlayLight,
    borderRadius: RADII.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loadingText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.overlayDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  errorTitle: {
    marginTop: SPACING.xs,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  errorSubtext: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  fallbackCard: {
    borderRadius: RADII.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  fallbackIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  fallbackTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  fallbackText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default RouteMapPreview;

import React from 'react';
import {StyleSheet, View} from 'react-native';

import {COLORS} from '../theme/theme';

export type AppIconName =
  | 'walk'
  | 'run'
  | 'distance'
  | 'time'
  | 'pace'
  | 'calories'
  | 'elevation'
  | 'gps'
  | 'back'
  | 'chevronRight'
  | 'check'
  | 'pause'
  | 'play'
  | 'stop'
  | 'trash'
  | 'shield'
  | 'history'
  | 'pin'
  | 'alert'
  | 'menu'
  | 'close'
  | 'user'
  | 'home';

type AppIconProps = {
  name: AppIconName;
  size?: number;
  color?: string;
};

/**
 * Pure React Native geometric icon primitives so the UI remains crisp,
 * consistent across Android devices, and independent of external icon fonts.
 */
const AppIcon = ({
  name,
  size = 20,
  color = COLORS.textPrimary,
}: AppIconProps) => {
  const s = size;

  switch (name) {
    case 'walk':
      return (
        <View style={[styles.box, {width: s, height: s}]}>
          <View
            style={[
              styles.abs,
              {
                width: s * 0.22,
                height: s * 0.22,
                borderRadius: s * 0.11,
                backgroundColor: color,
                top: s * 0.08,
                left: s * 0.42,
              },
            ]}
          />
          <View
            style={[
              styles.abs,
              {
                width: s * 0.13,
                height: s * 0.3,
                borderRadius: s * 0.06,
                backgroundColor: color,
                top: s * 0.31,
                left: s * 0.43,
                transform: [{rotate: '8deg'}],
              },
            ]}
          />
          <View
            style={[
              styles.abs,
              {
                width: s * 0.12,
                height: s * 0.32,
                borderRadius: s * 0.06,
                backgroundColor: color,
                top: s * 0.56,
                left: s * 0.53,
                transform: [{rotate: '-22deg'}],
              },
            ]}
          />
          <View
            style={[
              styles.abs,
              {
                width: s * 0.12,
                height: s * 0.32,
                borderRadius: s * 0.06,
                backgroundColor: color,
                top: s * 0.56,
                left: s * 0.33,
                transform: [{rotate: '24deg'}],
              },
            ]}
          />
          <View
            style={[
              styles.abs,
              {
                width: s * 0.1,
                height: s * 0.24,
                borderRadius: s * 0.05,
                backgroundColor: color,
                top: s * 0.34,
                left: s * 0.57,
                transform: [{rotate: '-30deg'}],
              },
            ]}
          />
        </View>
      );

    case 'run':
      return (
        <View style={[styles.box, {width: s, height: s}]}>
          <View
            style={[
              styles.abs,
              styles.opacity65,
              {
                width: s * 0.2,
                height: s * 0.09,
                borderRadius: s * 0.045,
                backgroundColor: color,
                top: s * 0.34,
                left: s * 0.08,
              },
            ]}
          />
          <View
            style={[
              styles.abs,
              styles.opacity45,
              {
                width: s * 0.15,
                height: s * 0.09,
                borderRadius: s * 0.045,
                backgroundColor: color,
                top: s * 0.49,
                left: s * 0.05,
              },
            ]}
          />
          <View
            style={[
              styles.abs,
              {
                width: s * 0.22,
                height: s * 0.22,
                borderRadius: s * 0.11,
                backgroundColor: color,
                top: s * 0.1,
                left: s * 0.52,
              },
            ]}
          />
          <View
            style={[
              styles.abs,
              {
                width: s * 0.13,
                height: s * 0.29,
                borderRadius: s * 0.06,
                backgroundColor: color,
                top: s * 0.31,
                left: s * 0.47,
                transform: [{rotate: '22deg'}],
              },
            ]}
          />
          <View
            style={[
              styles.abs,
              {
                width: s * 0.12,
                height: s * 0.32,
                borderRadius: s * 0.06,
                backgroundColor: color,
                top: s * 0.53,
                left: s * 0.57,
                transform: [{rotate: '-38deg'}],
              },
            ]}
          />
          <View
            style={[
              styles.abs,
              {
                width: s * 0.12,
                height: s * 0.3,
                borderRadius: s * 0.06,
                backgroundColor: color,
                top: s * 0.55,
                left: s * 0.29,
                transform: [{rotate: '42deg'}],
              },
            ]}
          />
        </View>
      );

    case 'distance':
      return (
        <View style={[styles.box, {width: s, height: s}]}>
          <View
            style={[
              styles.abs,
              {
                width: s * 0.24,
                height: s * 0.24,
                borderRadius: s * 0.12,
                borderWidth: Math.max(2, s * 0.1),
                borderColor: color,
                left: s * 0.12,
                bottom: s * 0.18,
              },
            ]}
          />
          <View
            style={{
              width: s * 0.42,
              height: Math.max(2, s * 0.1),
              borderRadius: s * 0.05,
              backgroundColor: color,
              transform: [{rotate: '-35deg'}],
            }}
          />
          <View
            style={[
              styles.abs,
              {
                width: s * 0.24,
                height: s * 0.24,
                borderRadius: s * 0.12,
                backgroundColor: color,
                right: s * 0.12,
                top: s * 0.18,
              },
            ]}
          />
        </View>
      );

    case 'time':
      return (
        <View style={[styles.box, {width: s, height: s}]}>
          <View
            style={[
              styles.centered,
              {
                width: s * 0.78,
                height: s * 0.78,
                borderRadius: s * 0.39,
                borderWidth: Math.max(2, s * 0.1),
                borderColor: color,
              },
            ]}>
            <View
              style={[
                styles.abs,
                {
                  width: Math.max(2, s * 0.09),
                  height: s * 0.22,
                  borderRadius: s * 0.05,
                  backgroundColor: color,
                  top: s * 0.14,
                },
              ]}
            />
            <View
              style={[
                styles.abs,
                {
                  width: s * 0.18,
                  height: Math.max(2, s * 0.09),
                  borderRadius: s * 0.05,
                  backgroundColor: color,
                  right: s * 0.15,
                },
              ]}
            />
          </View>
        </View>
      );

    case 'pace':
      return (
        <View style={[styles.box, {width: s, height: s}]}>
          <View
            style={[
              styles.abs,
              styles.noBottomBorder,
              {
                width: s * 0.78,
                height: s * 0.44,
                borderTopLeftRadius: s * 0.4,
                borderTopRightRadius: s * 0.4,
                borderWidth: Math.max(2, s * 0.1),
                borderColor: color,
                top: s * 0.24,
              },
            ]}
          />
          <View
            style={[
              styles.abs,
              {
                width: Math.max(2, s * 0.1),
                height: s * 0.32,
                borderRadius: s * 0.05,
                backgroundColor: color,
                top: s * 0.36,
                transform: [{rotate: '32deg'}],
              },
            ]}
          />
          <View
            style={[
              styles.abs,
              {
                width: s * 0.18,
                height: s * 0.18,
                borderRadius: s * 0.09,
                backgroundColor: color,
                bottom: s * 0.22,
              },
            ]}
          />
        </View>
      );

    case 'calories':
      return (
        <View style={[styles.box, {width: s, height: s}]}>
          <View
            style={[
              styles.caloriesOuter,
              {
                width: s * 0.56,
                height: s * 0.66,
                borderTopLeftRadius: s * 0.35,
                borderTopRightRadius: s * 0.12,
                borderBottomLeftRadius: s * 0.3,
                borderBottomRightRadius: s * 0.3,
                backgroundColor: color,
                paddingBottom: s * 0.1,
              },
            ]}>
            <View
              style={[
                styles.opacity90,
                {
                  width: s * 0.22,
                  height: s * 0.28,
                  borderRadius: s * 0.12,
                  backgroundColor: COLORS.surface,
                },
              ]}
            />
          </View>
        </View>
      );

    case 'elevation':
      return (
        <View style={[styles.box, {width: s, height: s}]}>
          <View
            style={[
              styles.triangleUp,
              styles.abs,
              {
                borderLeftWidth: s * 0.32,
                borderRightWidth: s * 0.32,
                borderBottomWidth: s * 0.54,
                borderBottomColor: color,
                left: s * 0.1,
                bottom: s * 0.2,
              },
            ]}
          />
          <View
            style={[
              styles.triangleUp,
              styles.abs,
              styles.opacity65,
              {
                borderLeftWidth: s * 0.22,
                borderRightWidth: s * 0.22,
                borderBottomWidth: s * 0.38,
                borderBottomColor: color,
                right: s * 0.08,
                bottom: s * 0.2,
              },
            ]}
          />
        </View>
      );

    case 'gps':
      return (
        <View style={[styles.box, {width: s, height: s}]}>
          <View
            style={[
              styles.abs,
              styles.opacity35,
              {
                width: s * 0.78,
                height: s * 0.78,
                borderRadius: s * 0.39,
                borderWidth: Math.max(1.5, s * 0.08),
                borderColor: color,
              },
            ]}
          />
          <View
            style={[
              styles.abs,
              styles.opacity70,
              {
                width: s * 0.5,
                height: s * 0.5,
                borderRadius: s * 0.25,
                borderWidth: Math.max(1.5, s * 0.08),
                borderColor: color,
              },
            ]}
          />
          <View
            style={{
              width: s * 0.22,
              height: s * 0.22,
              borderRadius: s * 0.11,
              backgroundColor: color,
            }}
          />
        </View>
      );

    case 'back':
      return (
        <View style={[styles.box, {width: s, height: s}]}>
          <View
            style={{
              width: s * 0.42,
              height: s * 0.42,
              borderLeftWidth: Math.max(2, s * 0.12),
              borderBottomWidth: Math.max(2, s * 0.12),
              borderColor: color,
              transform: [{rotate: '45deg'}, {translateX: s * 0.07}],
            }}
          />
        </View>
      );

    case 'chevronRight':
      return (
        <View style={[styles.box, {width: s, height: s}]}>
          <View
            style={{
              width: s * 0.36,
              height: s * 0.36,
              borderTopWidth: Math.max(2, s * 0.11),
              borderRightWidth: Math.max(2, s * 0.11),
              borderColor: color,
              transform: [{rotate: '45deg'}, {translateX: -s * 0.05}],
            }}
          />
        </View>
      );

    case 'check':
      return (
        <View style={[styles.box, {width: s, height: s}]}>
          <View
            style={{
              width: s * 0.5,
              height: s * 0.28,
              borderLeftWidth: Math.max(2.5, s * 0.13),
              borderBottomWidth: Math.max(2.5, s * 0.13),
              borderColor: color,
              transform: [{rotate: '-45deg'}, {translateY: -s * 0.06}],
            }}
          />
        </View>
      );

    case 'pause':
      return (
        <View
          style={[
            styles.box,
            styles.row,
            {width: s, height: s, gap: s * 0.16},
          ]}>
          <View
            style={{
              width: s * 0.2,
              height: s * 0.56,
              borderRadius: s * 0.06,
              backgroundColor: color,
            }}
          />
          <View
            style={{
              width: s * 0.2,
              height: s * 0.56,
              borderRadius: s * 0.06,
              backgroundColor: color,
            }}
          />
        </View>
      );

    case 'play':
      return (
        <View style={[styles.box, {width: s, height: s}]}>
          <View
            style={[
              styles.triangleRight,
              {
                borderTopWidth: s * 0.28,
                borderBottomWidth: s * 0.28,
                borderLeftWidth: s * 0.46,
                borderLeftColor: color,
                marginLeft: s * 0.08,
              },
            ]}
          />
        </View>
      );

    case 'stop':
      return (
        <View style={[styles.box, {width: s, height: s}]}>
          <View
            style={{
              width: s * 0.48,
              height: s * 0.48,
              borderRadius: s * 0.08,
              backgroundColor: color,
            }}
          />
        </View>
      );

    case 'trash':
      return (
        <View style={[styles.box, {width: s, height: s}]}>
          <View
            style={{
              width: s * 0.26,
              height: Math.max(2, s * 0.09),
              backgroundColor: color,
              borderRadius: s * 0.04,
              marginBottom: s * 0.04,
            }}
          />
          <View
            style={{
              width: s * 0.62,
              height: Math.max(2, s * 0.09),
              backgroundColor: color,
              borderRadius: s * 0.04,
              marginBottom: s * 0.06,
            }}
          />
          <View
            style={[
              styles.noTopBorder,
              {
                width: s * 0.48,
                height: s * 0.44,
                borderWidth: Math.max(2, s * 0.09),
                borderColor: color,
                borderBottomLeftRadius: s * 0.08,
                borderBottomRightRadius: s * 0.08,
              },
            ]}
          />
        </View>
      );

    case 'shield':
      return (
        <View style={[styles.box, {width: s, height: s}]}>
          <View
            style={[
              styles.centered,
              {
                width: s * 0.58,
                height: s * 0.66,
                borderTopLeftRadius: s * 0.1,
                borderTopRightRadius: s * 0.1,
                borderBottomLeftRadius: s * 0.34,
                borderBottomRightRadius: s * 0.34,
                borderWidth: Math.max(2, s * 0.1),
                borderColor: color,
              },
            ]}>
            <View
              style={{
                width: s * 0.16,
                height: s * 0.16,
                borderRadius: s * 0.08,
                backgroundColor: color,
              }}
            />
          </View>
        </View>
      );

    case 'history':
      return (
        <View style={[styles.box, {width: s, height: s}]}>
          <View
            style={{
              width: s * 0.68,
              height: Math.max(2, s * 0.11),
              borderRadius: s * 0.05,
              backgroundColor: color,
              marginBottom: s * 0.13,
            }}
          />
          <View
            style={{
              width: s * 0.68,
              height: Math.max(2, s * 0.11),
              borderRadius: s * 0.05,
              backgroundColor: color,
              marginBottom: s * 0.13,
            }}
          />
          <View
            style={[
              styles.alignSelfStart,
              {
                width: s * 0.46,
                height: Math.max(2, s * 0.11),
                borderRadius: s * 0.05,
                backgroundColor: color,
                marginLeft: s * 0.16,
              },
            ]}
          />
        </View>
      );

    case 'pin':
      return (
        <View style={[styles.box, {width: s, height: s}]}>
          <View
            style={[
              styles.centered,
              {
                width: s * 0.5,
                height: s * 0.5,
                borderRadius: s * 0.25,
                backgroundColor: color,
                marginTop: -s * 0.1,
              },
            ]}>
            <View
              style={{
                width: s * 0.18,
                height: s * 0.18,
                borderRadius: s * 0.09,
                backgroundColor: COLORS.surface,
              }}
            />
          </View>
          <View
            style={[
              styles.triangleDown,
              {
                borderLeftWidth: s * 0.15,
                borderRightWidth: s * 0.15,
                borderTopWidth: s * 0.24,
                borderTopColor: color,
                marginTop: -s * 0.06,
              },
            ]}
          />
        </View>
      );

    case 'alert':
      return (
        <View style={[styles.box, {width: s, height: s}]}>
          <View
            style={[
              styles.centered,
              {
                width: s * 0.76,
                height: s * 0.76,
                borderRadius: s * 0.38,
                borderWidth: Math.max(2, s * 0.1),
                borderColor: color,
              },
            ]}>
            <View
              style={{
                width: Math.max(2, s * 0.1),
                height: s * 0.24,
                borderRadius: s * 0.05,
                backgroundColor: color,
                marginBottom: s * 0.06,
              }}
            />
            <View
              style={{
                width: Math.max(2.5, s * 0.11),
                height: Math.max(2.5, s * 0.11),
                borderRadius: s * 0.06,
                backgroundColor: color,
              }}
            />
          </View>
        </View>
      );

    case 'menu':
      return (
        <View style={[styles.box, {width: s, height: s, justifyContent: 'space-evenly', paddingVertical: s * 0.18}]}>
          <View style={{width: s * 0.72, height: Math.max(2, s * 0.1), borderRadius: s * 0.05, backgroundColor: color}} />
          <View style={{width: s * 0.56, height: Math.max(2, s * 0.1), borderRadius: s * 0.05, backgroundColor: color, alignSelf: 'flex-start', marginLeft: s * 0.14}} />
          <View style={{width: s * 0.72, height: Math.max(2, s * 0.1), borderRadius: s * 0.05, backgroundColor: color}} />
        </View>
      );

    case 'close':
      return (
        <View style={[styles.box, {width: s, height: s}]}>
          <View
            style={[
              styles.abs,
              {
                width: s * 0.72,
                height: Math.max(2, s * 0.11),
                borderRadius: s * 0.05,
                backgroundColor: color,
                transform: [{rotate: '45deg'}],
              },
            ]}
          />
          <View
            style={[
              styles.abs,
              {
                width: s * 0.72,
                height: Math.max(2, s * 0.11),
                borderRadius: s * 0.05,
                backgroundColor: color,
                transform: [{rotate: '-45deg'}],
              },
            ]}
          />
        </View>
      );

    case 'user':
      return (
        <View style={[styles.box, {width: s, height: s}]}>
          <View
            style={[
              styles.abs,
              {
                width: s * 0.34,
                height: s * 0.34,
                borderRadius: s * 0.17,
                borderWidth: Math.max(1.8, s * 0.09),
                borderColor: color,
                top: s * 0.12,
              },
            ]}
          />
          <View
            style={[
              styles.abs,
              {
                width: s * 0.66,
                height: s * 0.32,
                borderTopLeftRadius: s * 0.33,
                borderTopRightRadius: s * 0.33,
                borderWidth: Math.max(1.8, s * 0.09),
                borderBottomWidth: 0,
                borderColor: color,
                bottom: s * 0.1,
              },
            ]}
          />
        </View>
      );

    case 'home':
      return (
        <View style={[styles.box, {width: s, height: s}]}>
          <View
            style={[
              styles.abs,
              {
                width: s * 0.56,
                height: s * 0.56,
                borderTopWidth: Math.max(1.8, s * 0.09),
                borderLeftWidth: Math.max(1.8, s * 0.09),
                borderColor: color,
                top: s * 0.18,
                transform: [{rotate: '45deg'}],
              },
            ]}
          />
          <View
            style={[
              styles.abs,
              {
                width: s * 0.58,
                height: s * 0.42,
                borderLeftWidth: Math.max(1.8, s * 0.09),
                borderRightWidth: Math.max(1.8, s * 0.09),
                borderBottomWidth: Math.max(1.8, s * 0.09),
                borderBottomLeftRadius: s * 0.08,
                borderBottomRightRadius: s * 0.08,
                borderColor: color,
                bottom: s * 0.12,
              },
            ]}
          />
        </View>
      );
  }
};

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  abs: {
    position: 'absolute',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  alignSelfStart: {
    alignSelf: 'flex-start',
  },
  noBottomBorder: {
    borderBottomWidth: 0,
  },
  noTopBorder: {
    borderTopWidth: 0,
  },
  opacity35: {
    opacity: 0.35,
  },
  opacity45: {
    opacity: 0.45,
  },
  opacity65: {
    opacity: 0.65,
  },
  opacity70: {
    opacity: 0.7,
  },
  opacity90: {
    opacity: 0.9,
  },
  caloriesOuter: {
    transform: [{rotate: '-15deg'}],
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  triangleUp: {
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  triangleRight: {
    width: 0,
    height: 0,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  triangleDown: {
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

export default AppIcon;

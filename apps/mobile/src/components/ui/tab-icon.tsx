/**
 * TabIcon — renders SVG-path tab bar icons matching the mockup.
 * Uses react-native built-in View + manually drawn paths via inline SVG strings
 * converted to React Native compatible shapes via simple View-based icons.
 *
 * No icon library dependency — keeps bundle lean and matches mockup exactly.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface TabIconProps {
  routeName: string;
  color: string;
  focused: boolean;
}

const ICON_SIZE = 22;

export function TabIcon({ routeName, color }: TabIconProps) {
  const props = { width: ICON_SIZE, height: ICON_SIZE, viewBox: '0 0 24 24' };

  switch (routeName) {
    case 'Home':
      return (
        <Svg {...props} fill="none" stroke={color} strokeWidth={1.8}>
          <Path d="M12 3l9 8h-3v9h-4v-6h-4v6H6v-9H3z" />
        </Svg>
      );
    case 'Articles':
      return (
        <Svg {...props} fill="none" stroke={color} strokeWidth={1.8}>
          <Path d="M4 4h16v3H4zM4 11h16v3H4zM4 18h10v3H4z" />
        </Svg>
      );
    case 'KhaiTri':
      return (
        <Svg {...props} fill="none" stroke={color} strokeWidth={1.8}>
          <Circle cx={12} cy={12} r={10} />
          <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <Circle cx={12} cy={17} r={0.5} fill={color} />
        </Svg>
      );
    case 'Community':
      return (
        <Svg {...props} fill="none" stroke={color} strokeWidth={1.8}>
          <Circle cx={12} cy={12} r={9} />
          <Circle cx={12} cy={12} r={3} fill={color} />
        </Svg>
      );
    case 'Profile':
      return (
        <Svg {...props} fill="none" stroke={color} strokeWidth={1.8}>
          <Circle cx={12} cy={8} r={4} />
          <Path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
        </Svg>
      );
    default:
      return <View style={styles.fallback} />;
  }
}

const styles = StyleSheet.create({
  fallback: { width: ICON_SIZE, height: ICON_SIZE },
});

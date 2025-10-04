declare module 'react-native-safe-area-context' {
  import { ReactNode } from 'react';
  import { ViewStyle } from 'react-native';

  export interface EdgeInsets {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }

  export interface SafeAreaInsets {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }

  export interface SafeAreaProviderProps {
    children: ReactNode;
    initialMetrics?: EdgeInsets;
  }

  export interface SafeAreaViewProps {
    children: ReactNode;
    style?: ViewStyle;
    edges?: ('top' | 'right' | 'bottom' | 'left')[];
  }

  export function SafeAreaProvider(props: SafeAreaProviderProps): JSX.Element;
  export function SafeAreaView(props: SafeAreaViewProps): JSX.Element;
  export function useSafeAreaInsets(): EdgeInsets;
  export function useSafeAreaFrame(): { x: number; y: number; width: number; height: number };
}

import { View, Animated, StyleSheet, ViewStyle } from 'react-native'
import { useEffect, useRef } from 'react'
import { Colors } from '../../constants/colors'

interface SkeletonLoaderProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: ViewStyle
}

export default function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [opacity])

  const widthStyle = typeof width === 'string' ? { flex: 1 } : { width }

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          height,
          borderRadius,
          opacity,
          ...widthStyle,
        },
        style,
      ]}
    />
  )
}

export function TaskCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <SkeletonLoader width={60} height={20} borderRadius={8} />
        <SkeletonLoader width={80} height={16} borderRadius={4} />
      </View>
      <SkeletonLoader width="90%" height={24} borderRadius={4} />
      <SkeletonLoader width="70%" height={16} borderRadius={4} />
    </View>
  )
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
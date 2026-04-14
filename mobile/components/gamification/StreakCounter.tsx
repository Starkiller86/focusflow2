import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/colors'

interface StreakCounterProps {
  currentStreak: number
  longestStreak: number
}

export default function StreakCounter({ currentStreak, longestStreak }: StreakCounterProps) {
  return (
    <View style={styles.container}>
      <View style={styles.streakRow}>
        <Ionicons name="flame" size={24} color={Colors.accent} />
        <Text style={styles.currentStreak}>{currentStreak}</Text>
        <Text style={styles.label}>días de racha</Text>
      </View>
      <View style={styles.bestRow}>
        <Text style={styles.bestLabel}>Mejor racha:</Text>
        <Text style={styles.bestValue}>{longestStreak} días</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  currentStreak: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.accent,
    marginLeft: 8,
    marginRight: 4,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bestLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bestValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
})
import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../../constants/colors'
import { calcLevel } from '../../lib/gamification'

interface LevelBarProps {
  points: number
  level: number
}

export default function LevelBar({ points, level }: LevelBarProps) {
  const currentLevelXp = Math.pow(((level - 1) * 100), 2) / 100
  const nextLevelXp = Math.pow((level) * 100, 2) / 100
  const progress = ((points - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.levelText}>Nivel {level}</Text>
        <Text style={styles.xpText}>{points} XP</Text>
      </View>
      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: `${clampedProgress}%` }]} />
      </View>
      <Text style={styles.progressText}>
        {Math.round(clampedProgress)}% para nivel {level + 1}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  xpText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  barContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'right',
  },
})
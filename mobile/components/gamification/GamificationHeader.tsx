import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/colors'
import { useGamificationStore } from '../../stores/gamificationStore'
import { getLevelTitle } from '../../lib/gamification'

interface GamificationHeaderProps {
  compact?: boolean
}

export default function GamificationHeader({ compact = false }: GamificationHeaderProps) {
  const { data } = useGamificationStore()

  if (!data) {
    return null
  }

  const levelTitle = getLevelTitle(data.level)
  const xpForNextLevel = Math.pow((data.level) * 100, 2) / 100
  const xpForCurrentLevel = Math.pow(((data.level - 1) * 100), 2) / 100
  const progress = ((data.points - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactLevelBadge}>
          <Text style={styles.compactLevelText}>Nivel {data.level}</Text>
        </View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactPoints}>{data.points} pts</Text>
          {data.current_streak > 0 && (
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={12} color={Colors.accent} />
              <Text style={styles.streakText}>{data.current_streak}</Text>
            </View>
          )}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.levelTitle}>{levelTitle}</Text>
          <Text style={styles.level}>Nivel {data.level}</Text>
        </View>
        <View style={styles.pointsContainer}>
          <Text style={styles.points}>{data.points}</Text>
          <Text style={styles.pointsLabel}>puntos</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
      </View>
      <Text style={styles.progressText}>
        {Math.round(progress)}% para nivel {data.level + 1}
      </Text>

      {data.current_streak > 0 && (
        <View style={styles.streakContainer}>
          <Ionicons name="flame" size={20} color={Colors.accent} />
          <Text style={styles.streakMain}>{data.current_streak} días</Text>
          <Text style={styles.streakLabel}> de racha</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  level: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  points: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.secondary,
  },
  pointsLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'right',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
  },
  streakMain: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.accent,
    marginLeft: 6,
  },
  streakLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactLevelBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  compactLevelText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  compactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  compactPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent,
    marginLeft: 2,
  },
})
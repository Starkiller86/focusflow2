import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../../constants/colors'

interface PriorityBadgeProps {
  priority: 'alta' | 'media' | 'baja'
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const colors = {
    alta: Colors.priorityHigh,
    media: Colors.priorityMedium,
    baja: Colors.priorityLow,
  }

  const labels = {
    alta: 'Alta',
    media: 'Media',
    baja: 'Baja',
  }

  return (
    <View style={[styles.badge, { backgroundColor: colors[priority] + '20' }]}>
      <Text style={[styles.text, { color: colors[priority] }]}>
        {labels[priority]}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
})
import { View, Text, StyleSheet } from 'react-native'
import { Colors, PetEmojis } from '../../constants/colors'
import { Pet } from '../../stores/petStore'

interface PetDisplayProps {
  pet: Pet
  size?: 'small' | 'medium' | 'large'
}

export default function PetDisplay({ pet, size = 'medium' }: PetDisplayProps) {
  const getEmoji = () => PetEmojis[pet.species] || '🐾'
  
  const getMood = () => {
    if (pet.happiness >= 70) return '😊'
    if (pet.happiness >= 40) return '😐'
    return '😢'
  }

  const sizes = {
    small: { emoji: 32, container: 48 },
    medium: { emoji: 64, container: 96 },
    large: { emoji: 96, container: 140 },
  }

  const currentSize = sizes[size]

  return (
    <View style={[styles.container, { width: currentSize.container, height: currentSize.container }]}>
      <Text style={[styles.emoji, { fontSize: currentSize.emoji }]}>{getEmoji()}</Text>
      <View style={styles.moodBubble}>
        <Text style={styles.mood}>{getMood()}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
  moodBubble: {
    position: 'absolute',
    bottom: -4,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mood: {
    fontSize: 14,
  },
})
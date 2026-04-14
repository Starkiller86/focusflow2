import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/colors'

interface AccessoryOverlayProps {
  pet: {
    accessory_hat?: string | null
    accessory_glasses?: string | null
    accessory_cape?: string | null
  }
  onEquip?: (type: 'hat' | 'glasses' | 'cape', item: string) => void
}

export default function AccessoryOverlay({ pet, onEquip }: AccessoryOverlayProps) {
  const accessories = {
    hat: ['🎩', '👑', '🧢', '🎓'],
    glasses: ['👓', '🕶️', '🥽', '🔭'],
    cape: ['🦸', '🧣', '🎭', '👘'],
  }

  const equipped = {
    hat: pet.accessory_hat,
    glasses: pet.accessory_glasses,
    cape: pet.accessory_cape,
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accesorios</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sombrero</Text>
        <View style={styles.itemsRow}>
          {accessories.hat.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.item, equipped.hat === item && styles.itemEquipped]}
              onPress={() => onEquip?.('hat', item)}
            >
              <Text style={styles.itemEmoji}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gafas</Text>
        <View style={styles.itemsRow}>
          {accessories.glasses.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.item, equipped.glasses === item && styles.itemEquipped]}
              onPress={() => onEquip?.('glasses', item)}
            >
              <Text style={styles.itemEmoji}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Capa</Text>
        <View style={styles.itemsRow}>
          {accessories.cape.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.item, equipped.cape === item && styles.itemEquipped]}
              onPress={() => onEquip?.('cape', item)}
            >
              <Text style={styles.itemEmoji}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  itemsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  item: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemEquipped: {
    backgroundColor: Colors.primary + '20',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  itemEmoji: {
    fontSize: 24,
  },
})
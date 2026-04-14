import { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../stores/authStore'
import { usePetStore } from '../../stores/petStore'
import { Colors, PetEmojis } from '../../constants/colors'

const SPECIES_LIST = [
  { key: 'perro', emoji: '🐕', label: 'Perro' },
  { key: 'gato', emoji: '🐈', label: 'Gato' },
  { key: 'loro', emoji: '🦜', label: 'Loro' },
  { key: 'lobo', emoji: '🐺', label: 'Lobo' },
  { key: 'toro', emoji: '🐂', label: 'Toro' },
  { key: 'vaca', emoji: '🐄', label: 'Vaca' },
  { key: 'pez', emoji: '🐟', label: 'Pez' },
  { key: 'capibara', emoji: '🦫', label: 'Capibara' },
  { key: 'panda', emoji: '🐼', label: 'Panda' },
]

export default function PetSetupScreen() {
  const { user } = useAuthStore()
  const { createPet } = usePetStore()
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null)
  const [petName, setPetName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdopt = async () => {
    if (!user) return
    
    if (!selectedSpecies) {
      Alert.alert('Error', 'Selecciona una mascota')
      return
    }
    
    if (!petName.trim()) {
      Alert.alert('Error', 'Ingresa el nombre de tu mascota')
      return
    }

    setLoading(true)
    try {
      await createPet(user.id, petName.trim(), selectedSpecies)
      router.replace('/(tabs)')
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la mascota')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Elige tu Mascota</Text>
      <Text style={styles.subtitle}>
        Tu amigo te acompañará en tu camino hacia la productividad
      </Text>

      <View style={styles.grid}>
        {SPECIES_LIST.map(species => (
          <TouchableOpacity
            key={species.key}
            style={[
              styles.speciesCard,
              selectedSpecies === species.key && styles.speciesCardSelected,
            ]}
            onPress={() => setSelectedSpecies(species.key)}
          >
            <Text style={styles.speciesEmoji}>{species.emoji}</Text>
            <Text style={[
              styles.speciesLabel,
              selectedSpecies === species.key && styles.speciesLabelSelected,
            ]}>
              {species.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.nameSection}>
        <Text style={styles.nameLabel}>Nombre de tu mascota</Text>
        <TextInput
          style={styles.nameInput}
          placeholder="¿Cómo se llama?"
          value={petName}
          onChangeText={setPetName}
          maxLength={20}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.adoptBtn,
          (!selectedSpecies || !petName.trim() || loading) && styles.adoptBtnDisabled,
        ]}
        onPress={handleAdopt}
        disabled={!selectedSpecies || !petName.trim() || loading}
      >
        <Text style={styles.adoptBtnText}>
          {loading ? 'Adoptando...' : 'Adoptar Mascota'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  speciesCard: {
    width: 100,
    height: 100,
    backgroundColor: Colors.white,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  speciesCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  speciesEmoji: {
    fontSize: 36,
  },
  speciesLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  speciesLabelSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  nameSection: {
    marginBottom: 24,
  },
  nameLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  adoptBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  adoptBtnDisabled: {
    opacity: 0.5,
  },
  adoptBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
})
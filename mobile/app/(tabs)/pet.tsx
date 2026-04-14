import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Modal } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { usePetStore } from '../../stores/petStore'
import { Colors, PetEmojis } from '../../constants/colors'
import * as Haptics from 'expo-haptics'
import PetDisplay from '../../components/pet/PetDisplay'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function PetScreen() {
  const { user } = useAuthStore()
  const { pet, fetch, updatePet, petInteract } = usePetStore()
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [gamesToday, setGamesToday] = useState(0)
  const [showMiniGame, setShowMiniGame] = useState(false)

  useEffect(() => {
    if (user) {
      fetch(user.id)
      loadGamesCount()
    }
  }, [user])

  const loadGamesCount = async () => {
    const today = new Date().toISOString().split('T')[0]
    const count = await AsyncStorage.getItem(`pet_games_${today}`)
    setGamesToday(parseInt(count || '0'))
  }

  const incrementGames = async () => {
    const today = new Date().toISOString().split('T')[0]
    const newCount = gamesToday + 1
    await AsyncStorage.setItem(`pet_games_${today}`, newCount.toString())
    setGamesToday(newCount)
  }

  const handleCaress = async () => {
    if (!user) return
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await petInteract(user.id, 'caress')
  }

  const handleFeed = async () => {
    if (!user) return
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    await petInteract(user.id, 'feed')
    Alert.alert('¡Delicioso!', 'Tu mascota disfruta de la comida')
  }

  const handlePlay = async () => {
    if (!user) return
    
    if (gamesToday >= 3) {
      Alert.alert('Límite alcanzado', 'Ya jugaste 3 veces hoy. Vuelve mañana.')
      return
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    await petInteract(user.id, 'play')
    await incrementGames()
    Alert.alert('¡Diversión!', 'Tu mascota recibió +5 XP')
  }

  const handleSaveName = async () => {
    if (!user || !newName.trim()) return
    await updatePet(user.id, { name: newName.trim() })
    setEditingName(false)
    setNewName('')
  }

  const handleEditName = () => {
    if (!pet) return
    setNewName(pet.name)
    setEditingName(true)
  }

  const getMood = () => {
    if (!pet) return ' 😐'
    if (pet.happiness >= 70) return ' 😊'
    if (pet.happiness >= 40) return ' 😐'
    return ' 😢'
  }

  if (!pet) {
    return (
      <View style={styles.container}>
        <Text style={styles.noPet}>No tienes mascota aún</Text>
        <TouchableOpacity onPress={() => router.push('/onboarding/pet-setup')}>
          <Text style={styles.setupLink}>Configurar mascota</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mi Mascota</Text>

      <View style={styles.petCard}>
        <PetDisplay pet={pet} size="large" />
        
        <Text style={styles.petName}>{pet.name}</Text>
        <Text style={styles.petMood}>Nivel {pet.level} {getMood()}</Text>

        <TouchableOpacity onPress={handleEditName}>
          <Text style={styles.editName}>Editar nombre</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>XP</Text>
          <Text style={styles.statValue}>{pet.xp}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Felicidad</Text>
          <View style={styles.happinessBar}>
            <View style={[styles.happinessFill, { width: `${pet.happiness}%` }]} />
          </View>
          <Text style={styles.happinessText}>{pet.happiness}%</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleCaress}>
          <Ionicons name="hand-left" size={24} color={Colors.primary} />
          <Text style={styles.actionText}>Acariciar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleFeed}>
          <Ionicons name="restaurant" size={24} color={Colors.accent} />
          <Text style={styles.actionText}>Alimentar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handlePlay}>
          <Ionicons name="game-controller" size={24} color={Colors.secondary} />
          <Text style={styles.actionText}>Jugar ({3 - gamesToday})</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={editingName} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar nombre</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Nombre de tu mascota"
              maxLength={20}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setEditingName(false)}>
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={handleSaveName}>
                <Text style={styles.modalBtnTextPrimary}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 50,
  },
  noPet: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
  setupLink: {
    fontSize: 16,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 24,
  },
  petCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  petName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
  },
  petMood: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  editName: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 8,
  },
  statsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  stat: {
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  happinessBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginTop: 4,
    overflow: 'hidden',
  },
  happinessFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 6,
  },
  happinessText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalBtnText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  modalBtnPrimary: {
    backgroundColor: Colors.primary,
  },
  modalBtnTextPrimary: {
    color: Colors.white,
    fontWeight: '600',
  },
})
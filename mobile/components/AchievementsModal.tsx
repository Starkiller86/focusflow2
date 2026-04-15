import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../constants/colors'
import {
  ACHIEVEMENTS,
  getUnlockedAchievements,
  Achievement,
} from '../lib/achievements'

interface AchievementsModalProps {
  visible: boolean
  onClose: () => void
  newAchievements?: Achievement[]
}

export default function AchievementsModal({
  visible,
  onClose,
  newAchievements = [],
}: AchievementsModalProps) {
  const [unlockedIds, setUnlockedIds] = useState<string[]>([])

  useEffect(() => {
    if (visible) {
      loadUnlocked()
    }
  }, [visible])

  const loadUnlocked = async () => {
    const ids = await getUnlockedAchievements()
    setUnlockedIds(ids)
  }

  const isUnlocked = (id: string) => unlockedIds.includes(id)
  const isNew = (id: string) => newAchievements.some((a) => a.id === id)

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Logros</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {newAchievements.length > 0 && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>
                ¡{newAchievements.length} nuevo{newAchievements.length > 1 ? 's' : ''} logro
                {newAchievements.length > 1 ? 's' : ''} desbloqueado
                {newAchievements.length > 1 ? 's' : ''}! 🎉
              </Text>
            </View>
          )}

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {ACHIEVEMENTS.map((achievement) => {
                const unlocked = isUnlocked(achievement.id)
                const isNewAchievement = isNew(achievement.id)

                return (
                  <View
                    key={achievement.id}
                    style={[
                      styles.card,
                      unlocked ? styles.cardUnlocked : styles.cardLocked,
                      isNewAchievement && styles.cardNew,
                    ]}
                  >
                    <Text style={styles.icon}>{achievement.icono}</Text>
                    <Text
                      style={[
                        styles.name,
                        !unlocked && styles.textLocked,
                      ]}
                    >
                      {achievement.nombre}
                    </Text>
                    <Text
                      style={[
                        styles.description,
                        !unlocked && styles.textLocked,
                      ]}
                      numberOfLines={2}
                    >
                      {achievement.descripcion}
                    </Text>
                    {!unlocked && (
                      <View style={styles.lockedOverlay}>
                        <Ionicons name="lock-closed" size={20} color={Colors.textSecondary} />
                      </View>
                    )}
                  </View>
                )
              })}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  newBadge: {
    backgroundColor: Colors.success + '20',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  newBadgeText: {
    color: Colors.success,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  cardUnlocked: {
    backgroundColor: Colors.white,
  },
  cardLocked: {
    backgroundColor: '#F3F4F6',
  },
  cardNew: {
    borderWidth: 2,
    borderColor: Colors.success,
  },
  icon: {
    fontSize: 36,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  textLocked: {
    color: '#9CA3AF',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  closeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  closeBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
})

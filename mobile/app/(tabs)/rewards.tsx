import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, FlatList, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { useGamificationStore } from '../../stores/gamificationStore'
import { useRewardStore, Reward } from '../../stores/rewardStore'
import { Colors } from '../../constants/colors'
import GamificationHeader from '../../components/gamification/GamificationHeader'
import * as Haptics from 'expo-haptics'

export default function RewardsScreen() {
  const { user } = useAuthStore()
  const { data: gamData, fetch: fetchGam } = useGamificationStore()
  const { rewards, userRewards, fetchRewards, fetchUserRewards, redeemReward, hasRedeemed } = useRewardStore()
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)

  useEffect(() => {
    if (user) {
      fetchRewards()
      fetchUserRewards(user.id)
      fetchGam(user.id)
    }
  }, [user])

  const handleRedeem = (reward: Reward) => {
    if (!user) return
    
    if (hasRedeemed(reward.id)) {
      Alert.alert('Info', 'Ya has canjeado esta recompensa')
      return
    }

    if ((gamData?.points || 0) < reward.cost) {
      Alert.alert('Puntos insuficientes', `Necesitas ${reward.cost} puntos para canjear esta recompensa`)
      return
    }

    setSelectedReward(reward)
    setShowConfirm(true)
  }

  const confirmRedeem = async () => {
    if (!user || !selectedReward) return

    const success = await redeemReward(user.id, selectedReward.id, selectedReward.cost)
    
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    await fetchGam(user.id)
    await fetchUserRewards(user.id)
    setShowConfirm(false)
    
    if (success) {
      Alert.alert('¡Felicidades!', `Canjeaste ${selectedReward.name} por ${selectedReward.cost} puntos`)
    } else {
      Alert.alert('Error', 'No se pudo canjear la recompensa')
    }
    setSelectedReward(null)
  }

  const renderReward = ({ item }: { item: Reward }) => {
    const redeemed = hasRedeemed(item.id)
    const canAfford = (gamData?.points || 0) >= item.cost

    return (
      <View style={styles.rewardCard}>
        <View style={styles.rewardIcon}>
          <Ionicons name="gift" size={32} color={Colors.primary} />
        </View>
        <View style={styles.rewardInfo}>
          <Text style={styles.rewardName}>{item.name}</Text>
          <Text style={styles.rewardDesc}>{item.description}</Text>
          <View style={styles.rewardCost}>
            <Text style={styles.costLabel}>{item.cost} pts</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.redeemBtn,
            (redeemed || !canAfford) && styles.redeemBtnDisabled,
          ]}
          onPress={() => handleRedeem(item)}
          disabled={redeemed || !canAfford}
        >
          <Text style={styles.redeemBtnText}>
            {redeemed ? 'Canjeado' : 'Canjear'}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recompensas</Text>
        <Text style={styles.pointsDisplay}>{(gamData?.points || 0)} pts</Text>
      </View>

      <GamificationHeader />

      <FlatList
        data={rewards}
        keyExtractor={item => item.id}
        renderItem={renderReward}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="gift-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No hay recompensas disponibles</Text>
          </View>
        }
      />

      <Modal visible={showConfirm} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar canje</Text>
            <Text style={styles.modalText}>
              ¿Canjeear {selectedReward?.name} por {selectedReward?.cost} puntos?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={confirmRedeem}
              >
                <Text style={styles.modalConfirmText}>Canjear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  pointsDisplay: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.secondary,
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  rewardCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  rewardDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rewardCost: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  costLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent,
  },
  redeemBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  redeemBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  redeemBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
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
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalCancel: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  modalConfirm: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: Colors.white,
    fontWeight: '600',
  },
})
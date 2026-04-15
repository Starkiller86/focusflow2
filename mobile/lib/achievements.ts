import AsyncStorage from '@react-native-async-storage/async-storage'

export interface Achievement {
  id: string
  nombre: string
  descripcion: string
  icono: string
  condicion: (stats: AchievementStats) => boolean
}

export interface AchievementStats {
  tasks_completed: number
  current_streak: number
  level: number
}

const STORAGE_KEY_ACHIEVEMENTS = 'unlocked_achievements'

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_task',
    nombre: 'Primera tarea',
    descripcion: 'Completaste tu primera tarea',
    icono: '🎯',
    condicion: (stats) => stats.tasks_completed >= 1,
  },
  {
    id: 'streak_3',
    nombre: 'Racha de 3',
    descripcion: '3 días seguidos completando tareas',
    icono: '🔥',
    condicion: (stats) => stats.current_streak >= 3,
  },
  {
    id: 'tasks_10',
    nombre: 'Productivo',
    descripcion: 'Completaste 10 tareas',
    icono: '⭐',
    condicion: (stats) => stats.tasks_completed >= 10,
  },
  {
    id: 'level_5',
    nombre: 'En ascenso',
    descripcion: 'Alcanzaste el nivel 5',
    icono: '🚀',
    condicion: (stats) => stats.level >= 5,
  },
  {
    id: 'streak_7',
    nombre: 'Una semana',
    descripcion: '7 días de racha consecutivos',
    icono: '🏆',
    condicion: (stats) => stats.current_streak >= 7,
  },
  {
    id: 'tasks_25',
    nombre: 'Dedicado',
    descripcion: 'Completaste 25 tareas',
    icono: '💪',
    condicion: (stats) => stats.tasks_completed >= 25,
  },
  {
    id: 'level_10',
    nombre: 'Veterano',
    descripcion: 'Alcanzaste el nivel 10',
    icono: '🎖️',
    condicion: (stats) => stats.level >= 10,
  },
  {
    id: 'streak_14',
    nombre: 'Quincena',
    descripcion: '14 días de racha',
    icono: '💎',
    condicion: (stats) => stats.current_streak >= 14,
  },
]

export async function getUnlockedAchievements(): Promise<string[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_ACHIEVEMENTS)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export async function checkAndUnlockAchievements(
  stats: AchievementStats
): Promise<Achievement[]> {
  try {
    const unlockedIds = await getUnlockedAchievements()
    const newlyUnlocked: Achievement[] = []

    for (const achievement of ACHIEVEMENTS) {
      if (!unlockedIds.includes(achievement.id) && achievement.condicion(stats)) {
        newlyUnlocked.push(achievement)
        unlockedIds.push(achievement.id)
      }
    }

    if (newlyUnlocked.length > 0) {
      await AsyncStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(unlockedIds))
    }

    return newlyUnlocked
  } catch {
    return []
  }
}

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}

export function getAllAchievements(): Achievement[] {
  return ACHIEVEMENTS
}

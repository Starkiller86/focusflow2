import { supabase } from './supabase'

export const POINTS = {
  alta: 100,
  media: 50,
  baja: 20,
  bonus_deadline: 25,
  bonus_streak: 10,
  focus_multiplier: 1.5,
}

export function calcLevel(points: number): number {
  return Math.min(Math.floor(Math.sqrt(points / 100)) + 1, 100)
}

export function getLevelTitle(level: number): string {
  if (level <= 10)  return 'Aprendiz'
  if (level <= 25)  return 'Explorador'
  if (level <= 50)  return 'Especialista'
  if (level <= 75)  return 'Experto'
  return 'Maestro'
}

export async function completeTask(
  userId: string,
  taskId: string,
  priority: 'alta' | 'media' | 'baja',
  dueDate: Date | null,
  focusMode = false
) {
  let pts = POINTS[priority]
  if (dueDate && new Date() < dueDate) pts += POINTS.bonus_deadline

  const { data: gam } = await supabase
    .from('gamification')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!gam) return

  // Calcular streak
  const last = gam.last_task_completed_at ? new Date(gam.last_task_completed_at) : null
  const now = new Date()
  const diffDays = last ? Math.floor((now.getTime() - last.getTime()) / 86400000) : 999
  let streak = gam.current_streak

  if (diffDays === 1) {
    streak += 1
    pts += POINTS.bonus_streak
  } else if (diffDays > 1) {
    streak = 1
  }
  // si diffDays === 0 no cambia el streak

  if (focusMode) pts = Math.round(pts * POINTS.focus_multiplier)

  const newPoints = gam.points + pts
  const newLevel  = calcLevel(newPoints)
  const levelUp   = newLevel > gam.level

  await supabase.from('gamification').update({
    points: newPoints,
    level: newLevel,
    current_streak: streak,
    longest_streak: Math.max(streak, gam.longest_streak),
    last_task_completed_at: now.toISOString(),
  }).eq('user_id', userId)

  await supabase.from('tasks')
    .update({ status: 'completada' }).eq('id', taskId)

  const { data: currentPet } = await supabase
    .from('pets').select('xp').eq('user_id', userId).single()
  
  if (currentPet) {
    await supabase.from('pets')
      .update({ xp: currentPet.xp + 10 })
      .eq('user_id', userId)
  }

  return { pts, levelUp, newLevel }
}
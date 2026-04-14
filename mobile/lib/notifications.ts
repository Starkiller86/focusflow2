import * as Notifications from 'expo-notifications'

export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export async function scheduleTaskReminder(taskTitle: string, dueDate: Date) {
  const triggerDate = new Date(dueDate.getTime() - 60 * 60 * 1000)
  if (triggerDate < new Date()) return

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Tarea próxima a vencer',
      body: `"${taskTitle}" vence en 1 hora`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  })
}

export async function suppressAllNotifications() {
  await Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: false,
      shouldShowList: false,
    }),
  })
}
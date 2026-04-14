import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { useFonts, Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito'
import * as SplashScreen from 'expo-splash-screen'
import { useAuthStore } from '../stores/authStore'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Nunito_400Regular, Nunito_700Bold })
  const loadSession = useAuthStore(s => s.loadSession)

  useEffect(() => {
    loadSession().then(() => {
      if (fontsLoaded) SplashScreen.hideAsync()
    })
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding/pet-setup" />
      <Stack.Screen name="task/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="task/[id]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="focus/index" options={{ presentation: 'fullScreenModal' }} />
    </Stack>
  )
}
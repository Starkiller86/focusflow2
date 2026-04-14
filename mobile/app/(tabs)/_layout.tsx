import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/colors'

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: Colors.primary,
      tabBarStyle: {
        borderTopWidth: 0,
        elevation: 20,
        shadowOpacity: 0.1,
        height: 64,
        paddingBottom: 8,
      },
      headerShown: false,
    }}>
      <Tabs.Screen name="index"   options={{ title: 'Inicio',     tabBarIcon: ({ color }) => <Ionicons name="home"        size={24} color={color} /> }} />
      <Tabs.Screen name="tasks"   options={{ title: 'Tareas',     tabBarIcon: ({ color }) => <Ionicons name="checkmark-circle" size={24} color={color} /> }} />
      <Tabs.Screen name="pet"     options={{ title: 'Mascota',    tabBarIcon: ({ color }) => <Ionicons name="heart"       size={24} color={color} /> }} />
      <Tabs.Screen name="rewards" options={{ title: 'Rewards',    tabBarIcon: ({ color }) => <Ionicons name="gift"        size={24} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil',     tabBarIcon: ({ color }) => <Ionicons name="person"      size={24} color={color} /> }} />
    </Tabs>
  )
}
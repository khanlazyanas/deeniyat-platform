import { Tabs } from 'expo-router';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Upar ka default white header gayab!
        tabBarStyle: {
          backgroundColor: '#030612', // Premium dark background
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.05)', // Halka sa glass effect
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#34d399', // Emerald green jab active ho
        tabBarInactiveTintColor: '#64748b', // Slate color jab inactive ho
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: color, opacity: 0.8 }} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: color, opacity: 0.8 }} />
          ),
        }}
      />
    </Tabs>
  );
}
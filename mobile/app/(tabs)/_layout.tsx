import { Tabs } from 'expo-router';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#030612',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.05)',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#34d399',
        tabBarInactiveTintColor: '#64748b',
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: color, opacity: 0.8 }} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: color, opacity: 0.8 }} />
          ),
        }}
      />
      {/* Naya Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 22, height: 22, borderTopLeftRadius: 10, borderBottomRightRadius: 10, backgroundColor: color, opacity: 0.8 }} />
          ),
        }}
      />
    </Tabs>
  );
}
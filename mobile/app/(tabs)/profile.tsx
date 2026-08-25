import { View, Text, StatusBar, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/config'; // Make sure this path is correct

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [enrolledCount, setEnrolledCount] = useState<number | string>('00');
  const [loading, setLoading] = useState(true);

  // Jab profile page khule, toh storage se user ka data uthao aur API hit karo
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          setUser(JSON.parse(userDataString));
        }

        const token = await AsyncStorage.getItem('userToken');
        if (token) {
           // Backend se user ke kharide hue courses mangwa rahe hain
           const response = await fetch(`${API_URL}/enrollments/my-courses`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            // Jitne courses array mein aaye, utna count set kar diya. Agar 0 hai toh '00' dikhega
            const count = data.length || 0;
            setEnrolledCount(count < 10 && count > 0 ? `0${count}` : count === 0 ? '00' : count);
          }
        }
      } catch (error) {
        console.error("Error loading profile stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  // Logout ka function (Token delete karega)
  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    router.replace('/login'); // Wapas login par bhej dega
  };

  // Naam se Initials nikalne ka function (Jaise "Anas Khan" -> "AK")
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  return (
    <View className="flex-1 bg-[#010206] pt-16 px-6">
      <StatusBar barStyle="light-content" />

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#34d399" />
        </View>
      ) : (
        <>
          {/* Header Profile Section */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/30 rounded-full items-center justify-center mb-4">
              <Text className="text-4xl font-bold text-emerald-400">
                {user ? getInitials(user.name || user.username) : 'AK'}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-white tracking-widest uppercase text-center">
              {user ? (user.name || user.username) : 'Guest User'}
            </Text>
            <Text className="text-slate-400 text-xs mt-1 tracking-[2] uppercase font-bold text-center">
              {user?.email || 'Premium Student'}
            </Text>
          </View>

          {/* Stats Cards */}
          <View className="flex-row justify-between mb-8 space-x-4">
            <View className="flex-1 bg-[#030612] border border-white/[0.08] p-4 rounded-2xl items-center shadow-lg">
              <Text className="text-2xl font-black text-white mb-1">{enrolledCount}</Text>
              <Text className="text-slate-400 text-[10px] tracking-[1] uppercase font-bold">Enrolled</Text>
            </View>
            <View className="flex-1 bg-[#030612] border border-white/[0.08] p-4 rounded-2xl items-center shadow-lg">
              <Text className="text-2xl font-black text-emerald-400 mb-1">00</Text>
              <Text className="text-slate-400 text-[10px] tracking-[1] uppercase font-bold">Lessons Done</Text>
            </View>
          </View>

          {/* Settings Menu */}
          <ScrollView showsVerticalScrollIndicator={false} className="space-y-3">
            {['Edit Profile', 'My Certificates', 'App Settings', 'Help & Support'].map((item, index) => (
              <TouchableOpacity 
                key={index} 
                className="flex-row items-center justify-between bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl active:bg-white/[0.05]"
              >
                <Text className="text-slate-300 text-sm font-bold tracking-[1] uppercase">
                  {item}
                </Text>
                <View className="w-2 h-2 bg-emerald-400/50 rounded-full" />
              </TouchableOpacity>
            ))}

            {/* Logout Button */}
            <TouchableOpacity 
              onPress={handleLogout}
              className="mt-4 p-4 rounded-2xl border border-red-500/20 bg-red-500/10 items-center active:bg-red-500/20 mb-8"
            >
              <Text className="text-red-400 text-sm font-bold tracking-[2] uppercase">
                Log Out
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </>
      )}
    </View>
  );
}
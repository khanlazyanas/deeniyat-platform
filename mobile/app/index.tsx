import { useEffect } from 'react';
import { View, ActivityIndicator, StatusBar, Text } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function InitialScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Phone ki memory check karo ki token hai ya nahi
        const token = await AsyncStorage.getItem('userToken');
        
        if (token) {
          // Agar token mila, toh seedha Tabs (Home/Explore) par bhej do
          // Yahan hum /(tabs) par bhej rahe hain taaki tabs wala index.tsx khul jaye
          router.replace('/(tabs)'); 
        } else {
          // Agar token nahi mila, toh Login par bhej do
          router.replace('/login');
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        router.replace('/login');
      }
    };

    // App khulte hi thoda delay dekar checker chalega (Splash screen feel)
    setTimeout(() => {
      checkLoginStatus();
    }, 1000); // 1 second ka loading dikhega
    
  }, []);

  return (
    <View className="flex-1 bg-[#010206] justify-center items-center">
      <StatusBar barStyle="light-content" />
      {/* Loading animation aur logo/text */}
      <View className="items-center">
        <Text className="text-4xl font-extrabold text-white tracking-[2] uppercase mb-6">
          Deeniyat<Text className="text-emerald-400">.</Text>
        </Text>
        <ActivityIndicator size="large" color="#34d399" />
        <Text className="text-emerald-400 mt-4 text-xs font-bold tracking-[2] uppercase">
          Authenticating...
        </Text>
      </View>
    </View>
  );
}
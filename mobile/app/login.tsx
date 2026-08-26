import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StatusBar, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { API_URL } from '../constants/config';

export default function LoginScreen() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Interaction Wrapper with Haptics
  const handlePress = (action: () => void, style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    Haptics.impactAsync(style);
    action();
  };

  const handleLogin = async () => {
    handlePress(() => {}, Haptics.ImpactFeedbackStyle.Medium);

    if (!email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Validation Error', 'Email and password are required!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          avatar: data.avatar || "",
        };
        
        if (data.token) {
          await AsyncStorage.setItem('userToken', data.token);
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
          
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace('/'); 
        } else {
          Alert.alert('Error', 'Authentication token missing from server response.');
        }

      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Login Failed', data.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error("Login Error:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Network Error', 'Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#010206]">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 🌌 Background Volumetric Glows */}
      <View style={[styles.glowOrb, { top: -100, left: -50, backgroundColor: 'rgba(16, 185, 129, 0.12)' }]} pointerEvents="none" />
      <View style={[styles.glowOrb, { bottom: -100, right: -100, backgroundColor: 'rgba(59, 130, 246, 0.08)' }]} pointerEvents="none" />

      <View className="flex-1 justify-center px-8 z-10 relative">
        
        {/* Header */}
        <View className="mb-12">
          <View className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[1.5rem] mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.3)] transform -rotate-6">
             <Text className="text-[#010206] text-3xl font-black transform rotate-6">D</Text>
          </View>
          <Text className="text-[40px] font-black text-white tracking-tighter leading-[1.1] mb-2 drop-shadow-lg">
            Welcome{'\n'}Back<Text className="text-emerald-400">.</Text>
          </Text>
          <Text className="text-slate-400 text-[11px] tracking-[3] uppercase font-bold opacity-80">
            Sign in to your learning portal
          </Text>
        </View>

        {/* Input Fields Container */}
        <View className="space-y-5 mb-10">
          
          <View className="bg-[#030612]/80 backdrop-blur-xl border border-white/[0.08] rounded-[1.5rem] px-5 py-2 shadow-inner focus-within:border-emerald-500/50 transition-colors">
            <Text className="text-emerald-400 text-[9px] font-black uppercase tracking-widest pt-2">Email Address</Text>
            <TextInput 
              placeholder="name@example.com" 
              placeholderTextColor="#475569"
              className="text-white h-12 font-bold text-[15px] tracking-wide"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View className="bg-[#030612]/80 backdrop-blur-xl border border-white/[0.08] rounded-[1.5rem] px-5 py-2 shadow-inner focus-within:border-emerald-500/50 transition-colors">
            <Text className="text-emerald-400 text-[9px] font-black uppercase tracking-widest pt-2">Password</Text>
            <TextInput 
              placeholder="••••••••" 
              placeholderTextColor="#475569"
              className="text-white h-12 font-bold text-[15px] tracking-widest"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            onPress={() => handlePress(() => router.push('/forgot-password'))}
            className="self-end pt-1"
          >
            <Text className="text-slate-400 text-[11px] font-bold tracking-widest hover:text-emerald-400 transition-colors">Forgot Password?</Text>
          </TouchableOpacity>

        </View>

        {/* Primary Action Button */}
        <TouchableOpacity 
          onPress={handleLogin} 
          disabled={loading}
          activeOpacity={0.85}
          className={`w-full py-5 rounded-full items-center justify-center shadow-[0_10px_40px_rgba(52,211,153,0.3)] mb-8 flex-row ${loading ? 'bg-[#020510] border border-emerald-900' : 'bg-emerald-400 border border-emerald-300'}`}
        >
          {loading ? (
            <ActivityIndicator color="#34d399" />
          ) : (
            <Text className="text-[#010206] text-[12px] font-black tracking-[3] uppercase">
              Authenticate ➔
            </Text>
          )}
        </TouchableOpacity>

        {/* 👉 PROMINENT SIGNUP LINK 👈 */}
        <View className="flex-row justify-center items-center">
          <Text className="text-slate-500 text-[12px] font-medium mr-2">New to Deeniyat?</Text>
          <TouchableOpacity 
            onPress={() => handlePress(() => router.push('/signup'))}
            activeOpacity={0.7}
          >
            <Text className="text-emerald-400 text-[12px] font-black tracking-wide uppercase border-b border-emerald-400/30 pb-0.5">
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  glowOrb: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    opacity: 0.6,
  }
});
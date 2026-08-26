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
  StyleSheet,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { API_URL } from '../constants/config';

export default function SignupScreen() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student'); // Default role
  const [loading, setLoading] = useState(false);

  // Interaction Wrapper with Haptics
  const handlePress = (action: () => void, style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    Haptics.impactAsync(style);
    action();
  };

  const handleSignup = async () => {
    handlePress(() => {}, Haptics.ImpactFeedbackStyle.Medium);

    if (!name || !email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Validation Error', 'Name, Email, and Password are required!');
      return;
    }

    setLoading(true);
    try {
      // Typically, signup API endpoint is /auth/register or /auth/signup
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Account created successfully! Please login.', [
          { text: 'Go to Login', onPress: () => router.replace('/login') }
        ]);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Signup Failed', data.message || 'Could not create account');
      }
    } catch (error) {
      console.error("Signup Error:", error);
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
      <View style={[styles.glowOrb, { top: -50, right: -50, backgroundColor: 'rgba(59, 130, 246, 0.1)' }]} pointerEvents="none" />
      <View style={[styles.glowOrb, { bottom: -100, left: -100, backgroundColor: 'rgba(16, 185, 129, 0.08)' }]} pointerEvents="none" />

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="mb-10">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/5 rounded-full items-center justify-center mb-6 border border-white/10">
            <Text className="text-white text-lg font-bold">←</Text>
          </TouchableOpacity>

          <Text className="text-[36px] font-black text-white tracking-tighter leading-[1.1] mb-2 drop-shadow-lg">
            Join{'\n'}Deeniyat<Text className="text-emerald-400">.</Text>
          </Text>
          <Text className="text-slate-400 text-[11px] tracking-[3] uppercase font-bold opacity-80">
            Create your account to start learning
          </Text>
        </View>

        {/* Input Fields Container */}
        <View className="space-y-4 mb-8">
          
          <View className="bg-[#030612]/80 backdrop-blur-xl border border-white/[0.08] rounded-[1.5rem] px-5 py-2 shadow-inner focus-within:border-emerald-500/50 transition-colors">
            <Text className="text-emerald-400 text-[9px] font-black uppercase tracking-widest pt-2">Full Name</Text>
            <TextInput 
              placeholder="Your Name" 
              placeholderTextColor="#475569"
              className="text-white h-12 font-bold text-[15px] tracking-wide"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
          </View>

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

          {/* Role Selection */}
          <View className="mt-2">
             <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3 pl-2">Select Your Role</Text>
             <View className="flex-row gap-4">
                <TouchableOpacity 
                  onPress={() => { handlePress(() => setRole('Student')) }}
                  className={`flex-1 py-3 rounded-[1rem] items-center border ${role === 'Student' ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-[#030612] border-white/10'}`}
                >
                  <Text className={`font-black text-xs uppercase tracking-widest ${role === 'Student' ? 'text-emerald-400' : 'text-slate-500'}`}>Student</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => { handlePress(() => setRole('Ustad')) }}
                  className={`flex-1 py-3 rounded-[1rem] items-center border ${role === 'Ustad' ? 'bg-blue-500/20 border-blue-500/50' : 'bg-[#030612] border-white/10'}`}
                >
                  <Text className={`font-black text-xs uppercase tracking-widest ${role === 'Ustad' ? 'text-blue-400' : 'text-slate-500'}`}>Ustad</Text>
                </TouchableOpacity>
             </View>
          </View>

        </View>

        {/* Primary Action Button */}
        <TouchableOpacity 
          onPress={handleSignup} 
          disabled={loading}
          activeOpacity={0.85}
          className={`w-full py-5 rounded-full items-center justify-center shadow-[0_10px_40px_rgba(52,211,153,0.3)] mb-8 flex-row ${loading ? 'bg-[#020510] border border-emerald-900' : 'bg-emerald-400 border border-emerald-300'}`}
        >
          {loading ? (
            <ActivityIndicator color="#34d399" />
          ) : (
            <Text className="text-[#010206] text-[12px] font-black tracking-[3] uppercase">
              Create Account ➔
            </Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View className="flex-row justify-center items-center pb-8">
          <Text className="text-slate-500 text-[12px] font-medium mr-2">Already have an account?</Text>
          <TouchableOpacity 
            onPress={() => handlePress(() => router.replace('/login'))}
            activeOpacity={0.7}
          >
            <Text className="text-emerald-400 text-[12px] font-black tracking-wide uppercase border-b border-emerald-400/30 pb-0.5">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  glowOrb: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    opacity: 0.5,
  }
});
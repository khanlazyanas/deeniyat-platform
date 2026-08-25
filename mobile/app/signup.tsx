import { View, Text, TextInput, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config'; 

export default function LoginScreen() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Email aur password dono dalna zaroori hai!');
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
          
          router.replace('/'); 
        } else {
          Alert.alert('Error', 'Login toh hua par token nahi mila!');
        }

      } else {
        Alert.alert('Login Failed', data.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert('Network Error', 'Server se connect nahi ho pa raha hai.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#010206] px-6 justify-center">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="mb-10">
        <Text className="text-4xl font-extrabold text-white tracking-[2] uppercase">
          Welcome<Text className="text-emerald-400">.</Text>
        </Text>
        <Text className="text-slate-400 text-xs mt-2 tracking-[2] uppercase font-bold">
          Sign in to continue learning
        </Text>
      </View>

      {/* Input Fields */}
      <View className="space-y-4 mb-8">
        <View className="bg-[#030612] border border-white/[0.08] rounded-2xl px-4 py-1">
          <TextInput 
            placeholder="Email Address" 
            placeholderTextColor="#64748b"
            className="text-white h-12 font-bold tracking-[1]"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View className="bg-[#030612] border border-white/[0.08] rounded-2xl px-4 py-1">
          <TextInput 
            placeholder="Password" 
            placeholderTextColor="#64748b"
            className="text-white h-12 font-bold tracking-[1]"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
      </View>

      {/* Login Button */}
      <TouchableOpacity 
        onPress={handleLogin} 
        disabled={loading}
        className={`w-full py-4 rounded-full items-center shadow-lg transition-all ${loading ? 'bg-emerald-400/50' : 'bg-emerald-400 active:bg-emerald-500'}`}
      >
        {loading ? (
           <ActivityIndicator color="#010206" />
        ) : (
          <Text className="text-[#010206] text-[15px] font-black tracking-[2] uppercase">
            Sign In
          </Text>
        )}
      </TouchableOpacity>

      {/* Options: Forgot Password & Create Account */}
      <View className="mt-6 flex-row justify-between items-center px-2">
        <TouchableOpacity onPress={() => Alert.alert("Coming Soon", "Forgot password feature jald aayega!")}>
          <Text className="text-slate-400 text-xs font-bold tracking-[1]">Forgot Password?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text className="text-emerald-400 text-xs font-bold tracking-[1] uppercase">Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
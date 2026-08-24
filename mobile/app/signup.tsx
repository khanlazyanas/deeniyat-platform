import { View, Text, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';

export default function SignUpScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#010206] px-6 justify-center">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="mb-10">
        <Text className="text-4xl font-extrabold text-white tracking-[2] uppercase">
          Join Us<Text className="text-emerald-400">.</Text>
        </Text>
        <Text className="text-slate-400 text-xs mt-2 tracking-[2] uppercase font-bold">
          Start your learning journey
        </Text>
      </View>

      {/* Input Fields */}
      <View className="space-y-4 mb-8">
        <View className="bg-[#030612] border border-white/[0.08] rounded-2xl px-4 py-1">
          <TextInput 
            placeholder="Full Name" 
            placeholderTextColor="#64748b"
            className="text-white h-12 font-bold tracking-[1]"
          />
        </View>

        <View className="bg-[#030612] border border-white/[0.08] rounded-2xl px-4 py-1">
          <TextInput 
            placeholder="Email Address" 
            placeholderTextColor="#64748b"
            className="text-white h-12 font-bold tracking-[1]"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View className="bg-[#030612] border border-white/[0.08] rounded-2xl px-4 py-1">
          <TextInput 
            placeholder="Password" 
            placeholderTextColor="#64748b"
            className="text-white h-12 font-bold tracking-[1]"
            secureTextEntry
          />
        </View>
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity 
        onPress={() => router.replace('/')} // Account banne ke baad Home par le jayega
        className="w-full bg-emerald-400 py-4 rounded-full items-center shadow-lg active:bg-emerald-500"
      >
        <Text className="text-[#010206] text-[15px] font-black tracking-[2] uppercase">
          Create Account
        </Text>
      </TouchableOpacity>

      {/* Back to Login */}
      <View className="mt-6 flex-row justify-center items-center">
        <Text className="text-slate-400 text-xs font-bold tracking-[1] mr-1">Already have an account?</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-emerald-400 text-xs font-bold tracking-[1]">Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
import { View, Text, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#010206] px-6 justify-center">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="mb-10">
        <Text className="text-4xl font-extrabold text-white tracking-[2] uppercase">
          Recover<Text className="text-emerald-400">.</Text>
        </Text>
        <Text className="text-slate-400 text-xs mt-2 tracking-[2] uppercase font-bold">
          Reset your password
        </Text>
      </View>

      {/* Input Field */}
      <View className="space-y-4 mb-8">
        <Text className="text-slate-400 text-xs leading-relaxed">
          Enter your registered email address below. We'll send you a link to reset your password.
        </Text>
        <View className="bg-[#030612] border border-white/[0.08] rounded-2xl px-4 py-1">
          <TextInput 
            placeholder="Email Address" 
            placeholderTextColor="#64748b"
            className="text-white h-12 font-bold tracking-[1]"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Reset Button */}
      <TouchableOpacity 
        onPress={() => router.back()} // Abhi ke liye wapas login par bhej denge
        className="w-full bg-emerald-400 py-4 rounded-full items-center shadow-lg active:bg-emerald-500"
      >
        <Text className="text-[#010206] text-[15px] font-black tracking-[2] uppercase">
          Send Reset Link
        </Text>
      </TouchableOpacity>

      {/* Back to Login */}
      <View className="mt-6 flex-row justify-center items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-emerald-400 text-xs font-bold tracking-[1]">Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
import { View, Text, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#010206] pt-16 px-6">
      <StatusBar barStyle="light-content" />

      {/* Header Profile Section */}
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/30 rounded-full items-center justify-center mb-4">
          <Text className="text-4xl font-bold text-emerald-400">AK</Text>
        </View>
        <Text className="text-2xl font-bold text-white tracking-widest uppercase">
          Anas Khan
        </Text>
        <Text className="text-slate-400 text-xs mt-1 tracking-[2] uppercase font-bold">
          Premium Student
        </Text>
      </View>

      {/* Stats Cards */}
      <View className="flex-row justify-between mb-8 space-x-4">
        <View className="flex-1 bg-[#030612] border border-white/[0.08] p-4 rounded-2xl items-center shadow-lg">
          <Text className="text-2xl font-black text-white mb-1">03</Text>
          <Text className="text-slate-400 text-[10px] tracking-[1] uppercase font-bold">Enrolled</Text>
        </View>
        <View className="flex-1 bg-[#030612] border border-white/[0.08] p-4 rounded-2xl items-center shadow-lg">
          <Text className="text-2xl font-black text-emerald-400 mb-1">12</Text>
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
          onPress={() => router.push('/login')}
          className="mt-4 p-4 rounded-2xl border border-red-500/20 bg-red-500/10 items-center active:bg-red-500/20 mb-8"
        >
          <Text className="text-red-400 text-sm font-bold tracking-[2] uppercase">
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
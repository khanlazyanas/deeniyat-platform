import { View, Text, StatusBar, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-[#010206] items-center justify-center px-6">
      <StatusBar barStyle="light-content" />

      {/* Hero Section */}
      <View className="items-center mb-12">
        {/* Logo Icon */}
        <View className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/40 rounded-3xl items-center justify-center mb-6">
          <Text className="text-4xl font-bold text-emerald-400">D</Text>
        </View>

        {/* Brand Name (tracking-widest ki jagah tracking-[2] lagaya) */}
        <Text className="text-4xl font-extrabold text-white tracking-[2] uppercase">
          Deeniyat<Text className="text-emerald-400">.</Text>
        </Text>
        
        {/* Subtitle (tracking-[0.3em] ki jagah tracking-[4] lagaya) */}
        <Text className="text-slate-400 text-xs mt-3 tracking-[4] uppercase font-bold">
          Mobile Portal Active
        </Text>
      </View>

      {/* Action Button (tracking-[0.2em] ki jagah tracking-[2] lagaya) */}
      <TouchableOpacity className="w-full bg-emerald-400 py-4 rounded-full items-center shadow-lg active:bg-emerald-500 transition-all">
        <Text className="text-[#010206] text-[15px] font-black tracking-[2] uppercase">
          Enter Portal
        </Text>
      </TouchableOpacity>

      {/* Secondary Button (tracking-[0.1em] ki jagah tracking-[1] lagaya) */}
      <TouchableOpacity className="w-full mt-4 py-4 rounded-full items-center border border-white/10 active:bg-white/5">
        <Text className="text-slate-300 text-[13px] font-bold tracking-[1] uppercase">
          Browse Courses
        </Text>
      </TouchableOpacity>
    </View>
  );
}
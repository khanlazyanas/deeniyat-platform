import { View, Text, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams(); // Jab backend connect hoga, is id se hum data mangwayenge
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#010206]">
      <StatusBar barStyle="light-content" />

      {/* Custom Header */}
      <View className="pt-14 pb-6 px-6 bg-[#030612] border-b border-white/[0.05] flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 active:opacity-50">
          <Text className="text-emerald-400 text-xs font-bold tracking-[2]">BACK</Text>
        </TouchableOpacity>
        <Text className="text-white font-extrabold tracking-[2] uppercase text-lg">
          Course Info
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-[10px] font-bold text-emerald-400 tracking-[2] uppercase bg-emerald-500/10 self-start px-3 py-1 rounded-full overflow-hidden border border-emerald-500/20 mb-4">
          Beginner
        </Text>
        
        <Text className="text-3xl font-black text-white mb-4 tracking-[1]">
          Quranic Tajweed Masterclass
        </Text>
        
        <Text className="text-slate-400 text-sm leading-relaxed mb-8">
          Learn the proper pronunciation and articulation of Arabic letters. This course will guide you step-by-step through the rules of Tajweed, ensuring you can recite perfectly.
        </Text>

        <Text className="text-white font-extrabold tracking-[2] uppercase mb-4 text-sm">
          Syllabus
        </Text>

        {/* Dummy Syllabus List */}
        {[1, 2, 3, 4, 5].map((item) => (
          <TouchableOpacity 
            key={item} 
            onPress={() => router.push(`/lesson/${item}` as any)} 
            className="flex-row items-center bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl mb-3 active:bg-white/[0.05]"
          >
            <View className="w-10 h-10 bg-[#010206] border border-white/[0.1] rounded-full items-center justify-center mr-4">
              <Text className="text-emerald-400 font-bold">{item}</Text>
            </View>
            <View>
              <Text className="text-white font-bold tracking-[1]">Lesson {item}: Introduction</Text>
              <Text className="text-slate-500 text-[10px] mt-1 tracking-[1] uppercase">15 mins • Video</Text>
            </View>
          </TouchableOpacity>
        ))}
        
        <View className="h-32" /> {/* Bottom Button ke liye jagah */}
      </ScrollView>

      {/* Fixed Bottom Enroll Button */}
      <View className="absolute bottom-0 w-full p-6 pb-8 bg-[#010206] border-t border-white/[0.05]">
        <TouchableOpacity className="w-full bg-emerald-400 py-4 rounded-full items-center shadow-lg active:bg-emerald-500">
          <Text className="text-[#010206] text-[15px] font-black tracking-[2] uppercase">
            Enroll Now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
import { View, Text, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function LessonScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#010206]">
      <StatusBar barStyle="light-content" />

      {/* Video Player Placeholder (16:9 Aspect Ratio) */}
      <View className="w-full bg-black aspect-video justify-center items-center relative mt-10">
        {/* Play Button UI */}
        <TouchableOpacity className="w-16 h-16 bg-emerald-400/90 rounded-full items-center justify-center pl-1 shadow-lg active:scale-95">
          {/* Simple CSS Triangle for Play Icon */}
          <View className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-[#010206] border-b-[10px] border-b-transparent" />
        </TouchableOpacity>
        
        {/* Back Button over video */}
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center"
        >
          <Text className="text-white font-bold tracking-[1]">X</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-emerald-400 font-bold tracking-[2] uppercase text-[10px] mb-2">
          Lesson 1
        </Text>
        
        <Text className="text-2xl font-black text-white mb-4 tracking-[1]">
          Introduction to Tajweed
        </Text>
        
        {/* Tabs for Notes / Resources */}
        <View className="flex-row border-b border-white/[0.05] mb-6">
          <TouchableOpacity className="pb-3 border-b-2 border-emerald-400 mr-6">
            <Text className="text-emerald-400 font-bold tracking-[1] uppercase text-xs">Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity className="pb-3">
            <Text className="text-slate-500 font-bold tracking-[1] uppercase text-xs">Resources</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-slate-400 text-sm leading-relaxed mb-6">
          In this first lesson, we will understand the linguistic and applied meaning of Tajweed. You will learn why it is obligatory to read the Quran with proper articulation and the historical preservation of the text.
        </Text>

        <View className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl mb-8">
          <Text className="text-emerald-400 font-bold mb-1">Key Takeaway:</Text>
          <Text className="text-slate-300 text-xs leading-relaxed">
            Tajweed means "to make something better". It is giving every letter its right and due characteristics.
          </Text>
        </View>
        
        <View className="h-24" /> {/* Spacing for bottom button */}
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View className="absolute bottom-0 w-full p-6 pb-8 bg-[#010206] border-t border-white/[0.05]">
        <TouchableOpacity className="w-full bg-emerald-400 py-4 rounded-full items-center shadow-lg active:bg-emerald-500">
          <Text className="text-[#010206] text-[15px] font-black tracking-[2] uppercase">
            Complete & Continue
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
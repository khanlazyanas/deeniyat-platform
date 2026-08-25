import { View, Text, StatusBar, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

export default function LessonScreen() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('Lessons');

  return (
    <View className="flex-1 bg-[#010206]">
      <StatusBar barStyle="light-content" hidden={false} />

      {/* Video Player Placeholder */}
      <View className="w-full bg-black aspect-video justify-center items-center relative mt-8 border-b border-white/[0.05]">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center z-10"
        >
          <Text className="text-white text-lg font-bold">←</Text>
        </TouchableOpacity>

        <View className="w-16 h-16 bg-emerald-500/80 rounded-full items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.5)]">
          <Text className="text-white text-2xl ml-1">▶</Text>
        </View>
        <Text className="text-slate-400 text-[10px] uppercase tracking-[2] mt-4 font-bold">
          Video Player Coming Soon
        </Text>
      </View>

      <View className="flex-1 px-6 pt-6">
        <Text className="text-2xl font-extrabold text-white tracking-wide mb-2">
          Course Title ({id})
        </Text>
        <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">
          Module 1 • Current Lesson
        </Text>

        <View className="flex-row border-b border-white/[0.1] mb-6">
          {['Lessons', 'Overview', 'Notes'].map((tab) => (
            <TouchableOpacity 
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`mr-6 pb-3 ${activeTab === tab ? 'border-b-2 border-emerald-400' : ''}`}
            >
              <Text className={`text-sm font-bold tracking-[1] uppercase ${activeTab === tab ? 'text-emerald-400' : 'text-slate-500'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {activeTab === 'Lessons' && (
            <View className="pb-24">
              <TouchableOpacity className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl mb-3 flex-row items-center">
                <View className="w-8 h-8 bg-emerald-500/20 rounded-full items-center justify-center mr-4">
                  <Text className="text-emerald-400 font-bold text-xs">▶</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-emerald-400 font-bold text-sm mb-1">Current Playing Topic</Text>
                  <Text className="text-emerald-400/70 text-[10px]">Playing</Text>
                </View>
              </TouchableOpacity>

              {[2, 3, 4, 5].map((num) => (
                <TouchableOpacity 
                  key={num} 
                  className="bg-[#030612] border border-white/[0.05] p-4 rounded-2xl mb-3 flex-row items-center"
                  onPress={() => Alert.alert("Coming Soon", `Switch to lesson ${num} logic here.`)}
                >
                  <View className="w-8 h-8 bg-white/[0.05] rounded-full items-center justify-center mr-4">
                    <Text className="text-slate-400 font-bold text-xs">{num}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-sm mb-1">Upcoming Topic {num}</Text>
                    <Text className="text-slate-500 text-[10px]">Video</Text>
                  </View>
                  <Text className="text-slate-600 text-lg">🔒</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === 'Overview' && (
            <View className="pb-24">
              <Text className="text-slate-300 text-sm leading-relaxed mb-4">
                This is where the detailed course or module description will go once we hook it up to the backend data.
              </Text>
              <View className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                <Text className="text-emerald-400 font-bold mb-1">Key Takeaway:</Text>
                <Text className="text-slate-300 text-xs leading-relaxed">
                  Focus on understanding the concepts thoroughly.
                </Text>
              </View>
            </View>
          )}

          {activeTab === 'Notes' && (
            <View className="items-center justify-center py-10 pb-24">
              <Text className="text-4xl mb-4">📝</Text>
              <Text className="text-slate-400 font-bold tracking-widest uppercase text-xs text-center">
                Notes module will be unlocked soon.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <View className="absolute bottom-0 w-full p-6 pb-8 bg-[#010206] border-t border-white/[0.05]">
        <TouchableOpacity 
          onPress={() => Alert.alert("Success", "Marked as complete!")}
          className="w-full bg-emerald-400 py-4 rounded-full items-center shadow-lg active:bg-emerald-500"
        >
          <Text className="text-[#010206] text-[15px] font-black tracking-[2] uppercase">
            Complete & Continue
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
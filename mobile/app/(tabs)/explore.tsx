import { View, Text, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function CoursesScreen() {
  const router = useRouter();

  // Yeh dummy courses hain, backend connect karne ke baad yahan real data aayega!
  const dummyCourses = [
    { id: '1', title: 'Quranic Tajweed Masterclass', level: 'Beginner', desc: 'Learn proper pronunciation and articulation of Arabic letters.' },
    { id: '2', title: 'Advanced Islamic Jurisprudence', level: 'Advanced', desc: 'Deep dive into Fiqh, principles, and daily rulings.' },
    { id: '3', title: 'Seerah of Prophet Muhammad', level: 'Intermediate', desc: 'Understand the life, struggles, and wisdom of the Prophet.' },
  ];

  return (
    <View className="flex-1 bg-[#010206] pt-12 px-6">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="mb-8">
        <Text className="text-3xl font-extrabold text-white tracking-[2] uppercase">
          Curriculum<Text className="text-emerald-400">.</Text>
        </Text>
        <Text className="text-slate-400 text-xs mt-2 tracking-[2] uppercase font-bold">
          Explore Sacred Sciences
        </Text>
      </View>

      {/* Courses List */}
      <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
        {dummyCourses.map((course) => (
          <View 
            key={course.id} 
            className="bg-[#030612] border border-white/[0.08] p-6 rounded-3xl mb-4 shadow-xl"
          >
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-[10px] font-bold text-emerald-400 tracking-[2] uppercase bg-emerald-500/10 px-3 py-1 rounded-full overflow-hidden border border-emerald-500/20">
                {course.level}
              </Text>
            </View>

            <Text className="text-xl font-bold text-white mb-2 tracking-wide">
              {course.title}
            </Text>
            
            <Text className="text-slate-400 text-xs leading-relaxed mb-5">
              {course.desc}
            </Text>

            <TouchableOpacity 
              onPress={() => router.push(`/course/${course.id}`)}
              className="bg-white/[0.03] border border-white/[0.1] py-3 rounded-2xl items-center active:bg-emerald-400 active:border-emerald-400"
            >
              <Text className="text-white text-xs font-bold tracking-[2] uppercase">
                View Details
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
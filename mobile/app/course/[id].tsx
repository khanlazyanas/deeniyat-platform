import { View, Text, StatusBar, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { API_URL } from '../../constants/config';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams(); // URL se course ki ID nikal li
  const router = useRouter();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        // Backend se sirf is ID wale course ka data mangwa rahe hain
        const response = await fetch(`${API_URL}/courses/${id}`);
        const data = await response.json();
        
        // Tumhare backend response ke hisaab se adjust kar lena (data.course ya direct data)
        setCourse(data.course || data.data || data);
      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseDetail();
    }
  }, [id]);

  return (
    <View className="flex-1 bg-[#010206] pt-12">
      <StatusBar barStyle="light-content" />

      {/* Top Navigation Bar */}
      <View className="flex-row items-center px-6 mb-6">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 bg-white/[0.05] border border-white/[0.1] rounded-xl items-center justify-center active:bg-white/[0.1]"
        >
          {/* Back Arrow Icon */}
          <Text className="text-white text-lg font-bold">←</Text>
        </TouchableOpacity>
        <Text className="text-white font-bold tracking-[2] uppercase ml-4 text-sm">
          Course Details
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#34d399" />
          <Text className="text-emerald-400 mt-4 font-bold tracking-[2] uppercase text-xs">
            Loading Details...
          </Text>
        </View>
      ) : course ? (
        <>
          <ScrollView showsVerticalScrollIndicator={false} className="px-6">
            {/* Header Area */}
            <View className="mb-8">
              <View className="flex-row items-center mb-4">
                <Text className="text-[10px] font-bold text-emerald-400 tracking-[2] uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {course.level || course.category || 'Beginner'}
                </Text>
              </View>
              <Text className="text-3xl font-extrabold text-white tracking-wide mb-4">
                {course.title || course.name}
              </Text>
              <Text className="text-slate-400 text-sm leading-relaxed mb-6">
                {course.description || course.desc}
              </Text>
              
              {/* Instructor/Price Info (Agar backend se aata hai toh) */}
              <View className="flex-row justify-between bg-[#030612] p-4 rounded-2xl border border-white/[0.05] mb-6">
                <View>
                  <Text className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Duration</Text>
                  <Text className="text-white font-bold">{course.duration || '4 Weeks'}</Text>
                </View>
                <View>
                  <Text className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Status</Text>
                  <Text className="text-emerald-400 font-bold">Active</Text>
                </View>
              </View>
            </View>

            {/* Syllabus/Modules Dummy Section */}
            <View className="mb-20">
              <Text className="text-white font-black uppercase tracking-[2] mb-4 text-sm">
                Curriculum Overview
              </Text>
              {[1, 2, 3].map((num) => (
                <View key={num} className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl mb-3 flex-row items-center">
                  <View className="w-8 h-8 bg-emerald-500/10 rounded-full items-center justify-center mr-4">
                    <Text className="text-emerald-400 font-bold text-xs">{num}</Text>
                  </View>
                  <Text className="text-slate-300 font-bold flex-1">Module {num} Introduction</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Sticky Bottom Enroll Button */}
          <View className="absolute bottom-0 left-0 right-0 bg-[#010206] px-6 py-6 border-t border-white/[0.05]">
            <TouchableOpacity 
              className="w-full bg-emerald-400 py-4 rounded-full items-center active:bg-emerald-500 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
            >
              <Text className="text-[#010206] font-black tracking-[2] uppercase text-sm">
                Enroll Now
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-400 font-bold">Course Not Found!</Text>
        </View>
      )}
    </View>
  );
}
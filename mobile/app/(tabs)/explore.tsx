import { View, Text, StatusBar, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { API_URL } from '../../constants/config'; // Tumhara /api/v1 wala URL

export default function CoursesScreen() {
  const router = useRouter();
  
  // Real data store karne ke liye states
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Backend se data fetch karne ka function
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Tumhare backend ka courses route. (Agar /course ya /getAllCourses hai toh change kar lena)
        const response = await fetch(`${API_URL}/courses`); 
        const data = await response.json();
        
        // Console log lagaya hai taaki pata chale backend kya bhej raha hai
        console.log("📚 Fetched Courses:", data); 

        // Agar data backend se array mein aata hai ya kisi object ke andar (jaise data.courses)
        setCourses(data.courses || data.data || data); 
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

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

      {/* Courses List ya Loading Spinner */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#34d399" />
          <Text className="text-emerald-400 mt-4 font-bold tracking-widest uppercase text-xs">
            Fetching Courses...
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
          {courses && courses.length > 0 ? (
            courses.map((course: any) => (
              <View 
                key={course._id || course.id} 
                className="bg-[#030612] border border-white/[0.08] p-6 rounded-3xl mb-4 shadow-xl"
              >
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-[10px] font-bold text-emerald-400 tracking-[2] uppercase bg-emerald-500/10 px-3 py-1 rounded-full overflow-hidden border border-emerald-500/20">
                    {course.level || course.category || 'Beginner'}
                  </Text>
                </View>

                <Text className="text-xl font-bold text-white mb-2 tracking-wide">
                  {course.title || course.name}
                </Text>
                
                <Text className="text-slate-400 text-xs leading-relaxed mb-5" numberOfLines={2}>
                  {course.description || course.desc || 'No description available for this course.'}
                </Text>

                <TouchableOpacity 
                  onPress={() => router.push(`/course/${course._id || course.id}` as any)}
                  className="bg-white/[0.03] border border-white/[0.1] py-3 rounded-2xl items-center active:bg-emerald-400 active:border-emerald-400 group"
                >
                  <Text className="text-white text-xs font-bold tracking-[2] uppercase group-active:text-black">
                    View Details
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
             <Text className="text-slate-400 text-center mt-10 font-bold tracking-widest uppercase text-xs">
               No courses found in database.
             </Text>
          )}
          <View className="h-20" />
        </ScrollView>
      )}
    </View>
  );
}
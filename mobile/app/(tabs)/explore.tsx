import { View, Text, StatusBar, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { API_URL } from '../../constants/config'; // Humari banayi hui config file

export default function CoursesScreen() {
  const router = useRouter();
  
  // Real data store karne ke liye states
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Backend se data fetch karne ka function
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // API_URL = http://10.21.53.107:8000/api
        // Assuming tumhara endpoint '/courses' hai. Agar kuch aur hai toh isko change kar lena.
        const response = await fetch(`${API_URL}/courses`); 
        const data = await response.json();
        
        // Agar backend se data array mein aata hai
        setCourses(data.courses || data); 
        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
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
          {courses.length > 0 ? courses.map((course: any) => (
            <View 
              key={course._id || course.id} // MongoDB mein usually _id hota hai
              className="bg-[#030612] border border-white/[0.08] p-6 rounded-3xl mb-4 shadow-xl"
            >
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[10px] font-bold text-emerald-400 tracking-[2] uppercase bg-emerald-500/10 px-3 py-1 rounded-full overflow-hidden border border-emerald-500/20">
                  {course.level || 'Beginner'}
                </Text>
              </View>

              <Text className="text-xl font-bold text-white mb-2 tracking-wide">
                {course.title}
              </Text>
              
              <Text className="text-slate-400 text-xs leading-relaxed mb-5">
                {course.desc || course.description}
              </Text>

              <TouchableOpacity 
                onPress={() => router.push(`/course/${course._id || course.id}` as any)}
                className="bg-white/[0.03] border border-white/[0.1] py-3 rounded-2xl items-center active:bg-emerald-400 active:border-emerald-400"
              >
                <Text className="text-white text-xs font-bold tracking-[2] uppercase">
                  View Details
                </Text>
              </TouchableOpacity>
            </View>
          )) : (
             <Text className="text-slate-400 text-center mt-10">No courses found in database.</Text>
          )}
          <View className="h-20" />
        </ScrollView>
      )}
    </View>
  );
}
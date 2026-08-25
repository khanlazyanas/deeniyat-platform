import { View, Text, StatusBar, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/config';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  
  // 🔥 Nayi State: Check karne ke liye ki user enrolled hai ya nahi
  const [isEnrolled, setIsEnrolled] = useState(false); 

  useEffect(() => {
    const fetchCourseAndCheckEnrollment = async () => {
      try {
        // 1. Course ki details lao
        const response = await fetch(`${API_URL}/courses/${id}`);
        const data = await response.json();
        setCourse(data.course || data.data || data);

        // 2. Check karo ki user isme enrolled hai ya nahi
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const enrollRes = await fetch(`${API_URL}/courses/my-courses`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (enrollRes.ok) {
            const myCourses = await enrollRes.json();
            // Agar ye course ID myCourses list mein hai, matlab user enrolled hai
            const alreadyBought = myCourses.some((c: any) => c._id === id);
            setIsEnrolled(alreadyBought);
          }
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseAndCheckEnrollment();
    }
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert("Login Required", "Bhai, pehle login karna padega enroll karne ke liye!");
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_URL}/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ courseId: id })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success! 🎉", "Mubarak ho! Tum is course mein enroll ho gaye ho.");
        // 🔥 Jaise hi enroll ho, is button ko "Start Learning" mein badal do
        setIsEnrolled(true); 
      } else {
        Alert.alert("Enrollment Failed", data.message || "Pehle se enroll ho ya galti hui.");
      }
    } catch (error) {
      console.error("Enroll Error:", error);
      Alert.alert("Network Error", "Server se connect nahi ho paya.");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <View className="flex-1 bg-[#010206] pt-12">
      <StatusBar barStyle="light-content" />

      {/* Top Navigation Bar */}
      <View className="flex-row items-center px-6 mb-6">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 bg-white/[0.05] border border-white/[0.1] rounded-xl items-center justify-center active:bg-white/[0.1]"
        >
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

            <View className="mb-24">
              <Text className="text-white font-black uppercase tracking-[2] mb-4 text-sm">
                Curriculum Overview
              </Text>
              
              {course.modules && course.modules.length > 0 ? (
                course.modules.map((module: any, index: number) => (
                  <TouchableOpacity 
                    key={module._id || index} 
                    className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl mb-3 flex-row items-center active:bg-white/[0.05]"
                    onPress={() => {
                      // 👇 FIX: Yahan ab user seedha Lesson page par jayega
                      if (isEnrolled) {
                        router.push(`/lesson/${id}`);
                      } else {
                        Alert.alert("Locked", "Pehle course mein enroll karein.");
                      }
                    }}
                  >
                    <View className={`w-8 h-8 rounded-full items-center justify-center mr-4 border ${isEnrolled ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-500/10 border-slate-500/20'}`}>
                      <Text className={`${isEnrolled ? 'text-emerald-400' : 'text-slate-400'} font-bold text-xs`}>{index + 1}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-sm mb-1">{module.title || `Module ${index + 1}`}</Text>
                      {module.duration && <Text className="text-slate-400 text-[10px]">{module.duration}</Text>}
                    </View>
                    {/* Lock/Unlock Icon based on enrollment */}
                    <Text className="text-lg">{isEnrolled ? '▶' : '🔒'}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text className="text-slate-500 italic text-sm">Modules abhi add nahi hue hain backend par.</Text>
              )}
            </View>
          </ScrollView>

          {/* Sticky Bottom Button (Dynamic) */}
          <View className="absolute bottom-0 left-0 right-0 bg-[#010206] px-6 py-6 border-t border-white/[0.05]">
            {isEnrolled ? (
              <TouchableOpacity 
                // 👇 FIX: Start Learning par dabaate hi Lesson page khulega
                onPress={() => router.push(`/lesson/${id}`)}
                className="w-full py-4 rounded-full items-center shadow-[0_0_20px_rgba(52,211,153,0.3)] bg-emerald-400 active:bg-emerald-500"
              >
                <Text className="text-[#010206] font-black tracking-[2] uppercase text-sm">
                  Start Learning
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={handleEnroll}
                disabled={enrolling}
                className={`w-full py-4 rounded-full items-center shadow-[0_0_20px_rgba(52,211,153,0.3)] ${enrolling ? 'bg-emerald-400/50' : 'bg-emerald-400 active:bg-emerald-500'}`}
              >
                {enrolling ? (
                   <ActivityIndicator color="#010206" />
                ) : (
                  <Text className="text-[#010206] font-black tracking-[2] uppercase text-sm">
                    Enroll Now
                  </Text>
                )}
              </TouchableOpacity>
            )}
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
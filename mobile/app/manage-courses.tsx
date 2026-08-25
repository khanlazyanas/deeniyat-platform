import { View, Text, StatusBar, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../constants/config';

// Image URL Helper
const getFullImageUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("file://")) return url;
  return `${API_URL.replace('/api', '')}${url}`;
};

export default function ManageCoursesScreen() {
  const router = useRouter();
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // useFocusEffect taaki jab Ustad naya course bana kar wapas aaye, ya edit karke aaye, toh list refresh ho jaye
  useFocusEffect(
    useCallback(() => {
      fetchMyCourses();
    }, [])
  );

  const fetchMyCourses = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataString = await AsyncStorage.getItem('userData');
      
      if (!token || !userDataString) {
        router.replace('/login');
        return;
      }

      const user = JSON.parse(userDataString);
      setUserId(user._id || user.id);

      // Access control (Optional safeguard if regular student gets here)
      if (user.role !== "Ustad" && user.role !== "Admin") {
        Alert.alert("Access Denied", "Only teachers can manage courses.");
        router.back();
        return;
      }

      const response = await fetch(`${API_URL}/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const allCourses = Array.isArray(data) ? data : (data.data || []);
        
        // Filter: Show only courses created by this Ustad
        const filteredCourses = allCourses.filter(
          (c: any) => c.teacherId?._id === (user._id || user.id) || c.teacherId === (user._id || user.id)
        );
        
        setMyCourses(filteredCourses);
      }
    } catch (error) {
      console.error("Error fetching my courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = (courseId: string, courseTitle: string) => {
    Alert.alert(
      "Delete Course",
      `Are you sure you want to completely delete "${courseTitle}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              const res = await fetch(`${API_URL}/courses/${courseId}`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` }
              });

              if (res.ok) {
                Alert.alert("Deleted", "Course has been removed successfully.");
                setMyCourses(prev => prev.filter(c => c._id !== courseId));
              } else {
                const errorData = await res.json();
                Alert.alert("Failed", errorData.message || "Failed to delete course.");
              }
            } catch (err) {
              Alert.alert("Network Error", "Could not delete course at this time.");
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#010206] pt-16">
      <StatusBar barStyle="light-content" />

      {/* 🟢 HEADER SECTION */}
      <View className="px-6 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-emerald-400 text-[10px] font-black tracking-[3] uppercase mb-1">
              Teacher Dashboard
            </Text>
            <Text className="text-3xl font-extrabold text-white tracking-wide">
              Manage Courses<Text className="text-emerald-400">.</Text>
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/5 rounded-full items-center justify-center border border-white/10 active:bg-white/10"
          >
            <Text className="text-white text-lg font-bold">←</Text>
          </TouchableOpacity>
        </View>

        {/* ➕ Create New Course Button */}
        <TouchableOpacity 
          onPress={() => router.push('/create-course')}
          className="w-full py-4 bg-emerald-500 rounded-2xl items-center flex-row justify-center shadow-[0_0_20px_rgba(52,211,153,0.3)] active:bg-emerald-600 mb-2"
        >
          <Text className="text-[#010206] text-xl font-bold mr-2">+</Text>
          <Text className="text-[#010206] font-black tracking-[2] uppercase text-xs">Create New Course</Text>
        </TouchableOpacity>
      </View>

      {/* 📚 COURSES LIST */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#34d399" />
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-4">Loading Curriculum...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
          
          {myCourses.length === 0 ? (
            <View className="bg-[#030612] border border-white/[0.05] rounded-[2rem] p-10 items-center justify-center mt-6 shadow-inner">
              <Text className="text-5xl mb-4">🏜️</Text>
              <Text className="text-slate-300 text-sm font-bold tracking-widest uppercase mb-2 text-center">No Courses Found</Text>
              <Text className="text-slate-500 text-xs text-center max-w-[200px] mb-6">
                You haven't published any courses yet. Start by creating one.
              </Text>
              <TouchableOpacity 
                onPress={() => router.push('/create-course')}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-full"
              >
                <Text className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Create Course</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="pb-24 space-y-6">
              {myCourses.map((course: any, index: number) => (
                <View 
                  key={course._id || index} 
                  className="bg-[#030612] border border-white/[0.08] rounded-[2rem] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                >
                  {/* Thumbnail Image */}
                  <View className="w-full h-44 bg-[#0a0f1c] relative">
                    {course.thumbnail ? (
                      <Image 
                        source={{ uri: getFullImageUrl(course.thumbnail) }}
                        className="w-full h-full opacity-80"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full flex items-center justify-center">
                        <Text className="text-slate-800 font-black text-2xl tracking-widest">NO IMAGE</Text>
                      </View>
                    )}
                    
                    {/* Price Tag Overlay */}
                    <View className="absolute top-4 right-4 bg-[#010206]/80 px-3 py-1.5 rounded-lg border border-white/[0.1] backdrop-blur-md">
                      <Text className="text-emerald-400 font-black text-xs">
                        {course.price > 0 ? `₹${course.price}` : 'FREE'}
                      </Text>
                    </View>
                  </View>

                  {/* Course Details */}
                  <View className="p-6">
                    <Text className="text-xl font-extrabold text-white mb-2 leading-tight" numberOfLines={2}>
                      {course.title}
                    </Text>
                    <Text className="text-slate-400 text-xs leading-relaxed mb-6" numberOfLines={2}>
                      {course.description}
                    </Text>

                    {/* Action Buttons */}
                    <View className="space-y-3">
                      {/* Manage Modules / Add Lesson */}
                      <TouchableOpacity 
                        // Ispe click karke Ustad Add Lesson/Module Management par jaayega
                        onPress={() => router.push(`/add-lesson?courseId=${course._id}`)}
                        className="w-full py-4 bg-blue-500/10 border border-blue-500/20 rounded-xl items-center active:bg-blue-500/20"
                      >
                        <Text className="text-blue-400 font-black tracking-widest uppercase text-[10px]">
                          Manage Modules (Add Videos)
                        </Text>
                      </TouchableOpacity>

                      <View className="flex-row gap-3">
                        {/* 🚀 EDIT BUTTON FIXED HERE */}
                        <TouchableOpacity 
                          onPress={() => router.push(`/edit-course/${course._id}` as any)}
                          className="flex-1 py-3.5 bg-white/[0.03] border border-white/[0.05] rounded-xl items-center active:bg-white/[0.1]"
                        >
                          <Text className="text-slate-300 font-bold tracking-widest uppercase text-[10px]">Edit Info</Text>
                        </TouchableOpacity>

                        {/* Delete Button */}
                        <TouchableOpacity 
                          onPress={() => handleDeleteCourse(course._id, course.title)}
                          className="flex-1 py-3.5 bg-red-500/10 border border-red-500/20 rounded-xl items-center active:bg-red-500/20"
                        >
                          <Text className="text-red-400 font-bold tracking-widest uppercase text-[10px]">Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
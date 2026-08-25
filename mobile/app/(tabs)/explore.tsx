import { View, Text, StatusBar, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/config';

// Helper to get full image URL (from backend)
const getFullImageUrl = (url: string) => {
  if (!url) return 'https://via.placeholder.com/400x200?text=Course+Image';
  if (url.startsWith("http") || url.startsWith("file://")) return url;
  return `${API_URL.replace('/api', '')}${url}`;
};

export default function CoursesScreen() {
  const router = useRouter();
  
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Backend se data fetch karne ka function
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        // Tumhare backend ka courses route
        const response = await fetch(`${API_URL}/courses`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {} // Optional auth for public explore
        }); 
        
        if (response.ok) {
          const data = await response.json();
          // Backend response logic
          const coursesList = Array.isArray(data) ? data : (data.courses || data.data || []);
          setCourses(coursesList);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter logic for search bar
  const filteredCourses = courses.filter(course => 
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#010206]">
      <StatusBar barStyle="light-content" />

      <View className="flex-1 pt-16">
        
        {/* 🔥 Header & Search Area */}
        <View className="px-6 mb-6">
          <Text className="text-emerald-400 text-[10px] font-black tracking-[3] uppercase mb-1 drop-shadow-md">
            Discover Knowledge
          </Text>
          <Text className="text-3xl font-extrabold text-white tracking-wide mb-6">
            Explore Courses<Text className="text-emerald-400">.</Text>
          </Text>

          {/* 🔍 Premium Search Input */}
          <View className="flex-row items-center bg-[#030612] border border-white/[0.08] rounded-[1.25rem] px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <Text className="text-slate-500 mr-3 text-lg">🔍</Text>
            <TextInput
              placeholder="Search Arabic, Nahw, Seerah..."
              placeholderTextColor="#475569"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-white font-bold"
              selectionColor="#34d399"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} className="bg-white/10 rounded-full w-6 h-6 items-center justify-center">
                <Text className="text-slate-400 text-xs font-bold">X</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 📚 Courses List ya Loading Spinner */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#34d399" />
            <Text className="text-emerald-400 mt-4 font-bold tracking-[2] uppercase text-xs">
              Fetching Modules...
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
            
            <Text className="text-slate-500 font-black uppercase tracking-[2] text-[10px] mb-4">
              {searchQuery ? `Search Results (${filteredCourses.length})` : "Featured Curriculum"}
            </Text>

            {filteredCourses.length > 0 ? (
              <View className="pb-24 space-y-6">
                {filteredCourses.map((course: any, index: number) => (
                  <TouchableOpacity 
                    key={course._id || course.id || index} 
                    onPress={() => router.push(`/course/${course._id || course.id}` as any)}
                    className="bg-[#030612] border border-white/[0.08] rounded-[2rem] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)] active:scale-95 transition-transform"
                  >
                    {/* 🔥 Dynamic Thumbnail Image */}
                    <Image 
                      source={{ uri: getFullImageUrl(course.thumbnail) }}
                      className="w-full h-44 bg-[#020510]"
                      resizeMode="cover"
                    />

                    {/* Subtle Gradient Overlay over Image */}
                    <View className="absolute top-0 left-0 right-0 h-44 bg-black/30" />

                    <View className="p-6">
                      <View className="flex-row justify-between items-center mb-3">
                        <View className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                          <Text className="text-[9px] font-black text-emerald-400 tracking-[2] uppercase">
                            {course.level || course.category || 'Beginner'}
                          </Text>
                        </View>
                        <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                          {course.duration || 'Self-Paced'}
                        </Text>
                      </View>

                      <Text className="text-xl font-extrabold text-white mb-2 tracking-wide leading-tight">
                        {course.title || course.name}
                      </Text>
                      
                      <Text className="text-slate-400 text-xs leading-relaxed mb-6" numberOfLines={2}>
                        {course.description || course.desc || 'A comprehensive guide to understanding this Islamic science.'}
                      </Text>

                      <View className="flex-row items-center justify-between border-t border-white/[0.05] pt-4">
                        <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                          Ustad: {course.teacherId?.name || 'Deeniyat'}
                        </Text>
                        <View className="bg-emerald-400 px-5 py-2 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                          <Text className="text-[#010206] text-[10px] font-black tracking-[2] uppercase">
                            View Details
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="bg-[#030612] border border-white/[0.05] rounded-[2rem] p-10 items-center justify-center mt-6">
                <Text className="text-5xl mb-4">🏜️</Text>
                <Text className="text-slate-300 text-sm font-bold tracking-widest uppercase mb-2">No Courses Found</Text>
                <Text className="text-slate-500 text-xs text-center max-w-[200px]">
                  Try searching with a different keyword or module name.
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
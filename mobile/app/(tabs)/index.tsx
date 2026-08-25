import { View, Text, StatusBar, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/config';

// Image URL Helper
const getFullImageUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("file://")) return url;
  return `${API_URL.replace('/api', '')}${url}`;
};

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Screen par aate hi user data aur courses refresh karna
  useFocusEffect(
    useCallback(() => {
      loadUserData();
      fetchMyCourses();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        setUser(JSON.parse(userDataString));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/courses/my-courses`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setEnrolledCourses(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  return (
    <View className="flex-1 bg-[#010206] pt-16">
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
        
        {/* 🔥 Ultra Premium Header Row with Avatar Sync */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-slate-400 text-[10px] tracking-[2] uppercase font-bold mb-1">
              As-salamu Alaykum,
            </Text>
            <Text className="text-2xl font-extrabold text-white tracking-wide">
              {user ? (user.name || user.username) : 'Student'}
              <Text className="text-emerald-400">.</Text>
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => router.push('/profile')} 
            className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(52,211,153,0.3)] active:scale-95"
          >
            {user?.avatar ? (
              <Image 
                source={{ uri: getFullImageUrl(user.avatar) }} 
                className="w-full h-full" 
                resizeMode="cover" 
              />
            ) : (
              <Text className="text-emerald-400 font-black text-lg">
                {user ? getInitials(user.name || user.username) : 'S'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 🔥 Holographic Hero Banner Card */}
        <View className="bg-gradient-to-br from-emerald-900/30 via-[#030612] to-[#010206] border border-emerald-500/30 p-6 rounded-[2.5rem] mb-8 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <View className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <View className="absolute -left-10 -bottom-10 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <View className="self-start bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-3">
            <Text className="text-emerald-400 text-[9px] font-black tracking-[3] uppercase">
              Deeniyat Core Portal
            </Text>
          </View>

          <Text className="text-white text-2xl font-black mb-2 leading-tight">
            Ready to continue your sacred journey?
          </Text>
          <Text className="text-slate-400 text-xs mb-6 font-medium">
            You are actively enrolled in {enrolledCourses.length} courses.
          </Text>
          
          <TouchableOpacity 
            onPress={() => enrolledCourses.length > 0 ? router.push('/explore') : router.push('/explore')}
            className="self-start bg-gradient-to-r from-emerald-400 to-teal-400 px-7 py-3.5 rounded-full shadow-[0_0_25px_rgba(52,211,153,0.4)] active:scale-95"
          >
            <Text className="text-[#010206] text-xs font-black tracking-[1.5] uppercase">
              {enrolledCourses.length > 0 ? "Resume Learning" : "Browse Courses"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 🔥 My Courses Section Header */}
        <View className="mb-6 flex-row justify-between items-center">
          <Text className="text-white font-black uppercase tracking-[2] text-sm">
            Enrolled Curriculum
          </Text>
          <TouchableOpacity onPress={() => router.push('/explore')}>
            <Text className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
              View All ➔
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="py-16 justify-center items-center">
            <ActivityIndicator size="large" color="#34d399" />
            <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-4">Loading your modules...</Text>
          </View>
        ) : enrolledCourses.length === 0 ? (
          /* Empty State */
          <View className="bg-[#030612] border border-white/[0.05] rounded-[2rem] p-10 items-center justify-center mb-12 shadow-inner">
            <Text className="text-5xl mb-4">📚</Text>
            <Text className="text-slate-300 text-sm text-center font-extrabold tracking-wider uppercase mb-2">
              No Courses Enrolled Yet
            </Text>
            <Text className="text-slate-500 text-xs text-center mb-6 max-w-[240px]">
              Explore our structured Arabic and Islamic studies courses to begin.
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/explore')}
              className="bg-white/[0.05] border border-white/10 px-8 py-3.5 rounded-full active:bg-white/10"
            >
              <Text className="text-emerald-400 text-[10px] font-black tracking-[2] uppercase">
                Explore Catalog
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Horizontal Course List for a Premium Feel */
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-16 overflow-visible">
            {enrolledCourses.map((item: any, index: number) => (
              <TouchableOpacity 
                key={item._id || index}
                onPress={() => router.push(`/course/${item._id}`)}
                className="bg-[#030612] border border-white/[0.08] rounded-[2rem] w-72 mr-5 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] active:scale-95"
              >
                <Image 
                  source={{ uri: item.thumbnail ? getFullImageUrl(item.thumbnail) : 'https://via.placeholder.com/400x200?text=Course' }} 
                  className="w-full h-36 bg-white/[0.02]"
                  resizeMode="cover"
                />
                <View className="p-5">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      <Text className="text-[8px] font-black text-emerald-400 tracking-[1] uppercase">
                        {item.level || 'Beginner'}
                      </Text>
                    </View>
                    <Text className="text-slate-500 text-[10px] font-bold">{item.duration || '4 Weeks'}</Text>
                  </View>

                  <Text className="text-white font-extrabold text-base mb-1 leading-tight" numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                    By {item.teacherId?.name || 'Ustad'}
                  </Text>
                  
                  {/* Progress Bar */}
                  <View className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden mb-2">
                    <View className="h-full bg-emerald-400 w-1/3 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-slate-500 text-[9px] uppercase font-bold">In Progress</Text>
                    <Text className="text-emerald-400 text-[10px] uppercase font-black tracking-wider">
                      Continue ➔
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

      </ScrollView>
    </View>
  );
}
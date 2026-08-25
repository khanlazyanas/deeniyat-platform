import { View, Text, StatusBar, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/config';

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // User ka naam nikalne ke liye
  useEffect(() => {
    const loadUser = async () => {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        setUser(JSON.parse(userDataString));
      }
    };
    loadUser();
  }, []);

  // Screen par aate hi courses refresh karna
  useFocusEffect(
    useCallback(() => {
      fetchMyCourses();
    }, [])
  );

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
        
        {/* 🔥 Premium Header Row */}
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
          
          <TouchableOpacity onPress={() => router.push('/profile')} className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full items-center justify-center">
            <Text className="text-emerald-400 font-black text-lg">
              {user ? getInitials(user.name || user.username) : 'S'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 🔥 Hero Banner Card */}
        <View className="bg-gradient-to-br from-emerald-900/20 to-[#030612] border border-emerald-500/20 p-6 rounded-3xl mb-8 relative overflow-hidden">
          <View className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
          <Text className="text-emerald-400 text-[10px] font-black tracking-[3] uppercase mb-2">
            Deeniyat Portal
          </Text>
          <Text className="text-white text-xl font-bold mb-1 leading-snug">
            Ready to continue your sacred journey?
          </Text>
          <Text className="text-slate-400 text-xs mb-5">
            You have {enrolledCourses.length} active courses.
          </Text>
          
          <TouchableOpacity 
            onPress={() => enrolledCourses.length > 0 ? null : router.push('/explore')}
            className="self-start bg-emerald-400 px-6 py-3 rounded-full"
          >
            <Text className="text-[#010206] text-xs font-black tracking-[1] uppercase">
              {enrolledCourses.length > 0 ? "Resume Learning" : "Browse Courses"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 🔥 My Courses Section */}
        <View className="mb-6 flex-row justify-between items-center">
          <Text className="text-white font-black uppercase tracking-[2] text-sm">
            My Courses
          </Text>
          <TouchableOpacity onPress={() => router.push('/explore')}>
            <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="py-10 justify-center items-center">
            <ActivityIndicator size="large" color="#34d399" />
          </View>
        ) : enrolledCourses.length === 0 ? (
          /* Empty State */
          <View className="bg-[#030612] border border-white/[0.05] rounded-3xl p-8 items-center justify-center mb-8">
            <Text className="text-4xl mb-3">📚</Text>
            <Text className="text-slate-400 text-xs text-center font-bold tracking-widest uppercase mb-4">
              No Courses Enrolled Yet
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/explore')}
              className="border border-white/10 px-6 py-3 rounded-full active:bg-white/5"
            >
              <Text className="text-white text-[10px] font-bold tracking-[2] uppercase">
                Explore Now
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Horizontal Course List for a Premium Feel */
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-12 overflow-visible">
            {enrolledCourses.map((item: any, index: number) => (
              <TouchableOpacity 
                key={item._id || index}
                onPress={() => router.push(`/course/${item._id}`)}
                className="bg-[#030612] border border-white/[0.05] rounded-3xl w-64 mr-5 overflow-hidden shadow-2xl"
              >
                <Image 
                  source={{ uri: item.thumbnail || 'https://via.placeholder.com/400x200?text=Course+Image' }} 
                  className="w-full h-32 bg-white/[0.02]"
                  resizeMode="cover"
                />
                <View className="p-4">
                  <View className="self-start bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mb-2">
                    <Text className="text-[8px] font-bold text-emerald-400 tracking-[1] uppercase">
                      {item.level || 'Beginner'}
                    </Text>
                  </View>
                  <Text className="text-white font-bold text-sm mb-1 leading-tight" numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">
                    By {item.teacherId?.name || 'Ustad'}
                  </Text>
                  
                  {/* Progress Bar */}
                  <View className="w-full h-1 bg-white/[0.05] rounded-full overflow-hidden mb-1.5">
                    <View className="h-full bg-emerald-400 w-1/4" />
                  </View>
                  <Text className="text-slate-400 text-[8px] uppercase font-bold tracking-widest text-right">
                    Continue
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

      </ScrollView>
    </View>
  );
}
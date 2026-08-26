import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StatusBar, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Image, 
  Dimensions,
  StyleSheet,
  Animated,
  Easing
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { API_URL } from '../../constants/config';

const { width } = Dimensions.get('window');

// Image URL Helper
const getFullImageUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("file://")) return url;
  return `${API_URL.replace('/api', '')}${url}`;
};

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✨ Cinematic Entrance Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const triggerEntranceAnimation = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      fetchMyCourses();
      triggerEntranceAnimation();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) setUser(JSON.parse(userDataString));
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/courses/my-courses`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setEnrolledCourses(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching dashboard courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  // Interaction Wrapper with Haptics
  const handlePress = (action: () => void, style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    Haptics.impactAsync(style);
    action();
  };

  return (
    <View className="flex-1 bg-[#010206]">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 🌌 Cross-Platform Safe Ambient Glows */}
      <View style={[styles.glowOrb, { top: -100, left: -50, backgroundColor: 'rgba(16, 185, 129, 0.08)' }]} pointerEvents="none" />
      <View style={[styles.glowOrb, { top: '30%', right: -120, backgroundColor: 'rgba(59, 130, 246, 0.06)' }]} pointerEvents="none" />
      <View style={[styles.glowOrb, { bottom: -100, left: '20%', backgroundColor: 'rgba(245, 158, 11, 0.05)' }]} pointerEvents="none" />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1"
        contentContainerStyle={{ paddingTop: 60, paddingBottom: 120 }}
      >

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          {/* 🌟 SECTION 1: Top Navigation Bar & Profile */}
          <View className="flex-row justify-between items-center px-6 mb-10 mt-4">
            <View>
              <View className="flex-row items-center mb-2">
                {/* Pulsing Live Indicator */}
                <View className="relative w-2 h-2 mr-2.5">
                  <View className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75" />
                  <View className="relative w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,1)]" />
                </View>
                <Text className="text-slate-400 text-[10px] tracking-[5] uppercase font-black opacity-80">
                  Deeniyat Studio
                </Text>
              </View>
              <Text className="text-[34px] font-black text-white tracking-tighter leading-tight">
                {user ? (user.name || user.username) : 'Student'}
                <Text className="text-emerald-400">.</Text>
              </Text>
            </View>

            {/* Cinematic Avatar */}
            <TouchableOpacity 
              onPress={() => handlePress(() => router.push('/profile'))} 
              activeOpacity={0.7}
              className="relative shadow-[0_10px_30px_rgba(52,211,153,0.3)]"
            >
              <View className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-emerald-400 via-teal-500 to-[#020510]">
                <View className="w-full h-full bg-[#010206] rounded-full items-center justify-center overflow-hidden border-2 border-[#010206]">
                  {user?.avatar ? (
                    <Image source={{ uri: getFullImageUrl(user.avatar) }} className="w-full h-full opacity-90" resizeMode="cover" />
                  ) : (
                    <Text className="text-emerald-400 font-black text-2xl tracking-wider">
                      {user ? getInitials(user.name || user.username) : 'S'}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* 🔮 SECTION 2: 3D Glassmorphic Hero Card */}
          <View className="px-6 mb-10">
            <TouchableOpacity 
              activeOpacity={0.95}
              onPress={() => handlePress(() => router.push(enrolledCourses.length > 0 ? '/explore' : '/explore'), Haptics.ImpactFeedbackStyle.Medium)}
              className="bg-[#030612] border border-white/[0.08] rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,1)] relative elevation-24"
            >
              {/* Deep Space Background */}
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.25)', 'rgba(4, 8, 20, 0.98)', '#010206']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              
              {/* Fake Glass Reflection Diagonal */}
              <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'transparent']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFillObject, { transform: [{ rotate: '15deg' }, { scale: 1.5 }], left: -100, opacity: 0.3 }]}
              />

              <View className="p-8 pt-9 relative z-10">
                <View className="self-start bg-[#010206]/40 border border-emerald-400/30 px-4 py-2 rounded-full mb-6 backdrop-blur-xl">
                  <Text className="text-emerald-300 text-[9px] font-black tracking-[3] uppercase">
                    Sacred Academic Pathway
                  </Text>
                </View>

                <Text className="text-white text-[32px] font-black leading-[1.1] mb-5 tracking-tight drop-shadow-2xl">
                  Empower your journey with pure knowledge.
                </Text>

                <Text className="text-slate-400 text-[14px] font-medium leading-relaxed mb-10 opacity-90 max-w-[90%]">
                  You are currently advancing through <Text className="text-emerald-400 font-bold">{enrolledCourses.length}</Text> active course modules.
                </Text>

                <View className="flex-row items-center gap-4">
                  <View className="bg-emerald-400 px-8 py-4 rounded-full shadow-[0_0_30px_rgba(52,211,153,0.5)] flex-row items-center border border-emerald-300">
                    <Text className="text-[#010206] text-[11px] font-black tracking-[2] uppercase mr-3">
                      {enrolledCourses.length > 0 ? "Resume Learning" : "Browse Courses"}
                    </Text>
                    <Text className="text-[#010206] font-black text-sm">➔</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* 📊 SECTION 3: Dynamic Live Stats */}
          <View className="px-6 mb-12">
            <View className="flex-row gap-4">
              <View className="flex-1 bg-gradient-to-b from-[#060B1A] to-[#020510] border border-white/[0.04] p-5 rounded-[1.8rem] shadow-lg">
                <View className="w-8 h-8 bg-white/[0.03] rounded-full flex items-center justify-center mb-4">
                  <Text className="text-sm">📚</Text>
                </View>
                <Text className="text-slate-500 text-[9px] font-black uppercase tracking-[2] mb-1.5">Enrolled</Text>
                <Text className="text-white text-[28px] font-black tracking-tighter">{enrolledCourses.length}</Text>
              </View>

              <View className="flex-1 bg-gradient-to-b from-[#060B1A] to-[#020510] border border-white/[0.04] p-5 rounded-[1.8rem] shadow-lg">
                <View className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20">
                  <Text className="text-sm">⚡</Text>
                </View>
                <Text className="text-slate-500 text-[9px] font-black uppercase tracking-[2] mb-1.5">Focus</Text>
                <Text className="text-blue-400 text-[28px] font-black tracking-tighter">100%</Text>
              </View>

              <View className="flex-1 bg-gradient-to-b from-emerald-900/20 to-[#020510] border border-emerald-500/20 p-5 rounded-[1.8rem] shadow-lg relative overflow-hidden">
                <View className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                  <Text className="text-sm">🟢</Text>
                </View>
                <Text className="text-emerald-500/80 text-[9px] font-black uppercase tracking-[2] mb-1.5">Status</Text>
                <Text className="text-emerald-400 text-[24px] font-black tracking-tighter">Active</Text>
              </View>
            </View>
          </View>

          {/* 📋 SECTION 4: Curriculum Feed Header */}
          <View className="px-6 mb-6 flex-row justify-between items-end">
            <View>
              <Text className="text-slate-500 text-[10px] tracking-[4] uppercase font-black mb-2 opacity-70">
                Curriculum Feed
              </Text>
              <Text className="text-white font-black text-3xl tracking-tight drop-shadow-md">
                Your Enrolled Courses
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => handlePress(() => router.push('/explore'))} 
              activeOpacity={0.6}
              className="pb-1.5"
            >
              <Text className="text-emerald-400 text-[11px] font-black uppercase tracking-widest">
                View All ➔
              </Text>
            </TouchableOpacity>
          </View>

          {/* 📚 SECTION 5: Flagship Course Carousel */}
          {loading ? (
            <View className="py-24 justify-center items-center">
              <ActivityIndicator size="large" color="#34d399" />
              <Text className="text-slate-500 text-[10px] font-black uppercase tracking-[4] mt-6">
                Synchronizing Data...
              </Text>
            </View>
          ) : enrolledCourses.length === 0 ? (
            <View className="px-6 mb-8">
              <View className="bg-gradient-to-b from-[#040814] to-[#010206] border border-white/[0.05] rounded-[2.5rem] p-12 items-center justify-center shadow-lg">
                <Text className="text-6xl mb-6 opacity-90 drop-shadow-2xl">📖</Text>
                <Text className="text-white text-xl font-black tracking-wide uppercase mb-3 text-center">
                  No Active Courses
                </Text>
                <Text className="text-slate-500 text-[13px] text-center mb-8 max-w-[260px] leading-relaxed">
                  You haven't enrolled in any modules yet. Explore the catalog to begin your journey.
                </Text>
                <TouchableOpacity 
                  onPress={() => handlePress(() => router.push('/explore'))}
                  activeOpacity={0.85}
                  className="bg-emerald-400 px-10 py-4 rounded-full shadow-[0_10px_30px_rgba(52,211,153,0.35)]"
                >
                  <Text className="text-[#010206] text-[11px] font-black tracking-[2.5] uppercase">
                    Browse Catalog
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={{ paddingLeft: 24, paddingRight: 8, paddingBottom: 40 }}
              className="overflow-visible"
              decelerationRate="fast"
              snapToInterval={335} // Perfect snapping
            >
              {enrolledCourses.map((item: any, index: number) => (
                <TouchableOpacity 
                  key={item._id || index}
                  onPress={() => handlePress(() => router.push(`/course/${item._id}` as any))}
                  activeOpacity={0.95}
                  className="bg-[#020510] border border-white/[0.05] rounded-[2.5rem] w-[315px] mr-[20px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] elevation-10"
                >
                  {/* Thumbnail & Dark Overlay */}
                  <View className="w-full h-52 bg-[#010206] relative">
                    <Image 
                      source={{ uri: item.thumbnail ? getFullImageUrl(item.thumbnail) : 'https://via.placeholder.com/400x200?text=Course' }} 
                      className="w-full h-full opacity-75" 
                      resizeMode="cover" 
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(2, 5, 16, 1)']}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <View className="absolute top-5 left-5 bg-[#010206]/80 px-4 py-2 rounded-full border border-white/[0.1] backdrop-blur-xl">
                      <Text className="text-[9px] font-black text-emerald-400 tracking-[2] uppercase">
                        {item.level || 'Beginner'}
                      </Text>
                    </View>
                  </View>

                  {/* Body Details */}
                  <View className="p-7 pt-1">
                    <Text className="text-slate-500 text-[10px] font-black uppercase tracking-[3] mb-2.5 opacity-80">
                      Taught by {item.teacherId?.name || 'Ustad'}
                    </Text>
                    <Text className="text-white font-extrabold text-[24px] mb-7 leading-snug h-[64px]" numberOfLines={2}>
                      {item.title}
                    </Text>

                    {/* Neon Tube Progress Dashboard */}
                    <View className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.04] p-5 rounded-[1.5rem]">
                      <View className="flex-row justify-between items-center mb-3.5">
                        <Text className="text-slate-400 text-[9px] font-black uppercase tracking-[2]">Academic Status</Text>
                        <Text className="text-emerald-400 text-[10px] font-black tracking-wider">In Session</Text>
                      </View>

                      {/* True Neon Glowing Bar */}
                      <View className="w-full h-[8px] bg-[#010206] rounded-full overflow-hidden mb-4 border border-white/[0.05] relative">
                        <View className="h-full bg-emerald-400 w-1/2 rounded-full shadow-[0_0_15px_rgba(52,211,153,1)]" />
                      </View>

                      <View className="flex-row justify-between items-center pt-3 border-t border-white/[0.03]">
                        <Text className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                          {item.duration || 'Self-Paced'}
                        </Text>
                        <View className="bg-emerald-500 text-[#010206] px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                          <Text className="text-[#010206] text-[10px] font-black uppercase tracking-[1.5]">
                            Enter ➔
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  glowOrb: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    // Removed CSS filter:blur to ensure 100% Android crash safety. 
    // Opacity combined with scale handles the ambient light perfectly.
    opacity: 0.6, 
    transform: [{ scale: 1.2 }]
  }
});
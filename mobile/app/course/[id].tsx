import { View, Text, StatusBar, TouchableOpacity, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { API_URL } from '../../constants/config';

// Helper to get full image URL
const getFullImageUrl = (url: string) => {
  if (!url) return 'https://via.placeholder.com/400x200?text=Course+Image';
  if (url.startsWith("http") || url.startsWith("file://")) return url;
  return `${API_URL.replace('/api', '')}${url}`;
};

// YouTube Embed URL Generator
const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;
  const match = regExp.exec(url);
  if (match && match[1].length === 11) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0&modestbranding=1&showinfo=0&controls=1&playsinline=1&origin=https://deeniyat-platform.vercel.app`;
  }
  return url;
};

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/courses/${id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();

      if (response.ok) {
        setCourse(data);
        
        // Agar user login hai, check karo ki wo enrolled hai ya nahi
        if (token) {
          const userDataString = await AsyncStorage.getItem('userData');
          if (userDataString) {
            const user = JSON.parse(userDataString);
            if (user?.enrolledCourses?.includes(id)) {
              setIsEnrolled(true);
            }
          }
        }
      } else {
        Alert.alert("Error", data.message || "Failed to load course details.");
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
      Alert.alert("Error", "Network connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      Alert.alert(
        "Login Required",
        "You must be logged in to enroll in this course.",
        [{ text: "Login", onPress: () => router.push('/login') }, { text: "Cancel", style: "cancel" }]
      );
      return;
    }

    if (isEnrolled) {
      // Agar pehle se enrolled hai, toh direct padhai shuru karo (Lesson Player par bhejo)
      router.push(`/lesson/${id}`);
      return;
    }

    setEnrolling(true);
    try {
      // 🚀 Seedha Enroll API hit kar rahe hain mobile se
      const response = await fetch(`${API_URL}/courses/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: id })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("🎉 Enrolled Successfully!", "Welcome to the course. Let's begin learning.");
        setIsEnrolled(true);
        
        // AsyncStorage mein user ke enrolled courses update karo
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const user = JSON.parse(userDataString);
          if (!user.enrolledCourses) user.enrolledCourses = [];
          user.enrolledCourses.push(id);
          await AsyncStorage.setItem('userData', JSON.stringify(user));
        }

        // Direct Lesson Player par bhej do
        router.replace(`/lesson/${id}`);
      } else {
        Alert.alert("Enrollment Failed", data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      Alert.alert("Error", "Could not complete enrollment.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#010206] justify-center items-center">
        <ActivityIndicator size="large" color="#34d399" />
        <Text className="text-emerald-400 mt-4 font-bold tracking-[2] uppercase text-xs">
          Decrypting Knowledge...
        </Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View className="flex-1 bg-[#010206] justify-center items-center px-6">
        <Text className="text-4xl mb-4">⚠️</Text>
        <Text className="text-white font-bold text-lg mb-2">Course Not Found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-white/10 px-6 py-3 rounded-full">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(course.promoVideo);
  const htmlContent = embedUrl ? `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body { margin: 0; padding: 0; background-color: #030612; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
          iframe { width: 100vw; height: 100vh; border: none; }
        </style>
      </head>
      <body>
        <iframe src="${embedUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </body>
    </html>
  ` : '';

  return (
    <View className="flex-1 bg-[#010206]">
      <StatusBar barStyle="light-content" />

      {/* Header with Back Button & Promo Media */}
      <View className="w-full bg-[#030612] aspect-video relative mt-8 border-b border-white/[0.05]">
        
        {/* Back Button Overlay */}
        <TouchableOpacity 
          onPress={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center z-20"
        >
          <Text className="text-white text-lg font-bold">←</Text>
        </TouchableOpacity>

        {embedUrl ? (
          <WebView
            source={{ html: htmlContent, baseUrl: 'https://google.com' }}
            style={{ flex: 1, backgroundColor: '#030612' }}
            allowsFullscreenVideo={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mediaPlaybackRequiresUserAction={false}
          />
        ) : (
          <Image 
            source={{ uri: getFullImageUrl(course.thumbnail) }}
            className="w-full h-full opacity-80"
            resizeMode="cover"
          />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-6 pb-24">
        
        {/* Course Meta Info */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <Text className="text-[10px] font-black text-emerald-400 tracking-[2] uppercase">
              {course.level || 'Beginner'}
            </Text>
          </View>
          <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            {course.duration || 'Self-Paced'}
          </Text>
        </View>

        {/* Title */}
        <Text className="text-3xl font-extrabold text-white tracking-wide mb-6 leading-tight">
          {course.title}
        </Text>

        {/* Teacher Info */}
        {course.teacherId && (
          <View className="flex-row items-center gap-4 p-4 bg-[#030612] rounded-[1.5rem] border border-white/[0.05] mb-8 shadow-sm">
            <View className="w-12 h-12 rounded-[1rem] bg-[#020510] border border-white/[0.08] flex items-center justify-center">
              <Text className="text-xl font-black text-emerald-400">{course.teacherId.name.charAt(0)}</Text>
            </View>
            <View>
              <Text className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Taught By</Text>
              <Text className="text-white font-bold text-base tracking-wide">Ustad {course.teacherId.name}</Text>
            </View>
          </View>
        )}

        {/* Description */}
        <View className="mb-10">
          <Text className="text-white font-bold text-lg mb-3">About Curriculum</Text>
          <Text className="text-slate-400 text-sm leading-relaxed">
            {course.description}
          </Text>
        </View>

        {/* 🔥 ENROLL BUTTON */}
        <TouchableOpacity 
          onPress={handleEnroll}
          disabled={enrolling}
          className={`w-full py-5 rounded-[1.5rem] items-center justify-center flex-row shadow-[0_10px_30px_rgba(52,211,153,0.3)] mb-12 ${
            enrolling 
              ? 'bg-emerald-900 border border-emerald-800' 
              : isEnrolled 
                ? 'bg-[#030612] border border-emerald-500/50' 
                : 'bg-emerald-400 active:bg-emerald-500'
          }`}
        >
          {enrolling ? (
            <ActivityIndicator color="#34d399" />
          ) : (
            <Text className={`font-black tracking-[2] uppercase text-sm ${isEnrolled ? 'text-emerald-400' : 'text-[#010206]'}`}>
              {isEnrolled ? "Go to Course Dashboard" : "Enroll Now - Free"}
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
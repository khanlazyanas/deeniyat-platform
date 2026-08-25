import { View, Text, StatusBar, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { API_URL } from '../../constants/config';

// YouTube Embed URL Generator
const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;
  const match = regExp.exec(url);
  if (match && match[1].length === 11) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0&modestbranding=1&showinfo=0&controls=1&enablejsapi=1`;
  }
  return null; 
};

export default function LessonScreen() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]); 
  const [activeLesson, setActiveLesson] = useState<any>(null); 
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Lessons');

  useEffect(() => {
    const fetchCourseAndLessons = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) throw new Error("Authentication required");

        const courseRes = await fetch(`${API_URL}/courses/${id}`);
        const courseData = await courseRes.json();
        const parsedCourse = courseData.course || courseData.data || courseData;
        setCourse(parsedCourse);

        const lessonsRes = await fetch(`${API_URL}/lessons/course/${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const lessonsData = await lessonsRes.json();

        if (lessonsRes.ok) {
          const fetchedLessons = Array.isArray(lessonsData) ? lessonsData : (lessonsData.data || []);
          setLessons(fetchedLessons);
          
          if (fetchedLessons.length > 0) {
            setActiveLesson(fetchedLessons[0]); 
          } else if (parsedCourse.promoVideo) {
             setLessons([{
                _id: 'promo_1',
                title: 'Introduction',
                videoUrl: parsedCourse.promoVideo,
             }]);
             setActiveLesson({
                _id: 'promo_1',
                title: 'Introduction',
                videoUrl: parsedCourse.promoVideo,
             });
          }
        }
      } catch (error) {
        console.error("Error fetching lesson data:", error);
        Alert.alert("Error", "Course data load nahi ho paya.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseAndLessons();
    }
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 bg-[#010206] justify-center items-center">
        <ActivityIndicator size="large" color="#34d399" />
        <Text className="text-emerald-400 mt-4 font-bold tracking-[2] uppercase text-xs">
          Loading Studio...
        </Text>
      </View>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(activeLesson?.videoUrl);

  // 🔥 FIX 2: YouTube Error 153 Bypass karne ke liye HTML Wrapper
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
        <iframe 
          src="${embedUrl}" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </body>
    </html>
  ` : '';

  return (
    <View className="flex-1 bg-[#010206]">
      <StatusBar barStyle="light-content" hidden={false} />

      {/* Video Player Area */}
      <View className="w-full bg-[#030612] aspect-video relative mt-8 border-b border-white/[0.05]">
        
        <TouchableOpacity 
          onPress={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center z-20"
        >
          <Text className="text-white text-lg font-bold">←</Text>
        </TouchableOpacity>

        {embedUrl ? (
          <WebView
            source={{ html: htmlContent, baseUrl: 'https://www.youtube.com' }} // Origin set kiya taaki video block na ho
            style={{ flex: 1, backgroundColor: '#030612' }}
            allowsFullscreenVideo={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mediaPlaybackRequiresUserAction={false}
          />
        ) : (
          <View className="flex-1 justify-center items-center bg-[#020510]">
             <Text className="text-slate-500 font-bold uppercase tracking-widest text-xs">No Video Found for this Lesson</Text>
          </View>
        )}
      </View>

      <View className="flex-1 px-6 pt-6">
        <Text className="text-2xl font-extrabold text-white tracking-wide mb-2">
          {course?.title || "Course Title"}
        </Text>
        <Text className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6 bg-emerald-500/10 self-start px-3 py-1 rounded-full border border-emerald-500/20">
          {activeLesson ? activeLesson.title : 'Overview'}
        </Text>

        <View className="flex-row border-b border-white/[0.1] mb-6">
          {['Lessons', 'Overview', 'Assignments'].map((tab) => (
            <TouchableOpacity 
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`mr-6 pb-3 ${activeTab === tab ? 'border-b-2 border-emerald-400' : ''}`}
            >
              <Text className={`text-sm font-bold tracking-[1] uppercase ${activeTab === tab ? 'text-emerald-400' : 'text-slate-500'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* LESSONS LIST */}
          {activeTab === 'Lessons' && (
            <View className="pb-24">
              {lessons.length > 0 ? (
                lessons.map((lesson: any, index: number) => {
                  const isPlaying = activeLesson?._id === lesson._id;
                  
                  return (
                    <TouchableOpacity 
                      key={lesson._id}
                      onPress={() => setActiveLesson(lesson)} 
                      className={`flex-row items-start p-5 mb-3 border rounded-[1.25rem] transition-all ${
                        isPlaying 
                          ? 'bg-emerald-500/10 border-emerald-500/30' 
                          : 'bg-[#030612] border-white/[0.08]'
                      }`}
                    >
                      {/* 🔥 FIX 1: Text string "{index + 1}" ko Text component me wrap kiya */}
                      <View className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${
                        isPlaying 
                          ? "bg-emerald-400" 
                          : "bg-[#020510] border border-white/[0.1]"
                      }`}>
                         <Text className={`font-black text-sm ${isPlaying ? "text-[#010206]" : "text-slate-400"}`}>
                           {index + 1}
                         </Text>
                      </View>
                      
                      <View className="flex-1 pt-1">
                        <Text className={`font-bold text-[15px] tracking-tight mb-1 ${isPlaying ? "text-emerald-400" : "text-slate-200"}`}>
                          {lesson.title}
                        </Text>
                        {isPlaying && (
                          <Text className="text-emerald-400/70 text-[10px] uppercase font-bold tracking-widest">
                            Currently Playing
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View className="items-center py-10">
                  <Text className="text-slate-500 italic text-sm">Curriculum is being prepared.</Text>
                </View>
              )}
            </View>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === 'Overview' && (
            <View className="pb-24">
              {activeLesson?.content && (
                <View className="bg-[#030612]/60 border border-white/[0.06] rounded-[2rem] p-6 mb-8">
                   {/* 🔥 FIX 1b: HTML <h3> hata kar <Text> lagaya */}
                   <Text className="text-white font-bold mb-4 text-lg">
                     📝 Study Material
                   </Text>
                   <Text className="text-slate-300 leading-relaxed text-sm">
                     {activeLesson.content}
                   </Text>
                </View>
              )}
              
              <Text className="text-slate-400 text-sm leading-relaxed mb-4">
                {course?.description || "Course overview not available."}
              </Text>
            </View>
          )}

          {/* ASSIGNMENTS TAB */}
          {activeTab === 'Assignments' && (
            <View className="items-center justify-center py-10 pb-24 bg-[#030612] border border-white/[0.05] rounded-[2rem] p-6 text-center">
              <Text className="text-4xl mb-4">🎤</Text>
              <Text className="text-white font-bold mb-2">Task Submission</Text>
              <Text className="text-slate-500 font-bold tracking-widest uppercase text-[10px] text-center leading-5">
                For submitting audio recitations or assignments, please use the Deeniyat Web Portal for the full studio experience.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
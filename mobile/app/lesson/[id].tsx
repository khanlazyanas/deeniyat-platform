import { View, Text, StatusBar, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { API_URL } from '../../constants/config';

// 🔥 YouTube URL ko Embed URL mein badalne ka function
const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    // rel=0 se doosre channels ke suggestions nahi aate
    return `https://www.youtube.com/embed/${match[2]}?rel=0&autoplay=0`;
  }
  return null; 
};

export default function LessonScreen() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Lessons');
  
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [lessonList, setLessonList] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await fetch(`${API_URL}/courses/${id}`);
        const data = await response.json();
        const courseData = data.course || data.data || data;
        
        setCourse(courseData);
        
        // 🔥 FIX: Check karte hain ki backend ne data kahan bheja hai
        // Agar 'lessons' ya 'modules' array hai toh wo lo, warna promoVideo ko hi pehla lesson bana do
        let extractedLessons = courseData.lessons || courseData.modules || [];
        
        if (extractedLessons.length === 0 && courseData.promoVideo) {
          extractedLessons = [{
            _id: 'promo_1',
            title: 'Main Course Video',
            videoUrl: courseData.promoVideo,
            duration: 'Full Video'
          }];
        }

        setLessonList(extractedLessons);
        
        if (extractedLessons.length > 0) {
          setCurrentLesson(extractedLessons[0]);
        }
      } catch (error) {
        console.error("Error fetching lesson data:", error);
        Alert.alert("Error", "Course data load nahi ho paya.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseData();
    }
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 bg-[#010206] justify-center items-center">
        <ActivityIndicator size="large" color="#34d399" />
        <Text className="text-emerald-400 mt-4 font-bold tracking-[2] uppercase text-xs">
          Loading Player...
        </Text>
      </View>
    );
  }

  // Jo bhi current video ho uska link nikal kar embed format mein badlo
  const activeVideoUrl = currentLesson?.videoUrl || currentLesson?.url || course?.promoVideo;
  const embedUrl = getYouTubeEmbedUrl(activeVideoUrl);

  return (
    <View className="flex-1 bg-[#010206]">
      <StatusBar barStyle="light-content" hidden={false} />

      {/* 🔥 Real Video Player Area */}
      <View className="w-full bg-black aspect-video relative mt-8 border-b border-white/[0.05]">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center z-10"
        >
          <Text className="text-white text-lg font-bold">←</Text>
        </TouchableOpacity>

        {embedUrl ? (
          <WebView
            source={{ uri: embedUrl }}
            style={{ flex: 1, backgroundColor: 'black' }}
            allowsFullscreenVideo={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        ) : (
          <View className="flex-1 justify-center items-center">
             <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Video Available</Text>
          </View>
        )}
      </View>

      <View className="flex-1 px-6 pt-6">
        <Text className="text-2xl font-extrabold text-white tracking-wide mb-2">
          {course?.title}
        </Text>
        <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">
          {currentLesson ? `Playing: ${currentLesson.title}` : 'Overview'}
        </Text>

        <View className="flex-row border-b border-white/[0.1] mb-6">
          {['Lessons', 'Overview', 'Notes'].map((tab) => (
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
          {activeTab === 'Lessons' && (
            <View className="pb-24">
              {lessonList.length > 0 ? (
                lessonList.map((module: any, index: number) => {
                  const isPlaying = currentLesson?._id === module._id;
                  
                  return (
                    <TouchableOpacity 
                      key={module._id || index}
                      onPress={() => setCurrentLesson(module)} 
                      className={`${isPlaying ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#030612] border-white/[0.05]'} border p-4 rounded-2xl mb-3 flex-row items-center active:bg-white/[0.02]`}
                    >
                      <View className={`w-8 h-8 rounded-full items-center justify-center mr-4 ${isPlaying ? 'bg-emerald-500/20' : 'bg-white/[0.05]'}`}>
                        <Text className={`${isPlaying ? 'text-emerald-400' : 'text-slate-400'} font-bold text-xs`}>
                          {isPlaying ? '▶' : index + 1}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className={`${isPlaying ? 'text-emerald-400' : 'text-white'} font-bold text-sm mb-1`}>
                          {module.title || `Lesson ${index + 1}`}
                        </Text>
                        <Text className={`${isPlaying ? 'text-emerald-400/70' : 'text-slate-500'} text-[10px]`}>
                          {module.duration || 'Video Lesson'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View className="items-center py-10">
                  <Text className="text-slate-500 italic text-sm">Abhi is course mein koi lessons upload nahi hue hain.</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'Overview' && (
            <View className="pb-24">
              <Text className="text-slate-300 text-sm leading-relaxed mb-4">
                {course?.description || "Is course ki details abhi available nahi hain."}
              </Text>
              <View className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl mt-4">
                <Text className="text-emerald-400 font-bold mb-1 uppercase tracking-widest text-[10px]">Instructor details</Text>
                <Text className="text-slate-300 text-xs font-bold">
                  By {course?.teacherId?.name || 'Ustad'}
                </Text>
              </View>
            </View>
          )}

          {activeTab === 'Notes' && (
            <View className="items-center justify-center py-10 pb-24">
              <Text className="text-4xl mb-4">📝</Text>
              <Text className="text-slate-400 font-bold tracking-widest uppercase text-xs text-center">
                Notes aur PDF resources jaldi hi yahan milenge.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
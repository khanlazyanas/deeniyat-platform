import { View, Text, StatusBar, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, Image, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { API_URL } from '../../constants/config';

// Embed URL generator with 'origin' and 'playsinline'
const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;
  const match = regExp.exec(url);
  if (match && match[1].length === 11) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0&modestbranding=1&showinfo=0&controls=1&playsinline=1&origin=https://deeniyat-platform.vercel.app`;
  }
  return url; 
};

export default function LessonScreen() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]); 
  const [activeLesson, setActiveLesson] = useState<any>(null); 
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Lessons');

  // --- ASSIGNMENT SUBMISSION STATES ---
  const [assignmentText, setAssignmentText] = useState("");
  const [selectedFileUri, setSelectedFileUri] = useState<string | null>(null);
  const [submittingTask, setSubmittingTask] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);

  useEffect(() => {
    const fetchCourseAndLessons = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) throw new Error("Authentication required");

        // Fetch Course Detail
        const courseRes = await fetch(`${API_URL}/courses/${id}`);
        const courseData = await courseRes.json();
        const parsedCourse = courseData.course || courseData.data || courseData;
        setCourse(parsedCourse);

        // Fetch Lessons
        const lessonsRes = await fetch(`${API_URL}/lessons/course/${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (lessonsRes.ok) {
          const lessonsData = await lessonsRes.json();
          const fetchedLessons = Array.isArray(lessonsData) ? lessonsData : (lessonsData.data || []);
          
          setLessons(fetchedLessons);
          
          // Set Active Lesson
          if (fetchedLessons.length > 0) {
            setActiveLesson(fetchedLessons[0]); 
          } else if (parsedCourse?.promoVideo) {
            // Only fallback to promo if 0 lessons exist
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
        } else {
           console.log("Failed to fetch lessons. Status:", lessonsRes.status);
        }
      } catch (error) {
        console.error("Error fetching lesson data:", error);
        Alert.alert("Error", "Could not load course modules.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseAndLessons();
    }
  }, [id]);

  // --- CHECK EXISTING SUBMISSION WHENEVER ACTIVE LESSON CHANGES ---
  useEffect(() => {
    const checkSubmission = async () => {
      if (!activeLesson || activeLesson._id === 'promo_1') return;
      try {
        const token = await AsyncStorage.getItem('userToken');
        const res = await fetch(`${API_URL}/submissions/my-submissions`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const submissionsArray = Array.isArray(data) ? data : (data.data || []);
          const found = submissionsArray.find((sub: any) => {
            const subLessonId = sub.lessonId?._id ? String(sub.lessonId._id) : String(sub.lessonId);
            return subLessonId === String(activeLesson._id);
          });
          setExistingSubmission(found || null);
        }
      } catch (error) {
        console.error("Failed to check submission", error);
      }
    };
    checkSubmission();
  }, [activeLesson]);

  // --- FILE PICKER FOR ASSIGNMENT ---
  const pickAssignmentFile = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Gallery access is needed to upload homework.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedFileUri(result.assets[0].uri);
    }
  };

  // --- SUBMIT ASSIGNMENT TO BACKEND ---
  const handleAssignmentSubmit = async () => {
    if (!assignmentText.trim() && !selectedFileUri) {
      Alert.alert("Empty Submission", "Please write an answer or attach a file.");
      return;
    }

    setSubmittingTask(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const formData = new FormData();
      formData.append("courseId", id as string);
      
      if (activeLesson?._id && activeLesson._id !== 'promo_1') {
        formData.append("lessonId", activeLesson._id);
      }

      if (assignmentText.trim()) {
        formData.append("content", assignmentText);
      }

      if (selectedFileUri) {
        const filename = selectedFileUri.split('/').pop() || 'assignment.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        
        formData.append('document', {
          uri: selectedFileUri,
          name: filename,
          type,
        } as any);
      }

      const response = await fetch(`${API_URL}/submissions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Success! 🎉", "Assignment submitted to Ustad for review.");
        setExistingSubmission(data.submission || data || { status: 'Pending', content: assignmentText });
        setAssignmentText("");
        setSelectedFileUri(null);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        throw new Error(data.message || "Failed to submit assignment");
      }
    } catch (error: any) {
      console.error("Submission Error:", error);
      Alert.alert("Error", error.message || "Network Error");
    } finally {
      setSubmittingTask(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#010206] justify-center items-center">
        <ActivityIndicator size="large" color="#34d399" />
        <Text className="text-emerald-400 mt-5 font-black tracking-[4] uppercase text-[10px]">
          Initializing Studio...
        </Text>
      </View>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(activeLesson?.videoUrl);

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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#010206]">
      <StatusBar barStyle="light-content" hidden={false} />

      {/* Video Player Area */}
      <View className="w-full bg-[#030612] aspect-video relative mt-8 border-b border-white/[0.05] shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-20">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center z-30 backdrop-blur-md border border-white/[0.1]"
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
          <View className="flex-1 justify-center items-center bg-[#020510]">
             <Text className="text-5xl opacity-30 mb-2">🎥</Text>
             <Text className="text-slate-500 font-bold uppercase tracking-widest text-xs">No Video Found for this Lesson</Text>
          </View>
        )}
      </View>

      <View className="flex-1 px-6 pt-6 z-10 relative">
        <Text className="text-[26px] font-black text-white tracking-tighter mb-3 leading-[1.1] drop-shadow-md">
          {course?.title || "Course Title"}
        </Text>
        <Text className="text-emerald-400 text-[10px] font-black uppercase tracking-[3] mb-6 bg-emerald-500/10 self-start px-3 py-1.5 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
          {activeLesson ? activeLesson.title : 'Overview'}
        </Text>

        <View className="flex-row border-b border-white/[0.08] mb-6">
          {['Lessons', 'Overview', 'Assignments'].map((tab) => (
            <TouchableOpacity 
              key={tab}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab);
              }}
              className={`mr-6 pb-3 ${activeTab === tab ? 'border-b-2 border-emerald-400' : ''}`}
            >
              <Text className={`text-[11px] font-black tracking-[2] uppercase ${activeTab === tab ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-400 transition-colors'}`}>
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
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setActiveLesson(lesson);
                      }} 
                      activeOpacity={0.8}
                      className={`flex-row items-center p-5 mb-4 border rounded-[1.5rem] transition-all shadow-md ${
                        isPlaying 
                          ? 'bg-emerald-500/10 border-emerald-500/30' 
                          : 'bg-[#030612] border-white/[0.05]'
                      }`}
                    >
                      <View className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-inner ${
                        isPlaying 
                          ? "bg-gradient-to-br from-emerald-400 to-teal-500" 
                          : "bg-[#020510] border border-white/[0.08]"
                      }`}>
                         <Text className={`font-black text-[15px] ${isPlaying ? "text-[#010206]" : "text-slate-400"}`}>
                           {isPlaying ? "▶" : index + 1}
                         </Text>
                      </View>
                      
                      <View className="flex-1 pt-1">
                        <Text className={`font-black text-[16px] tracking-tight mb-1 ${isPlaying ? "text-emerald-400" : "text-slate-200"}`}>
                          {lesson.title}
                        </Text>
                        {isPlaying && (
                          <Text className="text-emerald-400/80 text-[9px] uppercase font-black tracking-[2]">
                            Currently Playing
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View className="items-center py-10 bg-[#030612] border border-white/[0.05] rounded-[2rem] shadow-inner p-6">
                  <Text className="text-4xl mb-4 opacity-50">📂</Text>
                  <Text className="text-slate-400 text-sm font-bold">Curriculum is being prepared.</Text>
                </View>
              )}
            </View>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === 'Overview' && (
            <View className="pb-24">
              {activeLesson?.content && (
                <View className="bg-[#030612]/80 border border-white/[0.08] rounded-[2.5rem] p-8 mb-8 shadow-lg">
                   <Text className="text-white font-black mb-6 text-xl tracking-tight flex items-center gap-2">
                     <Text className="text-emerald-400 text-2xl mr-2">📝</Text> Study Material
                   </Text>
                   <Text className="text-slate-300 leading-relaxed text-[15px] font-medium opacity-90">
                     {activeLesson.content}
                   </Text>
                </View>
              )}
              
              <View className="bg-gradient-to-b from-[#030612] to-[#010206] p-8 rounded-[2.5rem] border border-white/[0.05] shadow-inner">
                <Text className="text-slate-500 text-[10px] tracking-[3] uppercase font-black mb-3">Course Description</Text>
                <Text className="text-slate-400 text-sm leading-relaxed font-medium">
                  {course?.description || "Course overview not available."}
                </Text>
              </View>
            </View>
          )}

          {/* ASSIGNMENTS TAB - FULLY FUNCTIONAL FOR MOBILE */}
          {activeTab === 'Assignments' && (
            <View className="pb-24">
              {existingSubmission ? (
                // SUCCESS STATE
                <View className="bg-gradient-to-br from-emerald-900/20 to-[#010206] border border-emerald-500/30 rounded-[2.5rem] p-8 text-center items-center shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                  <View className="w-16 h-16 bg-emerald-400 rounded-full items-center justify-center mb-5 shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                    <Text className="text-[#010206] font-black text-3xl">✓</Text>
                  </View>
                  <Text className="text-white font-black text-[22px] tracking-tight mb-2">Task Submitted</Text>
                  <Text className="text-emerald-400 text-[10px] font-black uppercase tracking-[3] mb-8 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">Status: {existingSubmission.status || 'Pending Review'}</Text>
                  
                  <View className="w-full bg-[#020510] p-6 rounded-[1.5rem] border border-white/[0.08] shadow-inner text-left">
                    <Text className="text-slate-500 text-[9px] font-black uppercase tracking-[3] mb-3 border-b border-white/[0.05] pb-2">Your Answer</Text>
                    <Text className="text-slate-300 text-[15px] italic leading-relaxed font-medium">{existingSubmission.content || "Image Document attached."}</Text>
                  </View>
                </View>
              ) : (
                // SUBMISSION FORM STATE
                <View className="bg-gradient-to-b from-[#030612] to-[#020510] border border-white/[0.08] rounded-[2.5rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
                  <View className="flex-row items-center mb-8 border-b border-white/[0.05] pb-5">
                    <View className="w-12 h-12 bg-teal-500/10 border border-teal-500/30 rounded-[1rem] items-center justify-center mr-4 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                      <Text className="text-teal-400 text-xl">📝</Text>
                    </View>
                    <View>
                      <Text className="text-[22px] font-black text-white tracking-tight leading-none">Workspace</Text>
                      <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-[2] mt-1">Submit Assignment</Text>
                    </View>
                  </View>

                  <Text className="text-slate-400 text-[13px] font-medium mb-5 leading-relaxed">Type your written answer or securely upload a photo of your handwritten assignment.</Text>

                  {/* Text Input */}
                  <TextInput 
                    value={assignmentText}
                    onChangeText={setAssignmentText}
                    placeholder="Type your answer here..."
                    placeholderTextColor="#475569"
                    multiline
                    numberOfLines={5}
                    className="w-full bg-[#010206] border border-white/[0.08] rounded-[1.5rem] px-6 py-5 text-white font-medium mb-6 text-[15px] min-h-[120px] shadow-inner"
                    textAlignVertical="top"
                  />

                  {/* Image Picker Button */}
                  <TouchableOpacity onPress={pickAssignmentFile} activeOpacity={0.8} className="w-full bg-blue-500/10 border border-blue-500/30 rounded-[1.5rem] p-5 flex-row items-center justify-center mb-8 shadow-sm">
                    <Text className="text-blue-400 text-xl mr-3">📷</Text>
                    <Text className="text-blue-400 font-black text-[11px] uppercase tracking-[3]">
                      {selectedFileUri ? "Change Photo" : "Upload Photo"}
                    </Text>
                  </TouchableOpacity>

                  {/* Image Preview */}
                  {selectedFileUri && (
                    <View className="w-full h-48 bg-[#010206] rounded-[1.5rem] border border-white/[0.08] overflow-hidden mb-8 relative shadow-lg">
                      <Image source={{ uri: selectedFileUri }} className="w-full h-full opacity-80" resizeMode="cover" />
                      <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent']} style={StyleSheet.absoluteFillObject} />
                      <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedFileUri(null); }} className="absolute top-3 right-3 bg-red-500/80 p-2.5 rounded-full backdrop-blur-md border border-red-400/50">
                        <Text className="text-white text-[10px] font-black px-1">X</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Submit Button */}
                  <TouchableOpacity 
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleAssignmentSubmit(); }}
                    disabled={submittingTask || (!assignmentText && !selectedFileUri)}
                    activeOpacity={0.9}
                    className={`w-full py-5 rounded-full items-center shadow-[0_10px_30px_rgba(20,184,166,0.4)] ${submittingTask || (!assignmentText && !selectedFileUri) ? 'bg-[#020510] border border-teal-900' : 'bg-teal-400 border border-teal-300'}`}
                  >
                    {submittingTask ? (
                      <ActivityIndicator color="#010206" />
                    ) : (
                      <Text className={`font-black tracking-[3] uppercase text-[11px] ${submittingTask || (!assignmentText && !selectedFileUri) ? 'text-slate-500' : 'text-[#010206]'}`}>Submit Assignment</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
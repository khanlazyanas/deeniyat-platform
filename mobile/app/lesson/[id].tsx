import { View, Text, StatusBar, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // PDF ke liye 'expo-document-picker' chahiye, abhi image support kiya hai
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
        Alert.alert("Success! 🎉", "Assignment submitted to Ustad for review.");
        setExistingSubmission(data.submission || data || { status: 'Pending', content: assignmentText });
        setAssignmentText("");
        setSelectedFileUri(null);
      } else {
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
        <Text className="text-emerald-400 mt-4 font-bold tracking-[2] uppercase text-xs">
          Loading Studio...
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
      <View className="w-full bg-[#030612] aspect-video relative mt-8 border-b border-white/[0.05]">
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

          {/* ASSIGNMENTS TAB - FULLY FUNCTIONAL FOR MOBILE */}
          {activeTab === 'Assignments' && (
            <View className="pb-24">
              {existingSubmission ? (
                // SUCCESS STATE
                <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-[2rem] p-6 text-center items-center shadow-lg">
                  <View className="w-16 h-16 bg-emerald-400 rounded-full items-center justify-center mb-4">
                    <Text className="text-3xl">✓</Text>
                  </View>
                  <Text className="text-white font-bold text-lg mb-1">Task Submitted Successfully</Text>
                  <Text className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">Status: {existingSubmission.status || 'Pending Review'}</Text>
                  
                  <View className="w-full bg-[#010206] p-4 rounded-2xl border border-white/[0.05]">
                    <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2] mb-2">Your Answer:</Text>
                    <Text className="text-slate-300 text-sm italic">{existingSubmission.content || "Image attached."}</Text>
                  </View>
                </View>
              ) : (
                // SUBMISSION FORM STATE
                <View className="bg-[#030612] border border-white/[0.05] rounded-[2rem] p-6 shadow-lg">
                  <View className="flex-row items-center mb-6 border-b border-white/[0.05] pb-4">
                    <View className="w-10 h-10 bg-teal-500/10 border border-teal-500/20 rounded-xl items-center justify-center mr-4">
                      <Text className="text-teal-400 text-lg">📝</Text>
                    </View>
                    <Text className="text-xl font-bold text-white tracking-wide">Workspace</Text>
                  </View>

                  <Text className="text-slate-400 text-xs mb-4">Write your answer or upload a photo of your handwritten assignment.</Text>

                  {/* Text Input */}
                  <TextInput 
                    value={assignmentText}
                    onChangeText={setAssignmentText}
                    placeholder="Type your answer here..."
                    placeholderTextColor="#475569"
                    multiline
                    numberOfLines={4}
                    className="w-full bg-[#010206] border border-white/[0.05] rounded-2xl px-5 py-4 text-white font-medium mb-4 text-base min-h-[100px]"
                    textAlignVertical="top"
                  />

                  {/* Image Picker Button */}
                  <TouchableOpacity onPress={pickAssignmentFile} className="w-full bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex-row items-center justify-center mb-6">
                    <Text className="text-blue-400 text-lg mr-2">📷</Text>
                    <Text className="text-blue-400 font-bold text-xs uppercase tracking-widest">
                      {selectedFileUri ? "Change Photo" : "Upload Photo"}
                    </Text>
                  </TouchableOpacity>

                  {/* Image Preview */}
                  {selectedFileUri && (
                    <View className="w-full h-40 bg-[#010206] rounded-2xl border border-white/[0.05] overflow-hidden mb-6 relative">
                      <Image source={{ uri: selectedFileUri }} className="w-full h-full" resizeMode="cover" />
                      <TouchableOpacity onPress={() => setSelectedFileUri(null)} className="absolute top-2 right-2 bg-black/50 p-2 rounded-full">
                        <Text className="text-white text-xs font-bold">X</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Submit Button */}
                  <TouchableOpacity 
                    onPress={handleAssignmentSubmit}
                    disabled={submittingTask || (!assignmentText && !selectedFileUri)}
                    className={`w-full py-4 rounded-full items-center shadow-lg ${submittingTask || (!assignmentText && !selectedFileUri) ? 'bg-teal-500/50' : 'bg-teal-500 active:bg-teal-600'}`}
                  >
                    {submittingTask ? (
                      <ActivityIndicator color="#010206" />
                    ) : (
                      <Text className="text-[#010206] font-black tracking-[2] uppercase text-xs">Submit Assignment</Text>
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
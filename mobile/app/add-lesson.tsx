import { View, Text, StatusBar, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';

export default function AddLessonScreen() {
  const router = useRouter();
  // Agar specific course se aaya hai toh pre-fill karne ke liye
  const { courseId: initialCourseId } = useLocalSearchParams(); 

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    courseId: initialCourseId ? String(initialCourseId) : "",
    title: "",
    content: "",
    videoUrl: "",
    order: "1",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataString = await AsyncStorage.getItem('userData');
      
      if (!token || !userDataString) return;

      const user = JSON.parse(userDataString);
      setUserId(user._id || user.id);

      const response = await fetch(`${API_URL}/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const allCourses = Array.isArray(data) ? data : (data.data || []);
        
        // Sirf is Ustad ke banaye hue courses dikhane hain
        const myCoursesList = allCourses.filter(
          (c: any) => c.teacherId?._id === (user._id || user.id) || c.teacherId === (user._id || user.id)
        );
        
        setCourses(myCoursesList);
        
        // Agar list me 1 hi course hai aur form me courseId nahi hai, to usko select kar do
        if (myCoursesList.length > 0 && !formData.courseId) {
            setFormData(prev => ({ ...prev, courseId: myCoursesList[0]._id }));
        }
      }
    } catch (error) {
      console.error("Error fetching courses for dropdown:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.courseId) return Alert.alert("Error", "Please select a Target Course.");
    if (!formData.title.trim()) return Alert.alert("Error", "Module Title is required.");
    if (!formData.content.trim()) return Alert.alert("Error", "Study Material/Content is required.");
    if (!formData.order) return Alert.alert("Error", "Please specify the Lesson Index (Order).");

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const payload = {
        ...formData,
        order: Number(formData.order)
      };

      const response = await fetch(`${API_URL}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success! 🎉", "Lesson published successfully to the curriculum!");
        // Form Reset (course ID wahi rehne do)
        setFormData(prev => ({ ...prev, title: "", content: "", videoUrl: "", order: String(Number(prev.order) + 1) }));
      } else {
        throw new Error(data.message || "Failed to publish lesson");
      }
    } catch (error: any) {
      console.error("Submit Lesson Error:", error);
      Alert.alert("Error", error.message || "Could not publish lesson.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#010206] justify-center items-center">
        <ActivityIndicator size="large" color="#34d399" />
        <Text className="text-emerald-400 mt-4 font-bold tracking-[2] uppercase text-xs">Fetching Curriculum...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#010206]">
      <StatusBar barStyle="light-content" />

      <View className="flex-1 pt-16">
        
        {/* 🟢 HEADER SECTION */}
        <View className="px-6 mb-6 flex-row items-center justify-between">
          <View>
            <View className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full self-start mb-2 flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
              <Text className="text-emerald-400 text-[9px] font-black tracking-[2] uppercase">
                Ustad Studio
              </Text>
            </View>
            <Text className="text-3xl font-extrabold text-white tracking-wide">
              Add Lesson<Text className="text-emerald-400">.</Text>
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/5 rounded-full items-center justify-center border border-white/10 active:bg-white/10"
          >
            <Text className="text-white text-lg font-bold">←</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
          <View className="bg-[#030612] border border-white/[0.05] rounded-[2rem] p-6 mb-24 shadow-lg space-y-6">
            
            {/* Target Course Dropdown (Simulated for RN if Picker not installed) */}
            <View>
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2] mb-2 pl-1">Target Course *</Text>
              
              <View className="w-full bg-[#010206] border border-white/[0.05] rounded-2xl px-5 py-4 flex-row items-center justify-between">
                 <Text className={`font-bold ${formData.courseId ? 'text-white' : 'text-slate-500'}`} numberOfLines={1}>
                    {formData.courseId 
                      ? (courses.find(c => c._id === formData.courseId)?.title || "Course Selected") 
                      : "Tap to select a course"}
                 </Text>
                 <Text className="text-slate-500 font-bold">▼</Text>
                 
                 {/* Invisible Native Dropdown overlay */}
                 <select 
                    value={formData.courseId} 
                    onChange={(e) => handleChange('courseId', e.target.value)}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0 }}
                 >
                    <option value="" disabled>Select Course</option>
                    {courses.map(course => (
                       <option key={course._id} value={course._id}>{course.title}</option>
                    ))}
                 </select>
              </View>
            </View>

            {/* Index & Title Grid */}
            <View className="flex-row gap-4">
              <View className="w-24">
                <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[1.5] mb-2 pl-1">Index</Text>
                <TextInput 
                  value={formData.order}
                  onChangeText={(val) => handleChange('order', val)}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor="#475569"
                  className="w-full bg-[#010206] border border-white/[0.05] rounded-2xl px-5 py-4 text-white font-bold text-center"
                />
              </View>
              <View className="flex-1">
                <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[1.5] mb-2 pl-1">Module Title *</Text>
                <TextInput 
                  value={formData.title}
                  onChangeText={(val) => handleChange('title', val)}
                  placeholder="e.g. Intro to Makharij"
                  placeholderTextColor="#475569"
                  className="w-full bg-[#010206] border border-white/[0.05] rounded-2xl px-5 py-4 text-white font-bold"
                />
              </View>
            </View>

            {/* Video URL */}
            <View>
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2] mb-2 pl-1">Video URL <Text className="lowercase text-[9px]">(Optional)</Text></Text>
              <TextInput 
                value={formData.videoUrl}
                onChangeText={(val) => handleChange('videoUrl', val)}
                placeholder="https://youtube.com/watch?v=..."
                placeholderTextColor="#475569"
                keyboardType="url"
                className="w-full bg-[#010206] border border-white/[0.05] rounded-2xl px-5 py-4 text-white font-medium text-xs"
              />
            </View>

            {/* Content / Notes */}
            <View>
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2] mb-2 pl-1">Study Material *</Text>
              <TextInput 
                value={formData.content}
                onChangeText={(val) => handleChange('content', val)}
                placeholder="Write the study material or summary for this lesson here..."
                placeholderTextColor="#475569"
                multiline
                numberOfLines={6}
                className="w-full bg-[#010206] border border-white/[0.05] rounded-2xl px-5 py-4 text-white font-medium min-h-[120px]"
                textAlignVertical="top"
              />
            </View>

            {/* 🚀 SUBMIT BUTTON */}
            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={submitting}
              className={`w-full py-5 mt-4 rounded-[1.5rem] items-center flex-row justify-center shadow-[0_10px_30px_rgba(52,211,153,0.3)] ${
                submitting ? 'bg-emerald-900 border border-emerald-800' : 'bg-emerald-400 active:bg-emerald-500'
              }`}
            >
              {submitting ? (
                <ActivityIndicator color="#34d399" />
              ) : (
                <Text className="text-[#010206] font-black tracking-[2] uppercase text-sm">Publish Lesson</Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>

      </View>
    </KeyboardAvoidingView>
  );
}
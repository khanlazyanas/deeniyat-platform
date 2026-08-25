import { View, Text, StatusBar, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';

const { width } = Dimensions.get('window');

export default function CreateCourseScreen() {
  const router = useRouter();

  // 📝 Form States
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "Beginner",
    thumbnail: "",
    promoVideo: "",
    price: "",
    gstPercentage: "",
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCreateCourse = async () => {
    // 🛡️ Basic Validation
    if (!formData.title.trim()) {
      Alert.alert("Missing Info", "Course Title is required.");
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert("Missing Info", "Course Description is required.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataString = await AsyncStorage.getItem('userData');
      const userId = userDataString ? JSON.parse(userDataString)._id : null;

      // Hit Backend API
      const response = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? Number(formData.price) : 0,
          gstPercentage: formData.gstPercentage ? Number(formData.gstPercentage) : 0,
          teacherId: userId
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success! 🎉", "Curriculum published successfully.");
        // Apprently frontend redirects to manage-courses or my-courses, we go back to profile or manage-courses.
        router.back();
      } else {
        throw new Error(data.message || "Failed to publish curriculum.");
      }
    } catch (error: any) {
      console.error("Create Course Error:", error);
      Alert.alert("Network Error", error.message || "Could not publish course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-[#010206]"
    >
      <StatusBar barStyle="light-content" />

      <View className="flex-1 pt-16">
        
        {/* 🟢 HEADER */}
        <View className="px-6 mb-6 flex-row items-center justify-between">
          <View>
            <View className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full self-start mb-2 flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
              <Text className="text-emerald-400 text-[9px] font-black tracking-[2] uppercase">
                Ustad Studio
              </Text>
            </View>
            <Text className="text-3xl font-extrabold text-white tracking-wide">
              Create Course<Text className="text-emerald-400">.</Text>
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
            
            {/* 🎯 CORE INFO SECTION */}
            <View className="flex-row items-center mb-2 border-b border-white/[0.05] pb-4">
               <Text className="text-emerald-400 text-lg mr-2">1.</Text>
               <Text className="text-white font-bold text-base tracking-widest uppercase">Core Info</Text>
            </View>

            <View>
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2] mb-2 pl-1">Course Title *</Text>
              <TextInput 
                value={formData.title}
                onChangeText={(val) => handleChange('title', val)}
                placeholder="e.g. Fundamentals of Tajweed"
                placeholderTextColor="#475569"
                className="w-full bg-[#010206] border border-white/[0.05] rounded-2xl px-5 py-4 text-white font-bold"
              />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[1.5] mb-2 pl-1">Price (₹) <Text className="lowercase text-[9px]">(0 = Free)</Text></Text>
                <TextInput 
                  value={formData.price}
                  onChangeText={(val) => handleChange('price', val)}
                  keyboardType="numeric"
                  placeholder="e.g. 499"
                  placeholderTextColor="#475569"
                  className="w-full bg-[#010206] border border-white/[0.05] rounded-2xl px-5 py-4 text-white font-bold"
                />
              </View>
              <View className="flex-1">
                <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[1.5] mb-2 pl-1">GST (%) <Text className="lowercase text-[9px]">(0 = Nil)</Text></Text>
                <TextInput 
                  value={formData.gstPercentage}
                  onChangeText={(val) => handleChange('gstPercentage', val)}
                  keyboardType="numeric"
                  placeholder="e.g. 18"
                  placeholderTextColor="#475569"
                  className="w-full bg-[#010206] border border-white/[0.05] rounded-2xl px-5 py-4 text-white font-bold"
                />
              </View>
            </View>

            <View>
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2] mb-2 pl-1">Skill Level</Text>
              <View className="flex-row gap-2">
                {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                  <TouchableOpacity 
                    key={lvl}
                    onPress={() => handleChange('level', lvl)}
                    className={`flex-1 py-3 rounded-xl items-center border ${formData.level === lvl ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-[#010206] border-white/10 text-slate-400'}`}
                  >
                    <Text className={`text-[10px] font-bold tracking-widest uppercase ${formData.level === lvl ? 'text-emerald-400' : 'text-slate-400'}`}>{lvl}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 📚 CURRICULUM SECTION */}
            <View className="flex-row items-center mb-2 mt-6 border-b border-white/[0.05] pb-4">
               <Text className="text-emerald-400 text-lg mr-2">2.</Text>
               <Text className="text-white font-bold text-base tracking-widest uppercase">Curriculum</Text>
            </View>

            <View>
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2] mb-2 pl-1">Course Overview *</Text>
              <TextInput 
                value={formData.description}
                onChangeText={(val) => handleChange('description', val)}
                placeholder="What will students learn in this course?..."
                placeholderTextColor="#475569"
                multiline
                numberOfLines={6}
                className="w-full bg-[#010206] border border-white/[0.05] rounded-2xl px-5 py-4 text-white font-medium min-h-[120px]"
                textAlignVertical="top"
              />
            </View>

            {/* 🎬 MEDIA & PUBLISH SECTION */}
            <View className="flex-row items-center mb-2 mt-6 border-b border-white/[0.05] pb-4">
               <Text className="text-emerald-400 text-lg mr-2">3.</Text>
               <Text className="text-white font-bold text-base tracking-widest uppercase">Media & Publish</Text>
            </View>

            <View>
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2] mb-2 pl-1">Thumbnail Image URL</Text>
              <TextInput 
                value={formData.thumbnail}
                onChangeText={(val) => handleChange('thumbnail', val)}
                placeholder="https://example.com/cover.jpg"
                placeholderTextColor="#475569"
                className="w-full bg-[#010206] border border-white/[0.05] rounded-2xl px-5 py-4 text-white font-medium text-xs"
              />
            </View>

            <View>
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2] mb-2 pl-1">Promo Video URL (Optional)</Text>
              <TextInput 
                value={formData.promoVideo}
                onChangeText={(val) => handleChange('promoVideo', val)}
                placeholder="https://youtube.com/watch?v=..."
                placeholderTextColor="#475569"
                className="w-full bg-[#010206] border border-white/[0.05] rounded-2xl px-5 py-4 text-white font-medium text-xs"
              />
            </View>

            {/* Note UI */}
            <View className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex-row items-center gap-3">
               <Text className="text-xl">ℹ️</Text>
               <Text className="text-blue-400 text-xs flex-1">This creates the Course Shell. You can add lesson videos later.</Text>
            </View>

            {/* 🚀 SUBMIT BUTTON */}
            <TouchableOpacity 
              onPress={handleCreateCourse}
              disabled={loading}
              className={`w-full py-5 mt-6 rounded-[1.5rem] items-center flex-row justify-center shadow-[0_10px_30px_rgba(52,211,153,0.3)] ${
                loading ? 'bg-emerald-900 border border-emerald-800' : 'bg-emerald-400 active:bg-emerald-500'
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#34d399" />
              ) : (
                <Text className="text-[#010206] font-black tracking-[2] uppercase text-sm">Publish Course</Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>

      </View>
    </KeyboardAvoidingView>
  );
}
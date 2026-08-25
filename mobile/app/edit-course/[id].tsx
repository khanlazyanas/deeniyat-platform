import { View, Text, StatusBar, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/config';

export default function EditCourseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Gets the course ID from the URL

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
  
  const [fetching, setFetching] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/courses/${id}`);
      const data = await response.json();

      if (response.ok) {
        setFormData({
          title: data.title || "",
          description: data.description || "",
          level: data.level || "Beginner",
          thumbnail: data.thumbnail || "",
          promoVideo: data.promoVideo || "",
          price: data.price ? String(data.price) : "",
          gstPercentage: data.gstPercentage ? String(data.gstPercentage) : "",
        });
      } else {
        Alert.alert("Error", data.message || "Failed to load course details.");
        router.back();
      }
    } catch (error) {
      console.error("Error fetching course for edit:", error);
      Alert.alert("Error", "Network connection failed.");
      router.back();
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleUpdateCourse = async () => {
    // 🛡️ Basic Validation
    if (!formData.title.trim()) {
      Alert.alert("Missing Info", "Course Title is required.");
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert("Missing Info", "Course Description is required.");
      return;
    }

    setUpdating(true);
    try {
      const token = await AsyncStorage.getItem('userToken');

      // Hit Backend PUT API
      const response = await fetch(`${API_URL}/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? Number(formData.price) : 0,
          gstPercentage: formData.gstPercentage ? Number(formData.gstPercentage) : 0,
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success! 🌟", "Course updated successfully.");
        // Redirect back to manage courses or the previous screen
        router.back();
      } else {
        throw new Error(data.message || "Failed to update course.");
      }
    } catch (error: any) {
      console.error("Update Course Error:", error);
      Alert.alert("Update Error", error.message || "Could not update course.");
    } finally {
      setUpdating(false);
    }
  };

  if (fetching) {
    return (
      <View className="flex-1 bg-[#010206] justify-center items-center">
        <ActivityIndicator size="large" color="#60a5fa" />
        <Text className="text-blue-400 mt-4 font-bold tracking-[2] uppercase text-xs">Loading Course Data...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-[#010206]"
    >
      <StatusBar barStyle="light-content" />

      <View className="flex-1 pt-16">
        
        {/* 🔵 HEADER */}
        <View className="px-6 mb-6 flex-row items-center justify-between">
          <View>
            <View className="bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-full self-start mb-2 flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5 animate-pulse" />
              <Text className="text-blue-400 text-[9px] font-black tracking-[2] uppercase">
                Edit Mode
              </Text>
            </View>
            <Text className="text-3xl font-extrabold text-white tracking-wide">
              Update Course<Text className="text-blue-400">.</Text>
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
               <Text className="text-blue-400 text-lg mr-2">1.</Text>
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
                    className={`flex-1 py-3 rounded-xl items-center border ${formData.level === lvl ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-[#010206] border-white/10 text-slate-400'}`}
                  >
                    <Text className={`text-[10px] font-bold tracking-widest uppercase ${formData.level === lvl ? 'text-blue-400' : 'text-slate-400'}`}>{lvl}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 📚 CURRICULUM SECTION */}
            <View className="flex-row items-center mb-2 mt-6 border-b border-white/[0.05] pb-4">
               <Text className="text-blue-400 text-lg mr-2">2.</Text>
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
               <Text className="text-blue-400 text-lg mr-2">3.</Text>
               <Text className="text-white font-bold text-base tracking-widest uppercase">Media & Content</Text>
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

            {/* 🚀 SUBMIT BUTTON */}
            <TouchableOpacity 
              onPress={handleUpdateCourse}
              disabled={updating}
              className={`w-full py-5 mt-8 rounded-[1.5rem] items-center flex-row justify-center shadow-[0_10px_30px_rgba(59,130,246,0.3)] ${
                updating ? 'bg-blue-900 border border-blue-800' : 'bg-blue-500 active:bg-blue-600'
              }`}
            >
              {updating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-black tracking-[2] uppercase text-sm">Save Changes</Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>

      </View>
    </KeyboardAvoidingView>
  );
}
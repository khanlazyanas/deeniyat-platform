import { View, Text, StatusBar, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';

export default function MyGradesScreen() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyGrades();
  }, []);

  const fetchMyGrades = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      // Fetching the user's submissions to see their grades
      const response = await fetch(`${API_URL}/submissions/my-submissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const submissionsList = Array.isArray(data) ? data : (data.data || []);
        setSubmissions(submissionsList);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#010206] pt-16">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="px-6 mb-6 flex-row items-center justify-between">
        <View>
          <Text className="text-emerald-400 text-[10px] font-black tracking-[3] uppercase mb-1">
            Academic Record
          </Text>
          <Text className="text-3xl font-extrabold text-white tracking-wide">
            My Grades<Text className="text-emerald-400">.</Text>
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-white/5 rounded-full items-center justify-center border border-white/10 active:bg-white/10"
        >
          <Text className="text-white text-lg font-bold">←</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#34d399" />
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-4">Loading Performance...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
          
          {submissions.length === 0 ? (
            <View className="bg-[#030612] border border-white/[0.05] rounded-[2rem] p-10 items-center justify-center mt-6 shadow-inner">
              <Text className="text-5xl mb-4">🏆</Text>
              <Text className="text-slate-300 text-sm font-bold tracking-widest uppercase mb-2 text-center">No Grades Yet</Text>
              <Text className="text-slate-500 text-xs text-center max-w-[200px]">
                Submit your assignments in the lesson player to receive grades from your Ustad.
              </Text>
            </View>
          ) : (
            <View className="pb-24 space-y-4">
              {submissions.map((sub: any, index: number) => {
                const isGraded = sub.status === 'Graded' || sub.marks;
                
                return (
                  <View 
                    key={sub._id || index} 
                    className="bg-[#030612] border border-white/[0.08] rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                  >
                    <View className="flex-row justify-between items-start mb-4 border-b border-white/[0.05] pb-4">
                      <View className="flex-1 pr-4">
                        <Text className="text-slate-400 text-[10px] font-black tracking-widest uppercase mb-1">
                          Course Module
                        </Text>
                        <Text className="text-white font-bold text-base leading-tight">
                          {sub.courseId?.title || "Enrolled Course"}
                        </Text>
                      </View>
                      
                      {/* Status Badge */}
                      <View className={`px-3 py-1.5 rounded-full border ${isGraded ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                        <Text className={`text-[9px] font-black tracking-widest uppercase ${isGraded ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {isGraded ? 'Graded' : 'Pending Review'}
                        </Text>
                      </View>
                    </View>

                    {/* Content Submitted */}
                    <Text className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-2">Your Submission:</Text>
                    <Text className="text-slate-300 text-sm italic mb-4" numberOfLines={2}>
                      "{sub.content || "Document/Image Attached"}"
                    </Text>

                    {/* Grade Section */}
                    {isGraded ? (
                      <View className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex-row justify-between items-center">
                        <View>
                          <Text className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Score Obtained</Text>
                          <Text className="text-emerald-400 text-2xl font-black">{sub.marks}<Text className="text-sm text-slate-500 font-bold"> / 100</Text></Text>
                        </View>
                        <Text className="text-4xl">🌟</Text>
                      </View>
                    ) : (
                      <View className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex-row items-center justify-center">
                        <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest">Awaiting Ustad's Feedback</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
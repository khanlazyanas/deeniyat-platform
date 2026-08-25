import { View, Text, StatusBar, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';

export default function AttendanceScreen() {
  const router = useRouter();
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      // Tumhare backend ki attendance API hit hogi yahan
      // API_URL/attendance/my-attendance ya jo bhi tumhara route ho
      const response = await fetch(`${API_URL}/attendance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const records = Array.isArray(data) ? data : (data.data || []);
        setAttendanceData(records);
      } else {
        // Agar API abhi ready nahi hai, toh empty dikhayenge
        setAttendanceData([]);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
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
          <Text className="text-blue-400 text-[10px] font-black tracking-[3] uppercase mb-1">
            Academic Record
          </Text>
          <Text className="text-3xl font-extrabold text-white tracking-wide">
            Attendance<Text className="text-blue-400">.</Text>
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
          <ActivityIndicator size="large" color="#60a5fa" />
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-4">Fetching Records...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
          
          {attendanceData.length === 0 ? (
            <View className="bg-[#030612] border border-white/[0.05] rounded-[2rem] p-10 items-center justify-center mt-6 shadow-inner">
              <Text className="text-5xl mb-4">📅</Text>
              <Text className="text-slate-300 text-sm font-bold tracking-widest uppercase mb-2 text-center">No Records Found</Text>
              <Text className="text-slate-500 text-xs text-center max-w-[200px]">
                Your attendance records will appear here once classes begin.
              </Text>
            </View>
          ) : (
            <View className="pb-24 space-y-4">
              {attendanceData.map((record: any, index: number) => {
                const isPresent = record.status === 'Present';
                
                return (
                  <View 
                    key={record._id || index} 
                    className="bg-[#030612] border border-white/[0.08] rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex-row items-center justify-between"
                  >
                    <View className="flex-1 pr-4">
                      <Text className="text-slate-400 text-[10px] font-black tracking-widest uppercase mb-1">
                        {new Date(record.date || Date.now()).toDateString()}
                      </Text>
                      <Text className="text-white font-bold text-base leading-tight">
                        {record.courseId?.title || "Enrolled Course"}
                      </Text>
                    </View>
                    
                    {/* Status Badge */}
                    <View className={`px-4 py-2 rounded-full border ${isPresent ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                      <Text className={`text-[10px] font-black tracking-widest uppercase ${isPresent ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPresent ? 'Present' : 'Absent'}
                      </Text>
                    </View>
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
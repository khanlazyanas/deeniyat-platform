import { View, Text, StatusBar, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';

export default function TransactionsScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      // Tumhare backend ki transactions/orders API
      const response = await fetch(`${API_URL}/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const records = Array.isArray(data) ? data : (data.data || []);
        setTransactions(records);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
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
          <Text className="text-amber-400 text-[10px] font-black tracking-[3] uppercase mb-1">
            Billing & Payments
          </Text>
          <Text className="text-3xl font-extrabold text-white tracking-wide">
            Transactions<Text className="text-amber-400">.</Text>
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
          <ActivityIndicator size="large" color="#fbbf24" />
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-4">Loading History...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
          
          {transactions.length === 0 ? (
            <View className="bg-[#030612] border border-white/[0.05] rounded-[2rem] p-10 items-center justify-center mt-6 shadow-inner">
              <Text className="text-5xl mb-4">💳</Text>
              <Text className="text-slate-300 text-sm font-bold tracking-widest uppercase mb-2 text-center">No Transactions Yet</Text>
              <Text className="text-slate-500 text-xs text-center max-w-[200px]">
                Your course purchases and free enrollments will appear here.
              </Text>
            </View>
          ) : (
            <View className="pb-24 space-y-4">
              {transactions.map((txn: any, index: number) => {
                const isSuccess = txn.status === 'Completed' || txn.status === 'Success';
                
                return (
                  <View 
                    key={txn._id || index} 
                    className="bg-[#030612] border border-white/[0.08] rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                  >
                    <View className="flex-row justify-between items-start mb-4 border-b border-white/[0.05] pb-4">
                      <View className="flex-1 pr-4">
                        <Text className="text-slate-400 text-[10px] font-black tracking-widest uppercase mb-1">
                          {new Date(txn.createdAt || Date.now()).toDateString()}
                        </Text>
                        <Text className="text-white font-bold text-base leading-tight">
                          {txn.courseId?.title || txn.description || "Course Enrollment"}
                        </Text>
                      </View>
                      
                      {/* Amount */}
                      <Text className="text-amber-400 font-black text-lg">
                        {txn.amount ? `₹${txn.amount}` : 'FREE'}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between">
                      <Text className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">
                        Txn ID: {txn._id?.substring(0, 8).toUpperCase() || "N/A"}
                      </Text>
                      
                      {/* Status Badge */}
                      <View className={`px-3 py-1.5 rounded-full border ${isSuccess ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
                        <Text className={`text-[9px] font-black tracking-widest uppercase ${isSuccess ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {isSuccess ? 'Completed' : (txn.status || 'Processed')}
                        </Text>
                      </View>
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
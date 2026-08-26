import { View, Text, StatusBar, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useAudioPlayer } from 'expo-audio'; 
import { API_URL } from '../constants/config';

// 🎵 Modern Audio Player Component (Using expo-audio)
const AudioPlayer = ({ url }: { url: string }) => {
  // Hook automatically manages loading, playing state, and memory!
  const player = useAudioPlayer(url);

  return (
    <View className="bg-[#040814] p-4 rounded-2xl border border-white/[0.05] flex-row items-center justify-between shadow-inner">
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(52,211,153,0.2)]">
          <Text className="text-emerald-400 text-lg">🎧</Text>
        </View>
        <Text className="text-white font-bold text-xs">Voice Recording</Text>
      </View>
      
      <TouchableOpacity 
        onPress={() => player.playing ? player.pause() : player.play()}
        activeOpacity={0.8}
        className="px-6 py-2.5 bg-emerald-500 rounded-full active:bg-emerald-600 shadow-[0_0_15px_rgba(52,211,153,0.4)]"
      >
        <Text className="text-[#010206] font-black uppercase tracking-widest text-[10px]">
          {player.playing ? "Pause" : "Play"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function SubmissionsScreen() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Graded'>('Pending');

  // Grading States
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState("A");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchSubmissions();
    }, [])
  );

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/submissions/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🤖 Generate AI Feedback
  const generateAIFeedback = async (content: string, studentName: string) => {
    if (!gradeInput) return;
    setIsGeneratingAI(true);
    setFeedbackInput("Generating AI feedback... please wait...");

    try {
      // NOTE: Mobile app needs the absolute path to your Next.js API or Backend API for AI.
      const aiEndpoint = API_URL.replace('/api', '/api/generate-feedback'); 
      
      const response = await fetch(aiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content || '', grade: gradeInput, studentName: studentName || 'Student' })
      });

      if (!response.ok) throw new Error("AI Server Error");

      const aiText = await response.text();
      setFeedbackInput(aiText);
    } catch (error: any) {
      console.error("Failed to generate AI feedback:", error);
      setFeedbackInput(`Error: Could not connect to AI. Please write manually.`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // 📝 Submit Final Grade
  const handleGradeSubmit = async (submissionId: string) => {
    setSubmitLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/submissions/${submissionId}/grade`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ grade: gradeInput, feedback: feedbackInput })
      });

      if (response.ok) {
        Alert.alert("Success 🌟", "Assignment graded successfully!");
        setGradingId(null);
        setGradeInput("A");
        setFeedbackInput("");
        fetchSubmissions(); 
      } else {
        const errData = await response.json();
        Alert.alert("Error", errData.message || "Failed to save grade.");
      }
    } catch (error) {
      Alert.alert("Network Error", "Could not submit grade.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(sub => sub.status === activeTab);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#010206]">
      <StatusBar barStyle="light-content" />

      <View className="flex-1 pt-16">
        
        {/* 🟢 HEADER SECTION */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-amber-400 text-[10px] font-black tracking-[3] uppercase mb-1">
                Grading Portal
              </Text>
              <Text className="text-3xl font-extrabold text-white tracking-wide">
                Review Tasks<Text className="text-amber-400">.</Text>
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/5 rounded-full items-center justify-center border border-white/10 active:bg-white/10"
            >
              <Text className="text-white text-lg font-bold">←</Text>
            </TouchableOpacity>
          </View>

          {/* 🏷️ TABS */}
          <View className="flex-row bg-[#010206] border border-white/[0.06] p-1.5 rounded-2xl shadow-inner mt-2">
            <TouchableOpacity 
              onPress={() => setActiveTab('Pending')}
              className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'Pending' ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-transparent border border-transparent'}`}
            >
              <Text className={`text-[11px] font-black uppercase tracking-widest ${activeTab === 'Pending' ? 'text-amber-400' : 'text-slate-500'}`}>
                Pending ({submissions.filter(s => s.status === 'Pending').length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveTab('Graded')}
              className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'Graded' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-transparent border border-transparent'}`}
            >
              <Text className={`text-[11px] font-black uppercase tracking-widest ${activeTab === 'Graded' ? 'text-emerald-400' : 'text-slate-500'}`}>
                Graded ({submissions.filter(s => s.status === 'Graded').length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 📚 SUBMISSIONS LIST */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#f59e0b" />
            <Text className="text-amber-500 text-xs font-bold uppercase tracking-widest mt-4">Accessing Database...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
            
            {filteredSubmissions.length === 0 ? (
              <View className="bg-[#030612] border border-white/[0.05] rounded-[2rem] p-10 items-center justify-center mt-6 shadow-inner">
                <Text className="text-5xl mb-4">🏆</Text>
                <Text className="text-slate-300 text-sm font-bold tracking-widest uppercase mb-2 text-center">Inbox Clear</Text>
                <Text className="text-slate-500 text-xs text-center max-w-[200px] mb-6">
                  No {activeTab.toLowerCase()} submissions found. You're all caught up!
                </Text>
              </View>
            ) : (
              <View className="pb-24 space-y-6">
                {filteredSubmissions.map((sub: any, index: number) => {
                  const isGradingThis = gradingId === sub._id;

                  return (
                    <View 
                      key={sub._id || index} 
                      className={`bg-[#030612] border rounded-[2rem] p-6 shadow-lg ${
                        isGradingThis ? 'border-amber-500/50' : 'border-white/[0.08]'
                      }`}
                    >
                      {/* Top Header: Student Info */}
                      <View className="flex-row items-start justify-between border-b border-white/[0.05] pb-4 mb-4">
                        <View className="flex-row items-center gap-3">
                          <View className="w-12 h-12 rounded-full bg-[#060d20] border border-white/[0.1] items-center justify-center">
                            <Text className="text-emerald-400 font-black text-xl uppercase">{sub.studentId?.name?.charAt(0) || '?'}</Text>
                          </View>
                          <View>
                            <Text className="text-white font-black text-lg tracking-tight">{sub.studentId?.name || 'Unknown Student'}</Text>
                            <Text className="text-[9px] font-black uppercase text-amber-400 tracking-[0.1em] mt-0.5 bg-amber-500/10 px-2 py-0.5 rounded self-start border border-amber-500/20">
                              {sub.lessonId?.title || 'Unknown Lecture'}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-[10px] font-bold text-slate-500">
                          {new Date(sub.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </Text>
                      </View>

                      {/* Content Preview */}
                      <View className="space-y-4 mb-6">
                        {/* Attached Document */}
                        {sub.documentUrl && (
                          <View>
                            <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Attached Document</Text>
                            <View className="bg-[#040814] p-4 rounded-2xl border border-white/[0.05] flex-row justify-between items-center">
                              <Text className="text-blue-400 font-bold text-xs" numberOfLines={1}>Student_Attachment</Text>
                              <Text className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Link Provided</Text>
                            </View>
                          </View>
                        )}

                        {/* Audio Recording */}
                        {sub.audioFileUrl && (
                          <View>
                            <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Student Recording</Text>
                            <AudioPlayer url={sub.audioFileUrl} />
                          </View>
                        )}

                        {/* Written Content */}
                        {sub.content && (
                          <View>
                            <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Written Response</Text>
                            <View className="bg-[#040814] p-4 rounded-2xl border border-white/[0.05]">
                              <Text className="text-slate-300 text-sm leading-relaxed">{sub.content}</Text>
                            </View>
                          </View>
                        )}

                        {!sub.audioFileUrl && !sub.content && !sub.documentUrl && (
                           <Text className="text-red-400 text-xs italic">No content provided in this submission.</Text>
                        )}
                      </View>

                      {/* Bottom Action: Grade / Eval Panel */}
                      {sub.status === 'Graded' ? (
                        <View className="bg-emerald-900/10 border border-emerald-500/20 rounded-[1.5rem] p-5 flex-row items-center gap-4 shadow-inner">
                          <View className="bg-[#010206] p-3 rounded-xl border border-white/[0.05] items-center justify-center min-w-[60px]">
                            <Text className="text-[9px] font-black text-slate-500 uppercase mb-1">Grade</Text>
                            <Text className="text-2xl font-black text-emerald-400 leading-none">{sub.grade}</Text>
                          </View>
                          <View className="flex-1">
                            <Text className="text-[10px] font-black text-emerald-500 uppercase mb-1 tracking-widest">Your Feedback</Text>
                            <Text className="text-slate-300 text-xs leading-relaxed" numberOfLines={3}>{sub.feedback}</Text>
                          </View>
                        </View>
                      ) : (
                        <View>
                          {isGradingThis ? (
                            <View className="bg-[#010206]/80 p-5 rounded-[1.5rem] border border-amber-500/30">
                              <Text className="text-amber-400 font-black text-sm uppercase tracking-widest mb-4">Evaluation Panel</Text>
                              
                              {/* Grade Dropdown Setup */}
                              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Assign Grade</Text>
                              <View className="flex-row gap-2 mb-4">
                                {["A+", "A", "B", "C", "Needs Revision"].map(gradeOption => (
                                  <TouchableOpacity 
                                    key={gradeOption}
                                    onPress={() => setGradeInput(gradeOption)}
                                    className={`px-3 py-2 border rounded-lg ${gradeInput === gradeOption ? 'bg-amber-500/10 border-amber-500 text-amber-400' : 'bg-[#030612] border-white/10'}`}
                                  >
                                    <Text className={`text-[10px] font-bold ${gradeInput === gradeOption ? 'text-amber-400' : 'text-slate-400'}`}>{gradeOption}</Text>
                                  </TouchableOpacity>
                                ))}
                              </View>

                              {/* AI Feedback */}
                              <View className="flex-row justify-between items-center mb-2 pl-1">
                                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feedback (Optional)</Text>
                                <TouchableOpacity 
                                  onPress={() => generateAIFeedback(sub.content, sub.studentId?.name)}
                                  disabled={isGeneratingAI || submitLoading}
                                  className="bg-indigo-500/10 border border-indigo-500/30 px-2 py-1 rounded flex-row items-center gap-1 active:bg-indigo-500/20"
                                >
                                  {isGeneratingAI ? <ActivityIndicator size="small" color="#818cf8" /> : <Text className="text-indigo-400 text-[9px] font-bold uppercase tracking-widest">✨ AI Draft</Text>}
                                </TouchableOpacity>
                              </View>
                              <TextInput 
                                value={feedbackInput}
                                onChangeText={setFeedbackInput}
                                placeholder="Write feedback here..."
                                placeholderTextColor="#475569"
                                multiline
                                numberOfLines={3}
                                className="w-full bg-[#030612] border border-white/[0.05] rounded-xl px-4 py-3 text-white text-xs mb-4 min-h-[80px]"
                                textAlignVertical="top"
                              />

                              {/* Actions */}
                              <View className="flex-row justify-end gap-3">
                                <TouchableOpacity 
                                  onPress={() => setGradingId(null)}
                                  className="px-5 py-3 rounded-xl border border-white/10"
                                >
                                  <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                  onPress={() => handleGradeSubmit(sub._id)}
                                  disabled={submitLoading}
                                  className="px-6 py-3 rounded-xl bg-amber-500 active:bg-amber-600 flex-row items-center"
                                >
                                  {submitLoading ? <ActivityIndicator size="small" color="#010206" /> : <Text className="text-[#010206] text-[10px] font-black uppercase tracking-widest">Lock Grade</Text>}
                                </TouchableOpacity>
                              </View>

                            </View>
                          ) : (
                            <TouchableOpacity 
                              onPress={() => { setGradingId(sub._id); setGradeInput("A"); setFeedbackInput(""); }}
                              className="w-full py-4 bg-white/[0.03] border border-white/[0.08] hover:border-amber-500/50 rounded-2xl items-center justify-center flex-row gap-2 active:bg-white/10"
                            >
                              <Text className="text-amber-500 text-lg">✏️</Text>
                              <Text className="text-white text-xs font-black uppercase tracking-widest">Evaluate Task</Text>
                            </TouchableOpacity>
                          )}
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
    </KeyboardAvoidingView>
  );
}
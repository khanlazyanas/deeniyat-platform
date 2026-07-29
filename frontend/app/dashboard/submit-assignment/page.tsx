"use client";

import { useEffect, useState, useRef } from "react";

interface Course {
  _id: string;
  title: string;
}

interface Lesson {
  _id: string;
  title: string;
  courseId: string;
}

export default function SubmitAssignmentPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  
  // Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch enrolled courses on component mount
  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/my-courses`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          const myCourses = data.map((enrollment: any) => enrollment.courseId);
          setCourses(myCourses);
        }
      } catch (error) {
        console.error("Failed to load courses", error);
      }
    };
    fetchMyCourses();
  }, []);

  // Fetch lessons when a specific course is selected
  useEffect(() => {
    const fetchLessons = async () => {
      if (!selectedCourse) {
        setLessons([]);
        return;
      }
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${selectedCourse}`);
        if (response.ok) {
          const data = await response.json();
          setLessons(data.lessons || []);
        }
      } catch (error) {
        console.error("Failed to load lessons", error);
      }
    };
    fetchLessons();
  }, [selectedCourse]);

  // Start recording using Web Audio API
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied", error);
      setMessage({ type: "error", text: "Please allow microphone access to record." });
    }
  };

  // Stop the ongoing recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all audio tracks to turn off the microphone indicator
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // Discard the recorded audio
  const discardRecording = () => {
    setAudioBlob(null);
    setAudioUrl("");
  };

  // Submit the assignment using FormData (since we are sending a file)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse || !selectedLesson || !audioBlob) {
      setMessage({ type: "error", text: "Please select a lesson and record your audio." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      
      // We must use FormData to send binary files (Blob) to backend (Multer)
      const formData = new FormData();
      formData.append("lessonId", selectedLesson);
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}` // Do NOT set Content-Type, browser sets it automatically for FormData
        },
        body: formData
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Alhamdulillah! Recording submitted successfully." });
        setSelectedLesson("");
        discardRecording();
      } else {
        const data = await response.json();
        setMessage({ type: "error", text: data.message || "Failed to submit assignment." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network Error. Failed to connect." });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    }
  };

  return (
    <div className="min-h-[85vh] p-4 md:p-8 relative overflow-hidden bg-[#020617]">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 mb-4 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-300 tracking-wider uppercase">Student Portal</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">Submit Your Recitation</h2>
          <p className="text-slate-400 font-light">Record your Tajweed lesson live and send it to your Ustad.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-8 shadow-2xl">
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${message.type === 'success' ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            {/* Course Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Enrolled Course</label>
              <select 
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full bg-[#020617] border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none appearance-none"
              >
                <option value="">-- Choose Course --</option>
                {courses.map((course: any) => (
                  <option key={course?._id} value={course?._id}>{course?.title}</option>
                ))}
              </select>
            </div>

            {/* Lesson Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Lesson</label>
              <select 
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
                disabled={!selectedCourse || lessons.length === 0}
                className="w-full bg-[#020617] border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none appearance-none disabled:opacity-50"
              >
                <option value="">{lessons.length === 0 && selectedCourse ? "No lessons found in this course" : "-- Choose Lesson --"}</option>
                {lessons.map((lesson) => (
                  <option key={lesson._id} value={lesson._id}>{lesson.title}</option>
                ))}
              </select>
            </div>

            {/* Live Audio Recorder Section */}
            <div className="bg-[#020617] border border-slate-800 rounded-2xl p-6 text-center">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-6">Record Audio</label>
              
              {!audioBlob ? (
                <div>
                  {isRecording ? (
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse mb-4">
                        <div className="w-12 h-12 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.6)]"></div>
                      </div>
                      <p className="text-red-400 font-medium mb-4">Recording in progress...</p>
                      <button 
                        type="button" 
                        onClick={stopRecording}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg border border-slate-700 transition-colors"
                      >
                        Stop Recording
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      onClick={startRecording}
                      className="w-20 h-20 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto transition-all group"
                    >
                      <svg className="w-8 h-8 text-emerald-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    </button>
                  )}
                  {!isRecording && <p className="text-slate-500 mt-4 text-sm">Click the microphone to start recording</p>}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <audio src={audioUrl} controls className="w-full max-w-md mb-4 custom-audio-player" />
                  <button 
                    type="button" 
                    onClick={discardRecording}
                    className="text-red-400 hover:text-red-300 text-sm font-semibold underline underline-offset-4"
                  >
                    Discard & Record Again
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading || !selectedLesson || !audioBlob}
              className="w-full py-4 mt-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-base font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:shadow-none"
            >
              {loading ? "Uploading..." : "Submit Recording"}
              {!loading && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
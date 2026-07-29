"use client";

import { useEffect, useState } from "react";

interface Course {
  _id: string;
  title: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
}

export default function AttendancePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // DUMMY DATA HATA DIYA! Ab shuru mein array khali rahega.
  const [students, setStudents] = useState<Student[]>([]);
  
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 1. Fetch Courses on Mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`);
        if (response.ok) {
          const data = await response.json();
          setCourses(Array.isArray(data) ? data : (data.data || []));
        }
      } catch (error) {
        console.error("Failed to load courses");
      }
    };
    fetchCourses();
  }, []);

  // 2. NAYA: Fetch Real Students when a Course is Selected!
  useEffect(() => {
    const fetchEnrolledStudents = async () => {
      if (!selectedCourse) {
        setStudents([]); // Agar koi course select nahi kiya toh list khali kar do
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/course/${selectedCourse}/students`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStudents(data);
          
          // Naya course select karne par pichli attendance clear kar do
          setAttendanceData({}); 
        }
      } catch (error) {
        console.error("Failed to load students", error);
      }
    };

    fetchEnrolledStudents();
  }, [selectedCourse]); // Yeh useEffect tab chalega jab 'selectedCourse' change hoga

  // Handle individual status toggle
  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Submit all attendance records to backend
  const handleSaveAttendance = async () => {
    if (!selectedCourse) {
      setMessage({ type: "error", text: "Please select a course first." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });
    const token = localStorage.getItem("token");

    try {
      let successCount = 0;
      let failCount = 0;
      let lastErrorMessage = "";

      for (const student of students) {
        const status = attendanceData[student._id];
        if (!status) continue; 

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            courseId: selectedCourse,
            studentId: student._id,
            date: date,
            status: status
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          failCount++;
          lastErrorMessage = errorData.message || `Failed to save for ${student.name}`;
        } else {
          successCount++;
        }
      }

      if (failCount > 0) {
        if (lastErrorMessage.includes('authorize') || lastErrorMessage.toLowerCase().includes('forbidden')) {
             setMessage({ type: "error", text: "Access Denied: Only Ustad or Admin can mark attendance." });
        } else {
             setMessage({ type: "error", text: `Saved ${successCount}, but failed for ${failCount} students. Error: ${lastErrorMessage}` });
        }
      } else if (successCount > 0) {
        setMessage({ type: "success", text: "Attendance saved successfully! ✨" });
        setTimeout(() => setMessage({ type: "", text: "" }), 4000);
      } else {
        setMessage({ type: "error", text: "No attendance status selected to save." });
      }

    } catch (error) {
      console.error("Network Error:", error);
      setMessage({ type: "error", text: "Network Error: Failed to connect to server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] p-4 md:p-8 relative overflow-hidden bg-[#020617]">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 mb-4 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-300 tracking-wider uppercase">Teacher Module</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">Class Attendance</h2>
          <p className="text-slate-400 font-light">Mark your students' daily presence, absence, or late arrivals.</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 mb-8 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Course</label>
            <select 
              value={selectedCourse} 
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full bg-[#020617] border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors appearance-none"
            >
              <option value="">-- Choose a Course --</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.title}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Date</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#020617] border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/40">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              Student Roster
            </h3>
            <span className="text-sm font-medium text-slate-400 bg-slate-800 px-3 py-1 rounded-full">{students.length} Students</span>
          </div>

          <div className="divide-y divide-slate-800/50">
            {students.length === 0 ? (
              <div className="p-8 text-center text-slate-500 italic">
                {selectedCourse ? "No students enrolled in this course yet." : "Please select a course to see students."}
              </div>
            ) : (
              students.map((student) => (
                <div key={student._id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors">
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-900/30 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold uppercase">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200">{student.name}</p>
                      <p className="text-xs text-slate-500">{student.email}</p>
                    </div>
                  </div>

                  <div className="flex bg-[#020617] rounded-xl border border-slate-800 p-1">
                    <button 
                      onClick={() => handleStatusChange(student._id, 'Present')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 ${attendanceData[student._id] === 'Present' ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.2)]' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                    >
                      Present
                    </button>
                    <button 
                      onClick={() => handleStatusChange(student._id, 'Late')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 ${attendanceData[student._id] === 'Late' ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                    >
                      Late
                    </button>
                    <button 
                      onClick={() => handleStatusChange(student._id, 'Absent')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 ${attendanceData[student._id] === 'Absent' ? 'bg-red-500/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                    >
                      Absent
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>

          <div className="p-6 border-t border-slate-800/50 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full">
              {message.text && (
                <div className={`px-4 py-2 rounded-xl text-sm font-medium border ${message.type === 'success' ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
                  {message.text}
                </div>
              )}
            </div>
            <button 
              onClick={handleSaveAttendance}
              disabled={loading || !selectedCourse || students.length === 0}
              className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] disabled:opacity-50 disabled:hover:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? "Saving..." : "Save Attendance"}
              {!loading && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
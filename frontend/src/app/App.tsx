import React, { useState, useEffect } from "react";
import { Plus, GraduationCap, Loader2, Clock } from "lucide-react";
import { ClassCard } from "./components/ClassCard";
import { ClassDetail } from "./components/ClassDetail";
import { AdminDashboard } from "../components/admin/AdminDashboard";
import { StudentDashboard } from "../components/student/StudentDashboard";
import { TuitionManager } from "../components/tuition/TuitionManager";
import { CalendarView } from "../components/calendar/CalendarView";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Login } from "../components/auth/Login";
import { AppLayout } from "../components/layout/AppLayout";
import { OrchestrationOverview } from "./components/OrchestrationOverview";
import { AttendanceManager } from "../components/attendance/AttendanceManager";
import { HelpGuide } from "./components/HelpGuide";
import { ManagementDashboard } from "../components/management/ManagementDashboard";
import { Class } from "../types/database"; // Use shared type

export default function App() {
  const { user, profile, loading: authLoading } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState("dashboard"); // 'dashboard', 'courses', 'calendar', 'inbox'

  // Data State
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});

  // UI State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    schedule: "",
    level: "",
  });

  // Schedule Picker State
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  // Update string schedule when day/time changes
  useEffect(() => {
    if (showAddForm) {
      if (selectedDays.length > 0 && selectedTime) {
        setFormData(prev => ({ ...prev, schedule: `${selectedDays.join('/')} - ${selectedTime}` }));
      } else {
        // If user wipes selection, we don't necessarily want to wipe custom text if they typed it manually, 
        // but here we are ENFORCING the picker, so we update it.
        // Actually let's only update if they interact with picker.
        // For now, simple: Check if either is set.
        if (selectedDays.length > 0 || selectedTime) {
          setFormData(prev => ({ ...prev, schedule: `${selectedDays.join('/')} ${selectedTime ? '- ' + selectedTime : ''}` }));
        }
      }
    }
  }, [selectedDays, selectedTime]);

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b))
    );
  };

  useEffect(() => {
    if (user) {
      fetchClasses();
    }
  }, [user]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classes.length > 0) {
      fetchStudentCounts();
    }
  }, [classes]);

  const fetchStudentCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('class_id');

      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach(s => {
        counts[s.class_id] = (counts[s.class_id] || 0) + 1;
      });
      setStudentCounts(counts);
    } catch (error) {
      console.error("Error fetching student counts:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('classes')
        .insert([{
          user_id: user.id,
          name: formData.name,
          schedule: formData.schedule,
          level: formData.level
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setClasses([data, ...classes]);
        setShowAddForm(false);
        setFormData({ name: "", schedule: "", level: "" });
        setSelectedDays([]);
        setSelectedTime("");
      }
    } catch (error) {
      console.error("Error creating class:", error);
      alert("Error creating class. Please check console.");
    }
  };

  const handleNavigate = (view: string) => {
    // If navigating away from courses, deselect class
    if (view !== 'courses') {
      setSelectedClass(null);
    }
    setCurrentView(view);
  };

  // -- RENDER HELPERS --

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // View: Class Detail (When a class is selected)
  if (selectedClass) {
    return (
      <AppLayout currentView="courses" onNavigate={handleNavigate} title={selectedClass.name}>
        <ClassDetail
          classData={selectedClass}
          onBack={() => {
            setSelectedClass(null);
            fetchClasses(); // Refresh data
          }}
        />
      </AppLayout>
    );
  }

  // -- ROLE BASED ROUTING --

  // 1. Student View
  if (user && profile?.role === 'student') {
    return (
      <AppLayout currentView="dashboard" onNavigate={handleNavigate} title="Bảng Điều Khiển Học Viên">
        <StudentDashboard />
      </AppLayout>
    )
  }

  // 2. Admin View (Explicit choice)
  if (currentView === "admin") {
    return (
      <AppLayout currentView="admin" onNavigate={handleNavigate} title="Quản Trị Hệ Thống">
        <AdminDashboard />
      </AppLayout>
    );
  }

  // 3. Teacher View (Default for Teacher/Admin)

  if (currentView === "tuition") {
    return (
      <AppLayout currentView="tuition" onNavigate={handleNavigate} title="Quản Lý Học Phí">
        <TuitionManager />
      </AppLayout>
    );
  }

  if (currentView === "management") {
    return (
      <AppLayout currentView="management" onNavigate={handleNavigate} title="Quản Lý Hệ Thống">
        <ManagementDashboard />
      </AppLayout>
    );
  }

  if (currentView === "attendance") {
    return (
      <AppLayout currentView="attendance" onNavigate={handleNavigate} title="Điểm Danh Học Viên">
        <AttendanceManager />
      </AppLayout>
    );
  }

  if (currentView === "calendar") {
    return (
      <AppLayout currentView="calendar" onNavigate={handleNavigate} title="Lịch Dạy">
        <CalendarView onSelectClass={setSelectedClass} />
      </AppLayout>
    );
  }

  if (currentView === "help") {
    return (
      <AppLayout currentView="help" onNavigate={handleNavigate} title="Hướng Dẫn Sử Dụng">
        <HelpGuide />
      </AppLayout>
    );
  }

  // View: Dashboard / Courses List
  if (currentView === "dashboard" || currentView === "courses") {
    return (
      <AppLayout currentView={currentView} onNavigate={handleNavigate} title="Tổng Quan">
        <div className="space-y-10">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-[#1A1F36] tracking-tight">Chào mừng trở lại!</h1>
              <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Bạn đang quản lý {classes.length} lớp học đang hoạt động.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center gap-3 px-6 py-3 bg-[#008EE2] text-white rounded-xl hover:bg-[#0077c0] hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-sm font-bold text-sm uppercase tracking-wider"
            >
              <Plus className="w-5 h-5" />
              Tạo Lớp Mới
            </button>
          </header>

          <OrchestrationOverview
            classes={classes}
            onSelectClass={setSelectedClass}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classData) => (
              <ClassCard
                key={classData.id}
                classData={classData}
                studentCount={studentCounts[classData.id] || 0}
                onClick={() => setSelectedClass(classData)}
              />
            ))}

            {classes.length === 0 && !loading && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">Chưa có lớp học nào</h3>
                <p className="text-gray-500">Hãy tạo lớp học đầu tiên của bạn để bắt đầu.</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Class Modal - keeping it simple for now */}
        {showAddForm && (
          <div className="fixed inset-0 bg-[#1A1F36]/60 backdrop-blur-md flex items-center justify-center p-4 z-[70] animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-in zoom-in-95 duration-200 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-[#1A1F36] tracking-tight">Tạo Lớp Học Mới</h3>
                <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Tên Lớp học</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#008EE2] outline-none font-bold text-[#1A1F36] transition-all"
                    placeholder="VD: Tiếng Anh 12 - Nâng cao"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Lịch Học Định Kỳ</label>

                  {/* Day Picker */}
                  <div className="flex gap-2 mb-4 overflow-x-auto py-1 px-1 no-scrollbar">
                    {daysOfWeek.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`
                            min-w-[42px] h-[42px] rounded-xl flex items-center justify-center text-xs font-black transition-all border
                            ${selectedDays.includes(day)
                            ? 'bg-[#008EE2] text-white border-[#008EE2] shadow-lg shadow-blue-200 scale-105'
                            : 'bg-white text-gray-400 border-gray-100 hover:border-[#008EE2] hover:text-[#008EE2]'}
                          `}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  {/* Time Picker */}
                  <div className="relative">
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#008EE2] outline-none font-bold text-[#1A1F36]"
                    />
                    <div className="flex items-center gap-2 mt-2 ml-1 text-[10px] font-bold text-[#008EE2] bg-blue-50/50 w-fit px-2 py-1 rounded-md border border-blue-100/50">
                      <Clock className="w-3 h-3" />
                      {formData.schedule || "Chọn ngày và giờ học"}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Cấp Độ / Khối Lớp</label>
                  <input
                    type="text"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#008EE2] outline-none font-bold text-[#1A1F36] transition-all"
                    placeholder="VD: IELTS 5.0"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-4 bg-gray-50 text-gray-500 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-4 bg-[#0984E3] text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-100 active:scale-95 transition-all"
                  >
                    Tạo Lớp Ngay
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AppLayout>
    );
  }

  // Placeholder for other views
  return (
    <AppLayout currentView={currentView} onNavigate={handleNavigate} title={currentView.charAt(0).toUpperCase() + currentView.slice(1)}>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          {currentView === 'calendar' ? <div className="text-4xl">📅</div> : <div className="text-4xl">📫</div>}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tính năng đang phát triển
        </h2>
        <p className="text-gray-500 max-w-md">
          Chức năng này sẽ sớm ra mắt trong các phiên bản tiếp theo!
        </p>
      </div>
    </AppLayout>
  );
}
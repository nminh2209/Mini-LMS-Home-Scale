import { useState, useEffect } from "react";
import { Plus, GraduationCap, Loader2 } from "lucide-react";
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
import { Class } from "../types/database"; // Use shared type

export default function App() {
  const { user, profile, loading: authLoading } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState("dashboard"); // 'dashboard', 'courses', 'calendar', 'inbox'

  // Data State
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);

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
                studentCount={0} // TODO: Fetch count separately or join
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Tạo Lớp Học Mới</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên Lớp</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="VD: Tiếng Anh 12 - Nâng cao"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lịch Học</label>

                  {/* Day Picker */}
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                    {daysOfWeek.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`
                            w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border
                            ${selectedDays.includes(day)
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:bg-blue-50'}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <div className="text-xs text-gray-500 mt-1 pl-1">
                      Kết quả: {formData.schedule || "(Chọn ngày và giờ)"}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cấp Độ / Khối Lớp</label>
                  <input
                    type="text"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="VD: IELTS 5.0"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#0984E3] text-white font-medium rounded-lg hover:bg-blue-600"
                  >
                    Tạo Lớp
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
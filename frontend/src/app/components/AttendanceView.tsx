import React, { useState, useEffect } from "react";
import { Check, X, Clock, Calendar, Save, Loader2, Users } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Student {
  id: string;
  name: string;
}

interface AttendanceViewProps {
  classId: string;
}

export function AttendanceView({ classId }: AttendanceViewProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendance, setAttendance] = useState<Record<string, "present" | "absent" | "late">>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchData();
  }, [classId, selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: studentsData } = await supabase
        .from('students')
        .select('id, name')
        .eq('class_id', classId)
        .order('name');

      setStudents(studentsData || []);

      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('class_id', classId)
        .eq('date', selectedDate);

      const initialMap: Record<string, "present" | "absent" | "late"> = {};
      (studentsData || []).forEach(s => {
        initialMap[s.id] = 'present';
      });

      (attendanceData || []).forEach((record: any) => {
        initialMap[record.student_id] = record.status;
      });

      setAttendance(initialMap);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: "present" | "absent" | "late") => {
    setAttendance((prev: Record<string, "present" | "absent" | "late">) => ({ ...prev, [studentId]: status }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        class_id: classId,
        student_id: studentId,
        date: selectedDate,
        status: status
      }));

      const { error } = await supabase
        .from('attendance')
        .upsert(records, { onConflict: 'student_id,class_id,date' });

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-[#008EE2] animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Đang tải dữ liệu điểm danh...</p>
      </div>
    );
  }

  const presentCount = Object.values(attendance).filter(s => s === "present").length;
  const absentCount = Object.values(attendance).filter(s => s === "absent").length;
  const lateCount = Object.values(attendance).filter(s => s === "late").length;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-2xl text-[#008EE2]">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#1A1F36] tracking-tight">Điểm Danh Lớp</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chọn ngày và cập nhật trạng thái</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 md:flex-none px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#008EE2] outline-none font-bold text-[#1A1F36] transition-all"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className={`
              flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95
              ${saved
                ? "bg-green-500 text-white shadow-green-100"
                : "bg-[#1A1F36] text-white shadow-gray-200 hover:bg-[#2D334D]"
              }
            `}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
            {saved ? "Đã Lưu" : (saving ? "Đang Lưu..." : "Lưu Bảng Tên")}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-green-100 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-50 rounded-2xl text-green-600 group-hover:scale-110 transition-transform">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Có mặt</p>
              <p className="text-2xl font-black text-[#1A1F36]">{presentCount}</p>
            </div>
          </div>
          <div className="text-green-500 font-black text-xs bg-green-50 px-3 py-1 rounded-full border border-green-100 uppercase tracking-wider">
            {Math.round((presentCount / (students.length || 1)) * 100)}%
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-yellow-100 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-yellow-50 rounded-2xl text-yellow-600 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đi muộn</p>
              <p className="text-2xl font-black text-[#1A1F36]">{lateCount}</p>
            </div>
          </div>
          <div className="text-yellow-500 font-black text-xs bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100 uppercase tracking-wider">
            {Math.round((lateCount / (students.length || 1)) * 100)}%
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-red-100 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-red-50 rounded-2xl text-red-600 group-hover:scale-110 transition-transform">
              <X className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vắng mặt</p>
              <p className="text-2xl font-black text-[#1A1F36]">{absentCount}</p>
            </div>
          </div>
          <div className="text-red-500 font-black text-xs bg-red-50 px-3 py-1 rounded-full border border-red-100 uppercase tracking-wider">
            {Math.round((absentCount / (students.length || 1)) * 100)}%
          </div>
        </div>
      </div>

      {/* Student Attendance List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-3">
          <Users className="w-5 h-5 text-[#008EE2]" />
          <h3 className="text-lg font-black text-[#1A1F36] tracking-tight uppercase tracking-widest text-sm">Danh sách chi tiết</h3>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Không có học viên nào để điểm danh</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {students.map((student) => {
              const status = attendance[student.id];
              return (
                <div key={student.id} className="px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-black">
                      {student.name.charAt(0)}
                    </div>
                    <span className="font-black text-[#1A1F36] text-lg">{student.name}</span>
                  </div>

                  <div className="flex p-1.5 bg-gray-100 rounded-2xl w-full sm:w-auto">
                    <button
                      onClick={() => handleStatusChange(student.id, "present")}
                      className={`
                        flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
                        ${status === "present"
                          ? "bg-white text-green-600 shadow-md shadow-gray-200 border border-green-50"
                          : "text-gray-400 hover:text-gray-600"
                        }
                      `}
                    >
                      Có mặt
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, "late")}
                      className={`
                        flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
                        ${status === "late"
                          ? "bg-white text-yellow-500 shadow-md shadow-gray-200 border border-yellow-50"
                          : "text-gray-400 hover:text-gray-600"
                        }
                      `}
                    >
                      Đi muộn
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, "absent")}
                      className={`
                        flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
                        ${status === "absent"
                          ? "bg-white text-red-500 shadow-md shadow-gray-200 border border-red-50"
                          : "text-gray-400 hover:text-gray-600"
                        }
                      `}
                    >
                      Vắng mặt
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

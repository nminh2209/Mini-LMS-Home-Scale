import { useState, useEffect } from "react";
import { Check, X, Clock, Calendar, Save } from "lucide-react";
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
      // 1. Fetch Students
      const { data: studentsData } = await supabase
        .from('students')
        .select('id, name')
        .eq('class_id', classId)
        .order('name');

      setStudents(studentsData || []);

      // 2. Fetch Attendance for Date
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('class_id', classId)
        .eq('date', selectedDate);

      // Initialize map
      const initialMap: Record<string, "present" | "absent" | "late"> = {};

      // Default to 'present' for all students
      (studentsData || []).forEach(s => {
        initialMap[s.id] = 'present';
      });

      // Override with actual data
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
    setAttendance(prev => ({ ...prev, [studentId]: status }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upsert: We basically delete old records for this day and re-insert, or careful upsert.
      // Easiest valid way for bulk upsert in Supabase with composite key unique constraint:

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
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  const presentCount = Object.values(attendance).filter(s => s === "present").length;
  const absentCount = Object.values(attendance).filter(s => s === "absent").length;
  const lateCount = Object.values(attendance).filter(s => s === "late").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          Điểm danh
        </h2>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all transform active:scale-95 shadow-lg ${saved
                ? "bg-green-500 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
          >
            {saving ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-5 h-5" />}
            {saved ? "Đã lưu!" : "Lưu"}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 text-green-700 font-semibold mb-1">
            <Check className="w-5 h-5" />
            Có mặt
          </div>
          <span className="text-3xl font-bold text-green-800">{presentCount}</span>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 text-red-700 font-semibold mb-1">
            <X className="w-5 h-5" />
            Vắng
          </div>
          <span className="text-3xl font-bold text-red-800">{absentCount}</span>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 text-yellow-700 font-semibold mb-1">
            <Clock className="w-5 h-5" />
            Đi muộn
          </div>
          <span className="text-3xl font-bold text-yellow-800">{lateCount}</span>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {students.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Chưa có học viên nào trong lớp này. Vui lòng thêm học viên trước.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {students.map((student) => (
              <div
                key={student.id}
                className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="font-bold text-gray-900 text-lg">{student.name}</div>
                <div className="flex p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => handleStatusChange(student.id, "present")}
                    className={`px-4 py-2 rounded-md font-medium transition-all ${attendance[student.id] === "present"
                        ? "bg-white text-green-700 shadow-sm ring-1 ring-green-200"
                        : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    Có mặt
                  </button>
                  <button
                    onClick={() => handleStatusChange(student.id, "late")}
                    className={`px-4 py-2 rounded-md font-medium transition-all ${attendance[student.id] === "late"
                        ? "bg-white text-yellow-700 shadow-sm ring-1 ring-yellow-200"
                        : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    Muộn
                  </button>
                  <button
                    onClick={() => handleStatusChange(student.id, "absent")}
                    className={`px-4 py-2 rounded-md font-medium transition-all ${attendance[student.id] === "absent"
                        ? "bg-white text-red-700 shadow-sm ring-1 ring-red-200"
                        : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    Vắng
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

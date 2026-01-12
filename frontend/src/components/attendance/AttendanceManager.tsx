import { useState, useEffect } from "react";
import { Check, X, Clock, Calendar, Save, Loader2, Users, ChevronRight } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { format } from "date-fns";
import { Class } from "../../types/database";

interface Student {
    id: string;
    name: string;
}

export function AttendanceManager() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [attendance, setAttendance] = useState<Record<string, "present" | "absent" | "late">>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClassId) {
            fetchData();
        } else {
            setStudents([]);
            setAttendance({});
            setLoading(false);
        }
    }, [selectedClassId, selectedDate]);

    const fetchClasses = async () => {
        try {
            const { data, error } = await supabase.from('classes').select('*').order('name');
            if (error) throw error;
            setClasses(data || []);
            if (data && data.length > 0 && !selectedClassId) {
                setSelectedClassId(data[0].id);
            }
        } catch (error: any) {
            console.error("Error fetching classes:", error);
            const detail = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
            alert("Lỗi khi tải danh sách lớp: " + detail);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Students
            const { data: studentsData } = await supabase
                .from('students')
                .select('id, name')
                .eq('class_id', selectedClassId)
                .order('name');

            setStudents(studentsData || []);

            // 2. Fetch Attendance for Date
            const { data: attendanceData } = await supabase
                .from('attendance')
                .select('student_id, status')
                .eq('class_id', selectedClassId)
                .eq('date', selectedDate);

            const initialMap: Record<string, "present" | "absent" | "late"> = {};
            (studentsData || []).forEach(s => {
                initialMap[s.id] = 'present';
            });

            (attendanceData || []).forEach((record: any) => {
                initialMap[record.student_id] = record.status;
            });

            setAttendance(initialMap);
        } catch (error: any) {
            console.error("Error fetching data:", error);
            const detail = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
            alert("Lỗi khi tải dữ liệu: " + detail);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId: string, status: "present" | "absent" | "late") => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
        setSaved(false);
    };

    const handleSave = async () => {
        if (!selectedClassId) return;
        setSaving(true);
        try {
            const records = Object.entries(attendance).map(([studentId, status]) => ({
                class_id: selectedClassId,
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
        } catch (error: any) {
            console.error("Error saving attendance:", error);
            const detail = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
            alert("Lỗi khi lưu điểm danh: " + detail);
        } finally {
            setSaving(false);
        }
    };

    const presentCount = Object.values(attendance).filter(s => s === "present").length;
    const absentCount = Object.values(attendance).filter(s => s === "absent").length;
    const lateCount = Object.values(attendance).filter(s => s === "late").length;

    return (
        <div className="space-y-8">
            {/* Header / Selection */}
            <div className="canvas-card bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-extrabold text-[#1A1F36] flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Check className="w-6 h-6" />
                        </div>
                        Điểm danh Tổng quát
                    </h2>
                    <p className="text-gray-500 mt-1 font-medium">Chọn lớp và ngày để thực hiện điểm danh học viên.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lớp học</label>
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="block w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-[#1A1F36]"
                        >
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ngày tháng</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="block w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-[#1A1F36]"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving || !selectedClassId}
                        className={`mt-5 flex items-center gap-3 px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 ${saved
                            ? "bg-green-500 text-white"
                            : "bg-[#008EE2] text-white hover:bg-[#0077c0]"
                            }`}
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saved ? "Đã lưu!" : "Lưu Điểm Danh"}
                    </button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="canvas-card bg-white p-6 border-l-4 border-l-green-500 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Có mặt</p>
                        <h4 className="text-4xl font-black text-[#1A1F36]">{presentCount}</h4>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                        <Check className="w-8 h-8" />
                    </div>
                </div>
                <div className="canvas-card bg-white p-6 border-l-4 border-l-orange-400 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Đi muộn</p>
                        <h4 className="text-4xl font-black text-[#1A1F36]">{lateCount}</h4>
                    </div>
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                        <Clock className="w-8 h-8" />
                    </div>
                </div>
                <div className="canvas-card bg-white p-6 border-l-4 border-l-red-500 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Vắng mặt</p>
                        <h4 className="text-4xl font-black text-[#1A1F36]">{absentCount}</h4>
                    </div>
                    <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                        <X className="w-8 h-8" />
                    </div>
                </div>
            </div>

            {/* Student List */}
            <div className="canvas-card bg-white overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <h3 className="font-bold text-[#1A1F36] flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        Danh sách học viên ({students.length})
                    </h3>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái điểm danh</span>
                </div>
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    </div>
                ) : students.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <Users className="w-8 h-8 text-gray-200" />
                        </div>
                        <p className="font-bold text-[#1A1F36]/40 uppercase tracking-widest text-xs">Không có dữ liệu học viên</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {students.map((student) => (
                            <div
                                key={student.id}
                                className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-blue-50/20 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-black text-gray-400">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div className="font-bold text-[#1A1F36] text-lg group-hover:text-blue-600 transition-colors">{student.name}</div>
                                </div>

                                <div className="flex p-1.5 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                                    <button
                                        onClick={() => handleStatusChange(student.id, "present")}
                                        className={`px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${attendance[student.id] === "present"
                                            ? "bg-white text-green-700 shadow-md ring-1 ring-green-100"
                                            : "text-gray-400 hover:text-gray-600"
                                            }`}
                                    >
                                        Có mặt
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(student.id, "late")}
                                        className={`px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${attendance[student.id] === "late"
                                            ? "bg-white text-orange-600 shadow-md ring-1 ring-orange-100"
                                            : "text-gray-400 hover:text-gray-600"
                                            }`}
                                    >
                                        Muộn
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(student.id, "absent")}
                                        className={`px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${attendance[student.id] === "absent"
                                            ? "bg-white text-red-600 shadow-md ring-1 ring-red-100"
                                            : "text-gray-400 hover:text-gray-600"
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
            {/* Action Bar Footer */}
            {students.length > 0 && (
                <div className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-2xl">
                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /> Present: {presentCount}</span>
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-400" /> Late: {lateCount}</span>
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> Absent: {absentCount}</span>
                    </div>
                    <button onClick={handleSave} className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1 transition-all group">
                        Lưu kết quả <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}
        </div>
    );
}

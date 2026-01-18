import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Trash2,
  DollarSign,
  ArrowRight,
  X,
  Plus,
  Loader2
} from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Student {
  id: string;
  class_id: string;
  name: string;
  email?: string;
  phone?: string;
  parent_name?: string;
  date_of_birth?: string;
  notes?: string;
}

interface StudentListProps {
  classId: string;
}

export function StudentList({ classId }: StudentListProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTuitionModal, setShowTuitionModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    monthly_fee_amount: "500000",
  });

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([{
          class_id: classId,
          name: formData.name,
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setStudents([...students, data]);
        setShowAddForm(false);
        setFormData({ ...formData, name: "" });
      }
    } catch (error) {
      console.error("Error adding student:", error);
      alert("Error adding student: " + (error as any).message);
    }
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm("Xác nhận xóa học viên này? Thao tác này sẽ xóa toàn bộ điểm danh và học phí liên quan.")) return;

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;
      setStudents((prev: Student[]) => prev.filter(s => s.id !== studentId));
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Lỗi khi xóa học viên");
    }
  };

  const handleRecordTuition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const month = new Date().toISOString().slice(0, 7); // YYYY-MM
    try {
      const { error } = await supabase
        .from('tuitions')
        .insert({
          class_id: classId,
          student_id: selectedStudent.id,
          amount: parseFloat(formData.monthly_fee_amount),
          period: `Tháng ${month.split('-')[1]}/${month.split('-')[0]}`,
          status: 'paid',
          paid_at: new Date().toISOString()
        });

      if (error) throw error;

      alert(`Đã ghi nhận học phí cho ${selectedStudent.name}!`);
      setShowTuitionModal(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Error recording tuition:", error);
      alert("Lỗi khi ghi nhận học phí");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-[#008EE2] animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Đang tải danh sách...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-2xl text-[#008EE2]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng số học viên</p>
            <p className="text-2xl font-black text-[#1A1F36]">{students.length}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-[#1A1F36] tracking-tight flex items-center gap-3">
          <div className="w-2 h-8 bg-[#008EE2] rounded-full" />
          Danh sách học viên
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#1A1F36] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#2D334D] transition-all shadow-lg shadow-gray-200 active:scale-95"
        >
          <UserPlus className="w-4 h-4 text-[#008EE2]" />
          Thêm học viên
        </button>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="inline-flex p-6 bg-gray-50 rounded-full mb-4 text-gray-300">
            <Users className="w-12 h-12" />
          </div>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Chưa có học viên nào trong lớp này</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div key={student.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#008EE2] to-[#00C2FF] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-[#1A1F36] group-hover:text-[#008EE2] transition-colors">{student.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Học viên</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(student.id)}
                  className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-50">
                <button
                  onClick={() => {
                    setSelectedStudent(student);
                    setShowTuitionModal(true);
                  }}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 group-hover:bg-blue-50/50 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#008EE2]" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Thu học phí</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#008EE2]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Student Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-[#1A1F36]/60 backdrop-blur-md flex items-center justify-center p-4 z-[70] animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/20 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-[#1A1F36] tracking-tight">Thêm Học Viên Mới</h3>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Họ và Tên</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#008EE2] outline-none font-bold text-[#1A1F36] transition-all"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-4 bg-gray-50 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all border border-gray-100"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-4 bg-[#1A1F36] text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-[#2D334D] shadow-xl shadow-gray-200 active:scale-95 transition-all text-center flex items-center justify-center"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Tuition Modal */}
      {showTuitionModal && selectedStudent && (
        <div className="fixed inset-0 bg-[#1A1F36]/60 backdrop-blur-md flex items-center justify-center p-4 z-[70] animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/20 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-[#1A1F36] tracking-tight">Ghi Nhận Học Phí</h3>
              <button
                onClick={() => {
                  setShowTuitionModal(false);
                  setSelectedStudent(null);
                }}
                className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#008EE2] font-black text-xl border border-blue-100">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] font-black text-[#008EE2] uppercase tracking-widest">Đang ghi nhận cho</p>
                <p className="text-lg font-black text-[#1A1F36]">{selectedStudent.name}</p>
              </div>
            </div>

            <form onSubmit={handleRecordTuition} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Số Tiền (VNĐ)</label>
                <input
                  type="number"
                  required
                  value={formData.monthly_fee_amount}
                  onChange={(e) => setFormData({ ...formData, monthly_fee_amount: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#008EE2] outline-none font-bold text-[#1A1F36] transition-all"
                  placeholder="500,000"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTuitionModal(false);
                    setSelectedStudent(null);
                  }}
                  className="flex-1 px-4 py-4 bg-gray-50 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all border border-gray-100"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-4 bg-[#0984E3] text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-600 shadow-xl shadow-blue-100 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                >
                  Xác nhận Thu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

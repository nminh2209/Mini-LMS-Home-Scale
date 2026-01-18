import React, { useState, useEffect } from "react";
import { Plus, BookOpen, Calendar, X, Loader2, Info } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Assignment {
  id: string;
  class_id: string;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
}

interface AssignmentListProps {
  classId: string;
}

export function AssignmentList({ classId }: AssignmentListProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
  });

  useEffect(() => {
    fetchAssignments();
  }, [classId]);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('assignments')
        .insert([{
          class_id: classId,
          title: formData.title,
          description: formData.description,
          due_date: formData.due_date || null
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setAssignments([data, ...assignments]);
        setShowAddForm(false);
        setFormData({ title: "", description: "", due_date: "" });
      }
    } catch (error) {
      console.error("Error adding assignment:", error);
      alert("Failed to add assignment");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-[#008EE2] animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Đang tải danh sách bài tập...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#1A1F36] tracking-tight">Bài Tập Về Nhà</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tổng cộng {assignments.length} bài tập</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#1A1F36] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#2D334D] transition-all shadow-lg shadow-gray-200 active:scale-95"
        >
          <Plus className="w-4 h-4 text-[#008EE2]" />
          Giao Bài Mới
        </button>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-[#1A1F36]/60 backdrop-blur-md flex items-center justify-center p-4 z-[70] animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/20 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-[#1A1F36] tracking-tight">Giao Bài Tập</h3>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Tiêu Đề</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#008EE2] outline-none font-bold text-[#1A1F36] transition-all"
                  placeholder="Ví dụ: Unit 5 - Homework"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mô Tả & Yêu Cầu</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#008EE2] outline-none font-bold text-[#1A1F36] transition-all resize-none"
                  rows={4}
                  placeholder="Nêu chi tiết nội dung cần làm..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Hạn Nộp</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#008EE2] outline-none font-bold text-[#1A1F36] transition-all"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-4 bg-gray-50 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-4 bg-[#1A1F36] text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-[#2D334D] shadow-xl shadow-gray-200 active:scale-95 transition-all text-center flex items-center justify-center"
                >
                  Giao Bài
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment List */}
      {assignments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="inline-flex p-6 bg-gray-50 rounded-full mb-4 text-gray-300">
            <BookOpen className="w-12 h-12" />
          </div>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Chưa có bài tập nào cho lớp học này</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-6 bg-indigo-500 rounded-full" />
                    <h3 className="text-xl font-black text-[#1A1F36] group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                      {assignment.title}
                    </h3>
                  </div>

                  {assignment.description && (
                    <div className="bg-indigo-50/30 p-6 rounded-2xl border border-indigo-50 mb-6">
                      <div className="flex gap-3">
                        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                        <p className="text-gray-600 leading-relaxed font-medium">
                          {assignment.description}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4">
                    {assignment.due_date && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl border border-red-100">
                        <Calendar className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                          Hạn: {new Date(assignment.due_date).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 rounded-xl border border-gray-100">
                      <Clock className="w-4 h-4 text-gray-300" />
                      <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                        Giao ngày: {new Date(assignment.created_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Plus, Trash2, DollarSign, User, Phone, Mail, FileText, Calendar } from "lucide-react";
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
    phone: "",
    date_of_birth: "",
    parent_name: "",
    notes: "",
    monthly_fee_amount: "500000", // Default value
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
          phone: formData.phone,
          date_of_birth: formData.date_of_birth || null,
          parent_name: formData.parent_name,
          notes: formData.notes
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setStudents([...students, data]);
        setShowAddForm(false);
        setFormData({
          name: "",
          phone: "",
          date_of_birth: "",
          parent_name: "",
          notes: "",
          monthly_fee_amount: "500000",
        });
      }
    } catch (error) {
      console.error("Error adding student:", error);
      alert("Error adding student: " + (error as any).message);
    }
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student? This will also delete their attendance and payment records.")) return;

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;
      setStudents(students.filter(s => s.id !== studentId));
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Error deleting student");
    }
  };

  const handleRecordTuition = async () => {
    if (!selectedStudent) return;

    const month = new Date().toISOString().slice(0, 7); // YYYY-MM
    try {
      const { error } = await supabase
        .from('tuition_payments')
        .insert({
          class_id: classId,
          student_id: selectedStudent.id,
          amount: parseFloat(formData.monthly_fee_amount),
          month: month,
          status: 'paid'
        });

      if (error) throw error;

      alert(`Tuition recorded for ${selectedStudent.name} (${month})!`);
      setShowTuitionModal(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Error recording tuition:", error);
      alert("Failed to record tuition");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Danh sách học viên ({students.length})
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Thêm học viên
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Thêm học viên mới</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh date
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="090123..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên phụ huynh
                </label>
                <input
                  type="text"
                  value={formData.parent_name}
                  onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(Tùy chọn)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Ghi chú về học viên..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tuition Modal */}
      {showTuitionModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Ghi nhận học phí</h3>
            <p className="text-gray-600 mb-6">
              Xác nhận thu học phí tháng này cho <strong>{selectedStudent.name}</strong>?
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số tiền (VNĐ)
              </label>
              <input
                type="number"
                value={formData.monthly_fee_amount}
                onChange={(e) => setFormData({ ...formData, monthly_fee_amount: e.target.value })}
                className="w-full px-3 py-2 border border-blue-200 bg-blue-50 text-blue-800 font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowTuitionModal(false);
                  setSelectedStudent(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleRecordTuition}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Xác nhận đã thu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student List */}
      {students.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">Lớp này chưa có học viên nào.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 text-blue-600 font-medium hover:underline"
          >
            Thêm học viên ngay
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {students.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    {student.name}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-8 text-sm text-gray-600">
                    {student.date_of_birth && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>DOB: {new Date(student.date_of_birth).toLocaleDateString()}</span>
                      </div>
                    )}
                    {student.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{student.phone}</span>
                      </div>
                    )}
                    {student.parent_name && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>PH: {student.parent_name}</span>
                      </div>
                    )}
                    {student.notes && (
                      <div className="flex items-center gap-2 col-span-full mt-2 text-gray-500 italic bg-gray-50 p-2 rounded">
                        <FileText className="w-4 h-4" />
                        <span>{student.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowTuitionModal(true);
                      setFormData(prev => ({ ...prev, monthly_fee_amount: "500000" }));
                    }}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100"
                    title="Ghi nhận học phí"
                  >
                    <DollarSign className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(student.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    title="Xóa"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

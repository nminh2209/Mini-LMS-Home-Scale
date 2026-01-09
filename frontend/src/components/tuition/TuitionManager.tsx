import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Class, Student, Tuition } from "../../types/database";
import { Loader2, DollarSign, CheckCircle, Clock, Plus, Filter, Search } from "lucide-react";
import { format } from "date-fns";

export function TuitionManager() {
    const [tuitions, setTuitions] = useState<Tuition[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid'>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Data for creation form
    const [classes, setClasses] = useState<Class[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedClassId, setSelectedClassId] = useState("");

    // Creation Form State
    const [formData, setFormData] = useState({
        student_id: "",
        amount: 500000,
        period: `Tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
        due_date: format(new Date(), 'yyyy-MM-dd')
    });

    useEffect(() => {
        fetchTuitions();
        fetchClasses();
    }, []);

    // Fetch students when class changes
    useEffect(() => {
        if (selectedClassId) {
            fetchStudents(selectedClassId);
        }
    }, [selectedClassId]);

    const fetchTuitions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('tuitions')
                .select(`
          *,
          classes (name),
          students (full_name)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTuitions(data || []);
        } catch (error) {
            console.error("Error fetching tuitions:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        const { data } = await supabase.from('classes').select('*');
        if (data) setClasses(data);
    };

    const fetchStudents = async (classId: string) => {
        const { data } = await supabase
            .from('students')
            .select('*')
            .eq('class_id', classId);
        if (data) setStudents(data);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('tuitions').insert([{
                class_id: selectedClassId,
                student_id: formData.student_id,
                amount: formData.amount,
                period: formData.period,
                due_date: formData.due_date,
                status: 'pending'
            }]);

            if (error) throw error;
            setShowCreateModal(false);
            fetchTuitions();
        } catch (error) {
            console.error("Error creating tuition:", error);
            alert("Lỗi khi tạo phiếu thu");
        }
    };

    const markAsPaid = async (id: string) => {
        if (!confirm("Xác nhận đã thu tiền?")) return;
        try {
            const { error } = await supabase
                .from('tuitions')
                .update({ status: 'paid', paid_id: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            fetchTuitions();
        } catch (error) {
            console.error("Error updating tuition:", error);
        }
    };

    const filteredTuitions = tuitions.filter(t =>
        filterStatus === 'all' ? true : t.status === filterStatus
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <DollarSign className="w-8 h-8 text-green-600" />
                        Quản Lý Học Phí
                    </h1>
                    <p className="text-gray-500">Theo dõi thu chi và trạng thái đóng tiền của học viên.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Tạo Phiếu Thu
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {(['all', 'pending', 'paid'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-colors
               ${filterStatus === status
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
             `}
                    >
                        {status === 'all' ? 'Tất cả' : status === 'pending' ? 'Chưa đóng' : 'Đã đóng'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTuitions.map(t => (
                        <div key={t.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between group hover:border-blue-300 transition-all">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                        ${t.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}
                      `}>
                                        {t.status === 'paid' ? 'Đã đóng' : 'Chưa đóng'}
                                    </span>
                                    <span className="text-xs text-gray-400 font-mono">{format(new Date(t.created_at), 'dd/MM/yyyy')}</span>
                                </div>
                                <h3 className="font-bold text-lg text-gray-900">
                                    {(t.students as any)?.full_name || "Học viên ẩn"}
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    {(t.classes as any)?.name} • {t.period}
                                </p>
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.amount)}
                                </div>
                            </div>

                            {t.status === 'pending' && (
                                <button
                                    onClick={() => markAsPaid(t.id)}
                                    className="mt-4 w-full py-2 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Xác nhận đã thu
                                </button>
                            )}
                        </div>
                    ))}

                    {filteredTuitions.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            Không tìm thấy phiếu thu nào.
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Tạo Phiếu Thu Mới</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Lớp</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg"
                                    value={selectedClassId}
                                    onChange={(e) => setSelectedClassId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Chọn lớp học --</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            {selectedClassId && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Học Viên</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg"
                                        value={formData.student_id}
                                        onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                        required
                                    >
                                        <option value="">-- Chọn học viên --</option>
                                        {students.map(s => <option key={s.id} value={s.id}>{s.full_name || "Chưa đặt tên"}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số Tiền (VND)</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border rounded-lg"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ Thu</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg"
                                        value={formData.period}
                                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                        required
                                        placeholder="Tháng..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2 bg-gray-100 rounded-lg">Hủy</button>
                                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Tạo Phiếu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Class, Student, Tuition } from "../../types/database";
import { Loader2, DollarSign, CheckCircle, Clock, Plus, Filter, Search, Trash2, X } from "lucide-react";
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
          students (name)
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
        } catch (error: any) {
            console.error("Error creating tuition:", error);
            // Alert with more detail if it's a Supabase error
            const detail = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
            alert("Lỗi khi tạo phiếu thu: " + detail);
        }
    };

    const markAsPaid = async (id: string) => {
        if (!confirm("Xác nhận đã thu tiền?")) return;
        try {
            const { error } = await supabase
                .from('tuitions')
                .update({ status: 'paid', paid_at: new Date().toISOString() })
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
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 canvas-card bg-white p-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#1A1F36] flex items-center gap-3">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        Quản Lý Học Phí
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">Theo dõi thu chi và trạng thái đóng tiền của học viên.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-[#008EE2] text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-[#0077c0] hover:shadow-lg transition-all flex items-center gap-2 shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Tạo Phiếu Thu
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {(['all', 'pending', 'paid'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all
               ${filterStatus === status
                                ? 'bg-[#2D3B45] text-white border-[#2D3B45] shadow-md'
                                : 'bg-white text-gray-500 border-gray-100 hover:border-blue-400 hover:text-blue-600'}
             `}
                    >
                        {status === 'all' ? 'Tất cả' : status === 'pending' ? 'Chưa đóng' : 'Đã đóng'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTuitions.map(t => (
                        <div key={t.id} className="canvas-card bg-white flex flex-col justify-between group hover:border-[#008EE2] transition-all relative overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest
                        ${t.status === 'paid' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-orange-50 text-orange-700 border border-orange-100'}
                      `}>
                                        {t.status === 'paid' ? 'Đã đóng' : 'Chưa đóng'}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{format(new Date(t.created_at), 'dd MMM yyyy')}</span>
                                </div>
                                <h3 className="font-extrabold text-xl text-[#1A1F36] group-hover:text-[#008EE2] transition-colors line-clamp-1">
                                    {(t.students as any)?.name || "Học viên ẩn"}
                                </h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    {(t.classes as any)?.name} • {t.period}
                                </p>
                                <div className="text-3xl font-black text-[#1A1F36] tabular-nums tracking-tight">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.amount)}
                                </div>
                            </div>

                            <div className="p-6 pt-0 space-y-3">
                                {t.status === 'pending' && (
                                    <button
                                        onClick={() => markAsPaid(t.id)}
                                        className="w-full py-3 bg-green-50 text-green-700 font-bold text-sm rounded-xl hover:bg-green-100 transition-all flex items-center justify-center gap-2 border border-green-100"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Xác nhận đã thu
                                    </button>
                                )}

                                <div className="flex justify-end border-t border-gray-50 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={async () => {
                                            if (!confirm("Bạn có chắc muốn xóa phiếu thu này?")) return;
                                            const { error } = await supabase.from('tuitions').delete().eq('id', t.id);
                                            if (error) alert("Lỗi khi xóa!");
                                            else fetchTuitions();
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest"
                                        title="Xóa phiếu thu"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredTuitions.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <div className="bg-white w-16 h-16 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                <DollarSign className="w-8 h-8 text-gray-200" />
                            </div>
                            <p className="font-bold text-[#1A1F36]/40 uppercase tracking-widest text-xs">Không tìm thấy phiếu thu nào</p>
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-[#2D3B45]/60 backdrop-blur-md flex items-center justify-center p-4 z-[70] animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-extrabold text-[#1A1F36]">Tạo Phiếu Thu Mới</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lớp học mục tiêu</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-[#1A1F36]"
                                    value={selectedClassId}
                                    onChange={(e) => setSelectedClassId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Chọn lớp học --</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            {selectedClassId && (
                                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Học viên thụ hưởng</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-[#1A1F36]"
                                        value={formData.student_id}
                                        onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                        required
                                    >
                                        <option value="">-- Chọn học viên --</option>
                                        {students.map(s => <option key={s.id} value={s.id}>{s.name || "Chưa đặt tên"}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Số tiền (VND)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-[#1A1F36] tabular-nums"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                        required
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kỳ thu phí</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-[#1A1F36]"
                                        value={formData.period}
                                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                        required
                                        placeholder="VD: Tháng 10"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-[#008EE2] text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[#0077c0] hover:shadow-lg transition-all shadow-sm"
                                >
                                    Tạo Phiếu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

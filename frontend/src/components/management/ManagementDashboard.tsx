import React, { useState, useEffect } from "react";
import {
    BarChart3,
    TrendingUp,
    AlertCircle,
    Download,
    Users,
    DollarSign,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    Calendar,
    ChevronRight,
    Search
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface RevenueStat {
    class_id: string;
    period: string;
    total_paid: number;
    total_pending: number;
    total_overdue: number;
    total_expected: number;
    student_count: number;
}

interface AttendanceStat {
    class_id: string;
    present_count: number;
    absent_count: number;
    late_count: number;
    total_attendance_records: number;
    present_rate: number;
}

interface OverdueTuition {
    id: string;
    student_name: string;
    class_name: string;
    amount: number;
    period: string;
    due_date: string;
    status: string;
}

export function ManagementDashboard() {
    const [loading, setLoading] = useState(true);
    const [revenueData, setRevenueData] = useState<RevenueStat[]>([]);
    const [attendanceData, setAttendanceData] = useState<AttendanceStat[]>([]);
    const [overdueData, setOverdueData] = useState<OverdueTuition[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState(format(new Date(), "'Tháng' MM/yyyy"));

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch Revenue Summary
            const { data: revData, error: revError } = await supabase
                .from('revenue_summary')
                .select('*');
            if (revError) throw revError;
            setRevenueData(revData || []);

            // Fetch Attendance Performance
            const { data: attData, error: attError } = await supabase
                .from('attendance_performance')
                .select('*');
            if (attError) throw attError;
            setAttendanceData(attData || []);

            // Fetch Overdue List
            const { data: overData, error: overError } = await supabase
                .from('overdue_tuition_list')
                .select('*')
                .limit(10);
            if (overError) throw overError;
            setOverdueData(overData || []);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (overdueData.length === 0) return;

        const headers = ["Học sinh", "Lớp", "Số tiền", "Kỳ phí", "Hạn nộp"];
        const rows = overdueData.map(d => [
            d.student_name,
            d.class_name,
            d.amount.toString(),
            d.period,
            d.due_date
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `hoc_phi_qua_han_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Derived Stats
    const totalExpected = revenueData.reduce((acc, curr) => acc + curr.total_expected, 0);
    const totalPaid = revenueData.reduce((acc, curr) => acc + curr.total_paid, 0);
    const collectionRate = totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 0;
    const avgAttendance = attendanceData.length > 0
        ? attendanceData.reduce((acc, curr) => acc + curr.present_rate, 0) / attendanceData.length
        : 0;

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#008EE2]" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1A1F36] tracking-tight uppercase italic">Quản Lý Hệ Thống</h1>
                    <p className="text-gray-500 font-bold mt-1">Phân tích tài chính và hiệu suất giảng dạy</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#008EE2]" />
                        <span className="font-bold text-sm text-[#1A1F36]">{selectedPeriod}</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-3xl group-hover:bg-blue-100 transition-colors" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 text-[#008EE2] rounded-2xl group-hover:scale-110 transition-transform">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1 text-green-500 bg-green-50 px-2 py-1 rounded-lg text-[10px] font-black uppercase">
                                <ArrowUpRight className="w-3 h-3" />
                                +12%
                            </div>
                        </div>
                        <h4 className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Tổng học phí dự kiến</h4>
                        <div className="text-2xl font-black text-[#1A1F36] tracking-tight">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalExpected)}
                        </div>
                    </div>
                </div>

                {/* Collection Rate Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full blur-3xl group-hover:bg-green-100 transition-colors" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-50 text-green-500 rounded-2xl group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1 text-green-500 bg-green-50 px-2 py-1 rounded-lg text-[10px] font-black uppercase">
                                <ArrowUpRight className="w-3 h-3" />
                                Tốt
                            </div>
                        </div>
                        <h4 className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Tỷ lệ thu phí</h4>
                        <div className="text-2xl font-black text-[#1A1F36] tracking-tight">
                            {collectionRate.toFixed(1)}%
                        </div>
                        <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${collectionRate}%` }} />
                        </div>
                    </div>
                </div>

                {/* Attendance Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full blur-3xl group-hover:bg-purple-100 transition-colors" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-lg text-[10px] font-black uppercase">
                                <Clock className="w-3 h-3" />
                                Tuần này
                            </div>
                        </div>
                        <h4 className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Chuyên cần trung bình</h4>
                        <div className="text-2xl font-black text-[#1A1F36] tracking-tight">
                            {avgAttendance.toFixed(1)}%
                        </div>
                    </div>
                </div>

                {/* Overdue Items Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-50 rounded-full blur-3xl group-hover:bg-red-100 transition-colors" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-red-50 text-red-500 rounded-2xl group-hover:scale-110 transition-transform">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded-lg text-[10px] font-black uppercase">
                                <AlertCircle className="w-3 h-3" />
                                Cần xử lý
                            </div>
                        </div>
                        <h4 className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Phiếu phí quá hạn</h4>
                        <div className="text-2xl font-black text-[#1A1F36] tracking-tight">
                            {overdueData.length}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Table */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-[#1A1F36] tracking-tight uppercase italic">Doanh thu theo lớp</h3>
                            <p className="text-gray-400 text-xs font-bold">Chi tiết thu phí từng lớp học</p>
                        </div>
                        <BarChart3 className="w-6 h-6 text-[#008EE2]" />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kỳ phí</th>
                                    <th className="text-right py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Dự kiến</th>
                                    <th className="text-right py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Đã thu</th>
                                    <th className="text-right py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cần thu</th>
                                    <th className="text-right py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tỷ lệ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {revenueData.map((rev, idx) => {
                                    const rate = rev.total_expected > 0 ? (rev.total_paid / rev.total_expected) * 100 : 0;
                                    return (
                                        <tr key={`${rev.class_id}-${rev.period}`} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4">
                                                <div className="font-bold text-[#1A1F36] text-sm">{rev.period}</div>
                                                <div className="text-[10px] text-gray-400 font-bold">{rev.student_count} học viên</div>
                                            </td>
                                            <td className="py-4 text-right font-bold text-sm text-[#1A1F36]">
                                                {rev.total_expected.toLocaleString()}đ
                                            </td>
                                            <td className="py-4 text-right font-bold text-sm text-green-600">
                                                {rev.total_paid.toLocaleString()}đ
                                            </td>
                                            <td className="py-4 text-right font-bold text-sm text-red-500">
                                                {rev.total_pending.toLocaleString()}đ
                                            </td>
                                            <td className="py-4 text-right">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${rate === 100 ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                                                    }`}>
                                                    {rate.toFixed(0)}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Overdue Tuition List */}
                <div className="bg-[#1A1F36] rounded-[2.5rem] shadow-2xl p-8 text-white h-fit">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black tracking-tight uppercase italic">Phí Quá Hạn</h3>
                            <p className="text-gray-400 text-xs font-bold">Cần gửi nhắc nhở ngay</p>
                        </div>
                        <button
                            onClick={handleExportCSV}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors group"
                            title="Xuất CSV"
                        >
                            <Download className="w-5 h-5 text-[#008EE2]" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {overdueData.length === 0 ? (
                            <div className="py-12 text-center bg-white/5 rounded-3xl border border-white/10">
                                <AlertCircle className="w-8 h-8 text-white/20 mx-auto mb-2" />
                                <p className="text-white/40 font-bold text-sm">Không có phí quá hạn</p>
                            </div>
                        ) : overdueData.map((item) => (
                            <div key={item.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group flex items-center justify-between gap-3">
                                <div>
                                    <div className="font-black text-sm group-hover:text-[#008EE2] transition-colors">{item.student_name}</div>
                                    <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{item.class_name} • {item.period}</div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="font-black text-sm text-red-400">{item.amount.toLocaleString()}đ</div>
                                    <div className="text-[10px] text-white/30 font-bold">Hạn: {item.due_date}</div>
                                </div>
                            </div>
                        ))}

                        {overdueData.length > 0 && (
                            <button className="w-full py-3 bg-[#008EE2] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#007cc6] transition-all flex items-center justify-center gap-2 group">
                                Xem tất cả
                                <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Attendance Performance */}
                <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-[#1A1F36] tracking-tight uppercase italic">Hiệu suất chuyên cần</h3>
                            <p className="text-gray-400 text-xs font-bold">Tỷ lệ học sinh đi học theo lớp</p>
                        </div>
                        <Users className="w-6 h-6 text-purple-500" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {attendanceData.map((att) => (
                            <div key={att.class_id} className="p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-purple-200 transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="font-black text-[#1A1F36] group-hover:text-purple-600 transition-colors uppercase text-sm">Lớp ID: {att.class_id.slice(0, 8)}...</div>
                                    <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${att.present_rate > 90 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {att.present_rate}%
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="h-2 flex-1 bg-white rounded-full overflow-hidden flex">
                                        <div className="h-full bg-green-500" style={{ width: `${att.present_rate}%` }} />
                                        <div className="h-full bg-red-400" style={{ width: `${(att.absent_count / att.total_attendance_records) * 100}%` }} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-center">
                                        <div className="text-[10px] text-gray-400 font-black uppercase">Có mặt</div>
                                        <div className="font-black text-[#1A1F36]">{att.present_count}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] text-gray-400 font-black uppercase">Vắng</div>
                                        <div className="font-black text-red-500">{att.absent_count}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] text-gray-400 font-black uppercase">Đi muộn</div>
                                        <div className="font-black text-amber-500">{att.late_count}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

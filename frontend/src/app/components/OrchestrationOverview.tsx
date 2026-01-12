import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Class, Tuition, AttendanceRecord } from "../../types/database";
import { format, isSameDay } from "date-fns";
import { Clock, AlertCircle, CheckCircle2, Calendar, DollarSign, ArrowRight, UserCheck } from "lucide-react";

interface OrchestrationOverviewProps {
    classes: Class[];
    onSelectClass: (cls: Class) => void;
}

export function OrchestrationOverview({ classes, onSelectClass }: OrchestrationOverviewProps) {
    const [todayClasses, setTodayClasses] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        processOrchestration();
    }, [classes]);

    const processOrchestration = async () => {
        setLoading(true);
        const now = new Date();

        // 1. Determine Today's Day Code (T2, T3... CN)
        const dayIndex = now.getDay(); // 0=Sun, 1=Mon...
        const dayCode = dayIndex === 0 ? "CN" : `T${dayIndex + 1}`;
        const todayStr = format(now, 'yyyy-MM-dd');

        // 2. Identify Today's Classes
        const todayCls = classes.map(cls => {
            if (!cls.schedule) return null;
            const parts = cls.schedule.split('-').map(s => s.trim());
            if (parts.length < 2) return null;

            const dayPart = parts[0];
            const timePart = parts[1];
            const days = dayPart.split(/[\\/,]/).map(d => d.trim());

            if (days.includes(dayCode)) {
                return { ...cls, time: timePart };
            }
            return null;
        }).filter(Boolean).sort((a: any, b: any) => a.time.localeCompare(b.time));

        setTodayClasses(todayCls);

        // 3. Check for Alerts
        const newAlerts: any[] = [];

        // ALERT: Missing Attendance for today's past classes
        for (const cls of todayCls as any[]) {
            const clsTimeParts = cls.time.split(':');
            const clsDate = new Date();
            clsDate.setHours(parseInt(clsTimeParts[0]), parseInt(clsTimeParts[1] || '0'), 0);

            // If class should have started or finished (give 15 min buffer)
            if (now.getTime() > clsDate.getTime() - (15 * 60 * 1000)) {
                const { count, error } = await supabase
                    .from('attendance')
                    .select('*', { count: 'exact', head: true })
                    .eq('class_id', cls.id)
                    .eq('date', todayStr);

                if (!error && (count === null || count === 0)) {
                    newAlerts.push({
                        id: `attendance-${cls.id}`,
                        type: 'attendance',
                        title: `Chưa điểm danh: ${cls.name}`,
                        desc: `Lớp lúc ${cls.time} hôm nay chưa có dữ liệu điểm danh.`,
                        action: () => onSelectClass(cls),
                        severity: 'high'
                    });
                }
            }
        }

        // ALERT: Overdue Tuitions
        const { data: overdueTuitions } = await supabase
            .from('tuitions')
            .select('id, amount, student_id, students(name)')
            .eq('status', 'pending')
            .lte('due_date', todayStr);

        if (overdueTuitions && overdueTuitions.length > 0) {
            newAlerts.push({
                id: 'tuition-overdue',
                type: 'tuition',
                title: `${overdueTuitions.length} Học phí quá hạn`,
                desc: `Có ${overdueTuitions.length} phiếu thu đã đến hạn nhưng chưa thanh toán.`,
                action: () => { /* Link to Tuition Manager or filter */ },
                severity: 'medium'
            });
        }

        setAlerts(newAlerts);
        setLoading(false);
    };

    if (loading) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* TODAY'S AGENDA */}
            <div className="lg:col-span-2 canvas-card bg-white">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#1A1F36] flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Calendar className="w-5 h-5" />
                        </div>
                        Lịch Dạy Hôm Nay
                    </h2>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 uppercase tracking-widest">
                        {format(new Date(), 'dd MMM yyyy')}
                    </span>
                </div>
                <div className="p-4">
                    {todayClasses.length === 0 ? (
                        <div className="py-12 text-center">
                            <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
                                <Clock className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-400 font-medium">Không có lớp nào trong lịch trình hôm nay.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {todayClasses.map((cls) => (
                                <div
                                    key={cls.id}
                                    className="group p-5 flex items-center justify-between bg-white border border-transparent hover:border-blue-100 hover:bg-blue-50/30 rounded-2xl transition-all cursor-pointer"
                                    onClick={() => onSelectClass(cls)}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-white shadow-sm border border-gray-100 text-[#008EE2] rounded-2xl flex flex-col items-center justify-center font-bold transition-transform group-hover:scale-110">
                                            <span className="text-sm">{cls.time}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-[#1A1F36] group-hover:text-[#008EE2] transition-colors">{cls.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{cls.level || "Tiêu chuẩn"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 group-hover:bg-[#008EE2] group-hover:text-white transition-all text-gray-300">
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ACTION CENTER */}
            <div className="canvas-card bg-white flex flex-col">
                <div className="p-6 border-b border-gray-100 bg-white">
                    <h2 className="text-xl font-bold text-[#1A1F36] flex items-center gap-3">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        Hành động
                    </h2>
                </div>
                <div className="p-4 flex-1 space-y-3">
                    {alerts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-10">
                            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4 border border-green-100">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <p className="text-[#1A1F36] font-bold">Mọi thứ đều ổn!</p>
                            <p className="text-sm text-gray-400 mt-1 max-w-[200px]">Bạn đã hoàn thành các nhiệm vụ cần thiết.</p>
                        </div>
                    ) : (
                        alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`p-4 rounded-2xl border flex items-start gap-4 transition-all hover:shadow-md cursor-pointer ${alert.severity === 'high' ? 'bg-red-50/50 border-red-100' : 'bg-amber-50/50 border-amber-100'
                                    }`}
                                onClick={alert.action}
                            >
                                <div className={`p-2.5 rounded-xl shadow-sm ${alert.severity === 'high' ? 'bg-white text-red-600' : 'bg-white text-amber-600'}`}>
                                    {alert.type === 'attendance' ? <UserCheck className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#1A1F36] leading-tight">{alert.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{alert.desc}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {alerts.length > 0 && (
                    <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                        <p className="text-[10px] text-center font-bold text-gray-400 uppercase tracking-widest">Cập nhật lúc {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

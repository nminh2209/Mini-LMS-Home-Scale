import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Class } from "../../types/database";
import { Loader2, ChevronLeft, ChevronRight, Calculator, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";

interface CalendarViewProps {
    onSelectClass: (cls: Class) => void;
}

export function CalendarView({ onSelectClass }: CalendarViewProps) {
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const { data, error } = await supabase.from('classes').select('*');
            if (error) throw error;
            setClasses(data || []);
        } catch (error) {
            console.error("Error fetching classes:", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to parse "T2/T4 - 19:00" -> [{dayCode: 'T2', time: '19:00'}, ...]
    const parseSchedule = (cls: Class) => {
        if (!cls.schedule) return [];

        // Attempt standard format: "Days - Time" (e.g. "T2/T4 - 19:00")
        const parts = cls.schedule.split('-').map(s => s.trim());
        if (parts.length >= 2) {
            const dayPart = parts[0];
            const timePart = parts[1];

            // Split days by '/' or ','
            const days = dayPart.split(/[\\/,]/).map(d => d.trim());
            return days.map(d => ({ dayCode: d, time: timePart, name: cls.name, level: cls.level, id: cls.id }));
        }
        return [];
    };

    // Generate the 7 days of the currently selected week
    // weekStartsOn: 1 means Monday
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => {
        const date = addDays(weekStart, i); // Mon, Tue, ...
        // Map Date day index (1=Mon, 0=Sun) to our "T2"..."CN" codes
        // date-fns getDay(): 0=Sun, 1=Mon, ..., 6=Sat
        const dayIndex = date.getDay();
        // We need map: 1->T2, 2->T3... 6->T7, 0->CN
        let code = "";
        if (dayIndex === 0) code = "CN";
        else code = `T${dayIndex + 1}`;

        return { date, code };
    });

    // Build events map for THIS week
    // We match Class Schedule Day Codes (T2, T3) to the calculated dates
    const eventsByDate: Record<string, any[]> = {};

    weekDays.forEach(d => {
        const dateKey = format(d.date, 'yyyy-MM-dd');
        eventsByDate[dateKey] = [];

        classes.forEach(cls => {
            const classEvents = parseSchedule(cls);
            classEvents.forEach(ev => {
                if (ev.dayCode === d.code) {
                    eventsByDate[dateKey].push(ev);
                }
            });
        });
        // Sort by time
        eventsByDate[dateKey].sort((a, b) => a.time.localeCompare(b.time));
    });


    if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

    return (
        <div className="space-y-8">
            {/* Header / Week Navigation */}
            <div className="canvas-card bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-extrabold text-[#1A1F36] flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <CalendarIcon className="w-6 h-6" />
                        </div>
                        Lịch Dạy & Học
                    </h2>
                    <p className="text-gray-500 mt-1 font-medium">
                        Tuần từ {format(weekStart, "dd/MM")} đến {format(addDays(weekStart, 6), "dd/MM/yyyy")}
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100 self-start shadow-sm">
                    <button
                        onClick={() => setCurrentDate(prev => addDays(prev, -7))}
                        className="p-2.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600"
                        title="Tuần trước"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${isSameDay(startOfWeek(currentDate, { weekStartsOn: 1 }), startOfWeek(new Date(), { weekStartsOn: 1 }))
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-white hover:shadow-sm'
                            }`}
                    >
                        Hôm nay
                    </button>
                    <button
                        onClick={() => setCurrentDate(prev => addDays(prev, 7))}
                        className="p-2.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600"
                        title="Tuần sau"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="canvas-card bg-white border-gray-100">
                {/* Header Row */}
                <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/30">
                    {weekDays.map(({ date, code }) => {
                        const isToday = isSameDay(date, new Date());
                        return (
                            <div key={code} className={`py-6 text-center border-r last:border-0 border-gray-100 ${isToday ? 'bg-blue-50/50' : ''}`}>
                                <div className={`text-xs font-black uppercase tracking-widest mb-1 ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {code}
                                </div>
                                <div className={`text-lg font-bold ${isToday ? 'text-blue-700' : 'text-[#1A1F36]'}`}>
                                    {format(date, 'dd')}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-7 divide-x divide-gray-100 min-h-[500px]">
                    {weekDays.map(({ date, code }) => {
                        const dateKey = format(date, 'yyyy-MM-dd');
                        const events = eventsByDate[dateKey] || [];
                        const isToday = isSameDay(date, new Date());

                        return (
                            <div key={dateKey} className={`p-3 space-y-3 ${isToday ? 'bg-blue-50/20' : ''}`}>
                                {events.map((evt, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            const cls = classes.find(c => c.id === evt.id);
                                            if (cls) onSelectClass(cls);
                                        }}
                                        className="bg-white border border-gray-100 shadow-sm p-3 rounded-xl hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <Calculator className="w-3 h-3 text-blue-500" />
                                            <span className="font-black text-[11px] text-[#1A1F36]">{evt.time}</span>
                                        </div>
                                        <div className="font-bold text-[#1A1F36] text-[13px] line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                                            {evt.name}
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
                                            <span>{evt.level || "Cơ bản"}</span>
                                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                ))}
                                {events.length === 0 && (
                                    <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-10 transition-opacity">
                                        <div className="w-2 h-2 rounded-full bg-gray-200" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

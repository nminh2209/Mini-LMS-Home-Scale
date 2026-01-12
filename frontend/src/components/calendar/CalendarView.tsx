import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Class } from "../../types/database";
import { Loader2, ChevronLeft, ChevronRight, Calculator, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";

export function CalendarView() {
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
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-3xl">📅</span> Lịch Dạy
                    </h1>
                    <p className="text-gray-500">
                        Tuần: {format(weekStart, "dd/MM/yyyy")} - {format(addDays(weekStart, 6), "dd/MM/yyyy")}
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg self-start">
                    <button onClick={() => setCurrentDate(addDays(currentDate, -7))} className="p-2 hover:bg-white rounded-md transition-all shadow-sm"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-3 text-sm font-bold text-gray-700">Hôm nay</button>
                    <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="p-2 hover:bg-white rounded-md transition-all shadow-sm"><ChevronRight className="w-5 h-5" /></button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header Row */}
                <div className="grid grid-cols-7 divide-x divide-gray-200 border-b border-gray-200 bg-gray-50">
                    {weekDays.map(({ date, code }) => {
                        const isToday = isSameDay(date, new Date());
                        return (
                            <div key={code} className={`p-4 text-center ${isToday ? 'bg-blue-50' : ''}`}>
                                <div className={`font-bold ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>{code}</div>
                                <div className={`text-xs ${isToday ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                                    {format(date, 'dd/MM')}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-7 divide-x divide-gray-200 min-h-[400px]">
                    {weekDays.map(({ date, code }) => {
                        const dateKey = format(date, 'yyyy-MM-dd');
                        const events = eventsByDate[dateKey] || [];
                        const isToday = isSameDay(date, new Date());

                        return (
                            <div key={dateKey} className={`p-2 space-y-2 ${isToday ? 'bg-blue-50/30' : ''}`}>
                                {events.map((evt, idx) => (
                                    <div key={idx} className="bg-white border-l-4 border-blue-500 shadow-sm p-2 rounded hover:shadow-md transition-all cursor-pointer">
                                        <div className="font-bold text-gray-900 text-sm">{evt.time}</div>
                                        <div className="font-medium text-blue-700 text-sm line-clamp-2 leading-tight">{evt.name}</div>
                                        <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">{evt.level}</div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

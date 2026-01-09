import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Class, Assignment, Student } from "../../types/database";
import { BookOpen, Calendar, CheckCircle, Clock } from "lucide-react";

export function StudentDashboard() {
    const { user } = useAuth();
    const [enrolledClasses, setEnrolledClasses] = useState<Class[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchStudentData();
        }
    }, [user]);

    const fetchStudentData = async () => {
        try {
            setLoading(true);

            // 1. Find which 'student' record belongs to this user
            const { data: studentRecords, error: studentError } = await supabase
                .from('students')
                .select('*, classes(*)') // Join with classes
                .eq('user_id', user!.id);

            if (studentError) throw studentError;

            if (studentRecords && studentRecords.length > 0) {
                // Extract classes from the student records
                // Note: Supabase join returns an array or object depending on relationship. 
                // Here classes(*) returns the SINGLE class object because student belongs to ONE class (in current schema).
                // If schema was Many-to-Many, it would be different.

                const myClasses = studentRecords.map(s => s.classes).filter(Boolean) as unknown as Class[];
                setEnrolledClasses(myClasses);

                // 2. Fetch Assignments for these classes
                const classIds = myClasses.map(c => c.id);
                if (classIds.length > 0) {
                    const { data: assignmentData, error: assignError } = await supabase
                        .from('assignments')
                        .select('*')
                        .in('class_id', classIds)
                        .order('due_date', { ascending: true })
                        .limit(5); // Show top 5 upcoming

                    if (assignError) throw assignError;
                    setAssignments(assignmentData || []);
                }
            }

        } catch (error) {
            console.error("Lỗi khi tải dữ liệu học viên:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Xin chào! 👋</h1>
                <p className="opacity-90">Chúc bạn một ngày học tập hiệu quả.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* My Classes Section */}
                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        Lớp Học Của Tôi
                    </h2>
                    <div className="space-y-4">
                        {enrolledClasses.length === 0 ? (
                            <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200 text-center text-gray-500">
                                Bạn chưa tham gia lớp học nào.
                                <br />
                                <span className="text-sm">Hãy liên hệ giáo viên để được thêm vào lớp nhé!</span>
                            </div>
                        ) : (
                            enrolledClasses.map(cls => (
                                <div key={cls.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 transition-all cursor-pointer group">
                                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600">{cls.name}</h3>
                                    <p className="text-gray-500 text-sm mt-1">{cls.schedule || "Chưa có lịch"}</p>
                                    <span className="inline-block mt-3 text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                        {cls.level || "Cơ bản"}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Upcoming Assignments */}
                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        Bài Tập Sắp Tới
                    </h2>
                    <div className="space-y-3">
                        {assignments.length === 0 ? (
                            <div className="bg-gray-50 p-6 rounded-xl text-center text-gray-500">
                                Không có bài tập nào cần hoàn thành. 🎉
                            </div>
                        ) : (
                            assignments.map(assignment => (
                                <div key={assignment.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Hạn nộp: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString('vi-VN') : "Không có hạn"}
                                        </p>
                                    </div>
                                    {/* Status logic could go here later */}
                                    <button className="text-xs font-medium text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full transition-colors">
                                        Chi tiết
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
}

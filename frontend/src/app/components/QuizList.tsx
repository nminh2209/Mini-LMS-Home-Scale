import React, { useState, useEffect } from "react";
import { Plus, ClipboardList, Trash2, Edit, Play, BarChart3, X, Loader2, Clock } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Quiz } from "../../types/database";
import { useAuth } from "../../contexts/AuthContext";
import { QuizEditor } from "./QuizEditor";
import { QuizAttemptView } from "./QuizAttemptView";
import { QuizResultsView } from "./QuizResultsView";

interface QuizListProps {
    classId: string;
}

export function QuizList({ classId }: QuizListProps) {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
    const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
    const [resultsQuizId, setResultsQuizId] = useState<string | null>(null);
    const [lastScore, setLastScore] = useState<number | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newQuizData, setNewQuizData] = useState({
        title: "",
        description: "",
        time_limit_minutes: 15,
    });
    const { profile } = useAuth();
    const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin';

    useEffect(() => {
        fetchQuizzes();
    }, [classId]);

    const fetchQuizzes = async () => {
        try {
            const { data, error } = await supabase
                .from('quizzes')
                .select('*')
                .eq('class_id', classId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setQuizzes(data || []);
        } catch (error) {
            console.error("Error fetching quizzes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuiz = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase
                .from('quizzes')
                .insert([{
                    class_id: classId,
                    title: newQuizData.title,
                    description: newQuizData.description,
                    time_limit_minutes: newQuizData.time_limit_minutes,
                    is_published: false
                }])
                .select()
                .single();

            if (error) throw error;
            setQuizzes([data, ...quizzes]);
            setShowCreateModal(false);
            setNewQuizData({ title: "", description: "", time_limit_minutes: 15 });
            setEditingQuizId(data.id);
        } catch (error) {
            console.error("Error creating quiz:", error);
            alert("Lỗi khi tạo bài kiểm tra");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa bài kiểm tra này?")) return;
        try {
            const { error } = await supabase.from('quizzes').delete().eq('id', id);
            if (error) throw error;
            setQuizzes(quizzes.filter(q => q.id !== id));
        } catch (error) {
            console.error("Error deleting quiz:", error);
            alert("Lỗi khi xóa bài kiểm tra");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-[#008EE2] animate-spin mb-4" />
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Đang tải danh sách bài kiểm tra...</p>
            </div>
        );
    }

    if (editingQuizId) {
        return <QuizEditor quizId={editingQuizId} onBack={() => { setEditingQuizId(null); fetchQuizzes(); }} />;
    }

    if (resultsQuizId) {
        return <QuizResultsView quizId={resultsQuizId} onBack={() => { setResultsQuizId(null); fetchQuizzes(); }} />;
    }

    if (activeQuizId) {
        return (
            <QuizAttemptView
                quizId={activeQuizId}
                onCancel={() => setActiveQuizId(null)}
                onComplete={(score) => {
                    setLastScore(score);
                    setActiveQuizId(null);
                }}
            />
        );
    }

    if (lastScore !== null) {
        return (
            <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
                <div className="text-8xl mb-6">🏆</div>
                <h2 className="text-4xl font-black text-[#1A1F36] mb-3 tracking-tight">Tuyệt Vời!</h2>
                <p className="text-xl text-gray-500 mb-10 font-medium">Bạn đã hoàn thành với số điểm: <span className="text-[#008EE2] font-black">{lastScore}</span></p>
                <button
                    onClick={() => setLastScore(null)}
                    className="px-10 py-4 bg-[#1A1F36] text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-[#2D334D] transition-all shadow-2xl shadow-gray-300 active:scale-95"
                >
                    Tiếp Tục
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
                        <ClipboardList className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-[#1A1F36] tracking-tight">Hệ Thống Kiểm Tra</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{quizzes.length} Bài kiểm tra có sẵn</p>
                    </div>
                </div>
                {isTeacher && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#1A1F36] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#2D334D] transition-all shadow-lg shadow-gray-200 active:scale-95"
                    >
                        <Plus className="w-4 h-4 text-[#008EE2]" />
                        Tạo Đề Mới
                    </button>
                )}
            </div>

            {quizzes.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="inline-flex p-6 bg-gray-50 rounded-full mb-4 text-gray-300">
                        <ClipboardList className="w-12 h-12" />
                    </div>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Chưa có bài kiểm tra nào được tạo cho lớp này</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {quizzes.map((quiz) => (
                        <div
                            key={quiz.id}
                            className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-rose-100 transition-all group flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${quiz.is_published ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                        {quiz.is_published ? "Đã phát hành" : "Bản nháp"}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest">
                                        <Clock className="w-3 h-3" />
                                        {quiz.time_limit_minutes} Phút
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-[#1A1F36] mb-2 group-hover:text-rose-600 transition-colors tracking-tight uppercase">
                                    {quiz.title}
                                </h3>
                                <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8">
                                    {quiz.description || "Nội dung kiểm tra định kỳ cho học viên."}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                <div className="flex gap-2">
                                    {isTeacher ? (
                                        <>
                                            <button
                                                onClick={() => setResultsQuizId(quiz.id)}
                                                className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all border border-indigo-100"
                                                title="Xem kết quả"
                                            >
                                                <BarChart3 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setEditingQuizId(quiz.id)}
                                                className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
                                                title="Chỉnh sửa câu hỏi"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                        </>
                                    ) : quiz.is_published && (
                                        <button
                                            onClick={() => setActiveQuizId(quiz.id)}
                                            className="flex items-center gap-2 px-6 py-3 bg-[#008EE2] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-100"
                                        >
                                            <Play className="w-4 h-4" />
                                            Bắt đầu thi
                                        </button>
                                    )}
                                </div>

                                {isTeacher && (
                                    <button
                                        onClick={() => handleDelete(quiz.id)}
                                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all border border-red-100"
                                        title="Xóa đề"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-[#1A1F36]/60 backdrop-blur-md flex items-center justify-center p-4 z-[70] animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/20 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-[#1A1F36] tracking-tight">Tạo Đề Mới</h3>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-300">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateQuiz} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Tên Bài Kiểm Tra</label>
                                <input
                                    type="text"
                                    required
                                    value={newQuizData.title}
                                    onChange={(e) => setNewQuizData({ ...newQuizData, title: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#008EE2] outline-none font-bold text-[#1A1F36] transition-all"
                                    placeholder="Ví dụ: Final Test Grade 5"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mô Tả Ngắn</label>
                                <textarea
                                    value={newQuizData.description}
                                    onChange={(e) => setNewQuizData({ ...newQuizData, description: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#008EE2] outline-none font-bold text-[#1A1F36] transition-all"
                                    rows={2}
                                    placeholder="Nội dung chính..."
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Thời Gian Làm Bài (Phút)</label>
                                <input
                                    type="number"
                                    required
                                    value={newQuizData.time_limit_minutes}
                                    onChange={(e) => setNewQuizData({ ...newQuizData, time_limit_minutes: Number(e.target.value) })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#008EE2] outline-none font-bold text-[#1A1F36] transition-all"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-4 bg-gray-50 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all border border-gray-100"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-4 bg-[#1A1F36] text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-[#2D334D] shadow-xl shadow-gray-200 active:scale-95 transition-all text-center flex items-center justify-center"
                                >
                                    Tiếp Tục
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

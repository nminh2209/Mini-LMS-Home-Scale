import { useState, useEffect } from "react";
import { Plus, ClipboardList, Trash2, Edit, Play, BarChart3 } from "lucide-react";
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
            setEditingQuizId(data.id); // Auto-open editor
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
        return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    }

    if (editingQuizId) {
        return < QuizEditor quizId={editingQuizId} onBack={() => { setEditingQuizId(null); fetchQuizzes(); }} />;
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
            <div className="text-center py-20 animate-in fade-in zoom-in duration-300">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Chúc mừng bạn!</h2>
                <p className="text-xl text-gray-600 mb-8">Bạn đã hoàn thành bài thi với số điểm: <span className="font-bold text-blue-600">{lastScore}</span></p>
                <button
                    onClick={() => setLastScore(null)}
                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg"
                >
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                    Bài kiểm tra ({quizzes.length})
                </h2>
                {isTeacher && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Tạo bài mới
                    </button>
                )}
            </div>

            {quizzes.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
                        <ClipboardList className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">Lớp này chưa có bài kiểm tra nào.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {quizzes.map((quiz) => (
                        <div
                            key={quiz.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{quiz.title}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{quiz.description || "Nội dung kiểm tra"}</p>
                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                        <span className="bg-gray-100 px-2 py-1 rounded">
                                            {quiz.time_limit_minutes || "Không giới hạn"} phút
                                        </span>
                                        <span className={quiz.is_published ? "text-green-600" : "text-amber-600"}>
                                            {quiz.is_published ? "● Đã xuất bản" : "○ Bản nháp"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {!isTeacher && quiz.is_published && (
                                        <button
                                            onClick={() => setActiveQuizId(quiz.id)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                            title="Làm bài"
                                        >
                                            <Play className="w-5 h-5" />
                                        </button>
                                    )}
                                    {isTeacher && (
                                        <>
                                            <button
                                                onClick={() => setResultsQuizId(quiz.id)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                title="Xem kết quả"
                                            >
                                                <BarChart3 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setEditingQuizId(quiz.id)}
                                                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(quiz.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                title="Xóa"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Tạo bài kiểm tra mới</h2>
                        <form onSubmit={handleCreateQuiz} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={newQuizData.title}
                                    onChange={(e) => setNewQuizData({ ...newQuizData, title: e.target.value })}
                                    placeholder="Ví dụ: Kiểm tra giữa kỳ"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                <textarea
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={newQuizData.description}
                                    onChange={(e) => setNewQuizData({ ...newQuizData, description: e.target.value })}
                                    placeholder="Nội dung tóm tắt..."
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian (phút)</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={newQuizData.time_limit_minutes}
                                    onChange={(e) => setNewQuizData({ ...newQuizData, time_limit_minutes: Number(e.target.value) })}
                                    min={1}
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Tạo bài
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

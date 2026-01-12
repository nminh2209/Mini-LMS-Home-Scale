import { useState, useEffect } from "react";
import { ArrowLeft, User, BarChart, Clock } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Quiz } from "../../types/database";

interface QuizResultsViewProps {
    quizId: string;
    onBack: () => void;
}

export function QuizResultsView({ quizId, onBack }: QuizResultsViewProps) {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResults();
    }, [quizId]);

    const fetchResults = async () => {
        try {
            const { data: qData } = await supabase.from('quizzes').select('*').eq('id', quizId).single();
            setQuiz(qData);

            const { data: aData, error } = await supabase
                .from('quiz_attempts')
                .select(`
          id,
          score,
          completed_at,
          students (
            name,
            phone
          )
        `)
                .eq('quiz_id', quizId)
                .order('completed_at', { ascending: false });

            if (error) throw error;
            setAttempts(aData || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20">Đang tải kết quả...</div>;
    if (!quiz) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Kết quả: {quiz.title}</h2>
                    <p className="text-sm text-gray-500">Danh sách học viên đã hoàn thành</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                            <th className="px-6 py-4 font-bold">Học viên</th>
                            <th className="px-6 py-4 font-bold">Điểm số</th>
                            <th className="px-6 py-4 font-bold">Thời gian nộp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {attempts.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-10 text-center text-gray-500 italic">Chưa có ai làm bài này.</td>
                            </tr>
                        ) : (
                            attempts.map((a) => (
                                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                                                {a.students?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{a.students?.name}</p>
                                                <p className="text-xs text-gray-500">{a.students?.phone || "Không có SĐT"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                                            {a.score} điểm
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(a.completed_at).toLocaleString('vi-VN')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

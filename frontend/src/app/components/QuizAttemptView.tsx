import { useState, useEffect } from "react";
import { ArrowLeft, Send, Timer, HelpCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Quiz, QuizQuestion } from "../../types/database";
import { useAuth } from "../../contexts/AuthContext";

interface QuizAttemptViewProps {
    quizId: string;
    onComplete: (score: number) => void;
    onCancel: () => void;
}

export function QuizAttemptView({ quizId, onComplete, onCancel }: QuizAttemptViewProps) {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const { profile } = useAuth();

    useEffect(() => {
        fetchQuiz();
    }, [quizId]);

    useEffect(() => {
        if (timeLeft === null) return;
        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }
        const timer = setInterval(() => setTimeLeft(t => (t ? t - 1 : 0)), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const fetchQuiz = async () => {
        try {
            const { data: qData, error: qError } = await supabase.from('quizzes').select('*').eq('id', quizId).single();
            if (qError) throw qError;
            setQuiz(qData);
            if (qData.time_limit_minutes) setTimeLeft(qData.time_limit_minutes * 60);

            const { data: qsData, error: qsError } = await supabase.from('quiz_questions').select('*').eq('quiz_id', quizId).order('order_index');
            if (qsError) throw qsError;
            setQuestions(qsData || []);
        } catch (error) {
            alert("Lỗi tải bài thi");
            onCancel();
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);

        let score = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correct_answer) {
                score += q.points || 1;
            }
        });

        try {
            // Find the specific student entry for this user
            const { data: student } = await supabase
                .from('students')
                .select('id')
                .eq('user_id', profile?.id)
                .eq('class_id', quiz?.class_id)
                .single();

            if (!student) throw new Error("Không tìm thấy thông tin học viên");

            const { error } = await supabase.from('quiz_attempts').insert({
                quiz_id: quizId,
                student_id: student.id,
                score: score,
                answers: answers,
                completed_at: new Date().toISOString()
            });

            if (error) throw error;
            onComplete(score);
        } catch (error) {
            console.error(error);
            alert("Lỗi khi nộp bài");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-20">Đang chuẩn bị đề thi...</div>;
    if (!quiz) return null;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 p-4 border-b flex items-center justify-between rounded-b-2xl shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="font-bold text-gray-900">{quiz.title}</h1>
                </div>
                {timeLeft !== null && (
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full font-mono font-bold ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-600'}`}>
                        <Timer className="w-4 h-4" />
                        {formatTime(timeLeft)}
                    </div>
                )}
            </div>

            <div className="px-4 space-y-8">
                {questions.map((q, idx) => (
                    <div key={q.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
                            <HelpCircle className="w-4 h-4" />
                            Câu {idx + 1}
                        </div>
                        <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">{q.question_text}</p>

                        <div className="grid gap-3">
                            {q.options?.map((opt, optIdx) => (
                                <button
                                    key={optIdx}
                                    onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${answers[q.id] === opt
                                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                                            : 'border-gray-100 hover:border-gray-300 text-gray-600'
                                        }`}
                                >
                                    <span className="inline-block w-8 font-bold opacity-50">{String.fromCharCode(65 + optIdx)}.</span>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <button
                    onClick={() => confirm("Bạn muốn nộp bài ngay?") && handleSubmit()}
                    disabled={submitting}
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <Send className="w-5 h-5" />
                    {submitting ? "Đang nộp bài..." : "Nộp bài kiểm tra"}
                </button>
            </div>
        </div>
    );
}

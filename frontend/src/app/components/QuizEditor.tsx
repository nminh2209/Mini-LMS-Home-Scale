import { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Quiz, QuizQuestion } from "../../types/database";

interface QuizEditorProps {
    quizId: string;
    onBack: () => void;
}

export function QuizEditor({ quizId, onBack }: QuizEditorProps) {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchQuizData();
    }, [quizId]);

    const fetchQuizData = async () => {
        try {
            const { data: quizData, error: quizError } = await supabase
                .from('quizzes')
                .select('*')
                .eq('id', quizId)
                .single();

            if (quizError) throw quizError;
            setQuiz(quizData);

            const { data: questionsData, error: questionsError } = await supabase
                .from('quiz_questions')
                .select('*')
                .eq('quiz_id', quizId)
                .order('order_index');

            if (questionsError) throw questionsError;
            setQuestions(questionsData || []);
        } catch (error) {
            console.error("Error fetching quiz data:", error);
        } finally {
            setLoading(false);
        }
    };

    const addQuestion = async () => {
        const newQuestion: Partial<QuizQuestion> = {
            quiz_id: quizId,
            question_text: "Câu hỏi mới",
            question_type: "multiple_choice",
            options: ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
            correct_answer: "Lựa chọn A",
            points: 1,
            order_index: questions.length
        };

        try {
            const { data, error } = await supabase
                .from('quiz_questions')
                .insert([newQuestion])
                .select()
                .single();

            if (error) throw error;
            setQuestions([...questions, data]);
        } catch (error) {
            alert("Lỗi khi thêm câu hỏi");
        }
    };

    const updateQuestion = async (id: string, updates: Partial<QuizQuestion>) => {
        try {
            const { error } = await supabase
                .from('quiz_questions')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
        } catch (error) {
            console.error("Error updating question:", error);
        }
    };

    const deleteQuestion = async (id: string) => {
        if (!confirm("Xóa câu hỏi này?")) return;
        try {
            const { error } = await supabase.from('quiz_questions').delete().eq('id', id);
            if (error) throw error;
            setQuestions(questions.filter(q => q.id !== id));
        } catch (error) {
            alert("Lỗi khi xóa");
        }
    };

    const togglePublish = async () => {
        if (!quiz) return;
        try {
            const { error } = await supabase
                .from('quizzes')
                .update({ is_published: !quiz.is_published })
                .eq('id', quiz.id);

            if (error) throw error;
            setQuiz({ ...quiz, is_published: !quiz.is_published });
        } catch (error) {
            alert("Lỗi khi thay đổi trạng thái");
        }
    };

    if (loading) return <div className="text-center py-10">Đang tải...</div>;
    if (!quiz) return <div className="text-center py-10 text-red-500">Không tìm thấy bài kiểm tra</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{quiz.title}</h2>
                        <p className="text-sm text-gray-500">Biên tập nội dung</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={togglePublish}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${quiz.is_published ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-600 text-white hover:bg-green-700'}`}
                    >
                        {quiz.is_published ? "Gỡ xuất bản" : "Xuất bản"}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {questions.map((q, idx) => (
                    <div key={q.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 relative group">
                        <div className="flex justify-between items-start">
                            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                                Câu {idx + 1}
                            </span>
                            <button
                                onClick={() => deleteQuestion(q.id)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <textarea
                            className="w-full text-lg font-medium border-none focus:ring-0 p-0 resize-none"
                            value={q.question_text}
                            onChange={(e) => updateQuestion(q.id, { question_text: e.target.value })}
                            placeholder="Nhập câu hỏi tại đây..."
                        />

                        <div className="grid gap-2">
                            {q.options?.map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-3 group/opt">
                                    <button
                                        onClick={() => updateQuestion(q.id, { correct_answer: opt })}
                                        className="flex-shrink-0"
                                    >
                                        {q.correct_answer === opt ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-gray-300" />}
                                    </button>
                                    <input
                                        type="text"
                                        className={`flex-1 px-3 py-2 rounded-lg border transition-all ${q.correct_answer === opt ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                                        value={opt}
                                        onChange={(e) => {
                                            const newOpts = [...(q.options || [])];
                                            newOpts[optIdx] = e.target.value;
                                            updateQuestion(q.id, { options: newOpts });
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <button
                    onClick={addQuestion}
                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Thêm câu hỏi trắc nghiệm</span>
                </button>
            </div>
        </div>
    );
}

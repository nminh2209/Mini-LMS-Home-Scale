import React, { useState, useEffect } from "react";
import { Plus, BookMarked, Trash2, X, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface VocabWord {
  word: string;
  definition: string;
  example: string;
}

interface VocabList {
  id: string;
  class_id: string;
  week: string;
  words: VocabWord[];
  created_at: string;
}

interface VocabularyListProps {
  classId: string;
}

export function VocabularyList({ classId }: VocabularyListProps) {
  const [vocabLists, setVocabLists] = useState<VocabList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [week, setWeek] = useState("");
  const [words, setWords] = useState<VocabWord[]>([
    { word: "", definition: "", example: "" },
  ]);

  useEffect(() => {
    fetchVocabulary();
  }, [classId]);

  const fetchVocabulary = async () => {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVocabLists(data || []);
    } catch (error) {
      console.error("Error fetching vocabulary:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = () => {
    setWords([...words, { word: "", definition: "", example: "" }]);
  };

  const handleRemoveWord = (index: number) => {
    setWords(words.filter((_, i) => i !== index));
  };

  const handleWordChange = (index: number, field: keyof VocabWord, value: string) => {
    const updated = [...words];
    updated[index][field] = value;
    setWords(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validWords = words.filter(w => w.word.trim() !== "");

    if (validWords.length === 0) {
      alert("Vui lòng thêm ít nhất một từ vựng!");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .insert([{
          class_id: classId,
          week: week,
          words: validWords
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setVocabLists([data, ...vocabLists]);
        setShowAddForm(false);
        setWeek("");
        setWords([{ word: "", definition: "", example: "" }]);
      }
    } catch (error) {
      console.error("Error adding vocabulary:", error);
      alert("Lỗi khi lưu bộ từ vựng");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-[#008EE2] animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Đang tải danh sách từ vựng...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#1A1F36] tracking-tight">Từ Vựng Mỗi Tuần</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{vocabLists.length} bộ từ vựng đã lưu</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#1A1F36] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#2D334D] transition-all shadow-lg shadow-gray-200 active:scale-95"
        >
          <Plus className="w-4 h-4 text-[#008EE2]" />
          Thêm Bộ Từ
        </button>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-[#1A1F36]/60 backdrop-blur-md flex items-center justify-center p-4 z-[70] animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full border border-white/20 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-[#1A1F36] tracking-tight">Thêm Bộ Từ Vựng Mới</h3>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 flex-1 overflow-auto pr-2 no-scrollbar">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Tên bộ từ (Tuần học)</label>
                <input
                  type="text"
                  required
                  value={week}
                  onChange={(e) => setWeek(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#008EE2] outline-none font-bold text-[#1A1F36] transition-all"
                  placeholder="Ví dụ: Week 1 - Animals"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Danh sách từ</label>
                  <button
                    type="button"
                    onClick={handleAddWord}
                    className="flex items-center gap-1 text-[10px] font-black text-[#008EE2] uppercase tracking-widest hover:underline"
                  >
                    <Plus className="w-3 h-3" /> Thêm từ mới
                  </button>
                </div>

                {words.map((word, index) => (
                  <div key={index} className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 relative group animate-in slide-in-from-right-4 duration-300">
                    {words.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveWord(index)}
                        className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        required
                        value={word.word}
                        onChange={(e) => handleWordChange(index, "word", e.target.value)}
                        className="px-5 py-3 bg-white border border-transparent rounded-xl focus:border-[#008EE2] outline-none font-black text-[#1A1F36] shadow-sm transition-all"
                        placeholder="Từ tiếng Anh"
                      />
                      <input
                        type="text"
                        required
                        value={word.definition}
                        onChange={(e) => handleWordChange(index, "definition", e.target.value)}
                        className="px-5 py-3 bg-white border border-transparent rounded-xl focus:border-[#008EE2] outline-none font-bold text-gray-600 shadow-sm transition-all"
                        placeholder="Nghĩa tiếng Việt"
                      />
                    </div>
                    <textarea
                      value={word.example}
                      onChange={(e) => handleWordChange(index, "example", e.target.value)}
                      className="w-full px-5 py-3 bg-white border border-transparent rounded-xl focus:border-[#008EE2] outline-none text-sm italic text-gray-400 shadow-sm transition-all resize-none"
                      rows={2}
                      placeholder="Câu ví dụ..."
                    />
                  </div>
                ))}
              </div>
            </form>

            <div className="flex gap-4 pt-8 border-t border-gray-100 mt-6 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-4 bg-gray-50 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 px-4 py-4 bg-[#1A1F36] text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-[#2D334D] shadow-xl shadow-gray-200 active:scale-95 transition-all text-center flex items-center justify-center"
              >
                Lưu Bộ Từ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vocabulary Lists */}
      {vocabLists.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="inline-flex p-6 bg-gray-50 rounded-full mb-4 text-gray-300">
            <BookMarked className="w-12 h-12" />
          </div>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Chưa có bộ từ vựng nào được tạo</p>
        </div>
      ) : (
        <div className="space-y-8">
          {vocabLists.map((list) => (
            <div
              key={list.id}
              className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group"
            >
              <div className="bg-[#1A1F36] px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl text-amber-400">
                    <BookMarked className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-lg tracking-tight uppercase tracking-wider">{list.week}</h3>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      {list.words.length} Từ vựng • Đã tạo {new Date(list.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {list.words.map((word, index) => (
                  <div
                    key={index}
                    className="relative bg-gray-50/50 rounded-2xl p-6 border border-transparent hover:border-amber-100 hover:bg-amber-50/30 transition-all"
                  >
                    <div className="text-xl font-black text-[#1A1F36] mb-1 group-hover:text-amber-600 transition-colors">
                      {word.word}
                    </div>
                    {word.definition && (
                      <div className="text-sm font-bold text-gray-500 mb-3 border-b border-gray-100 pb-2">
                        {word.definition}
                      </div>
                    )}
                    {word.example && (
                      <div className="text-xs text-gray-400 italic leading-relaxed">
                        “{word.example}”
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Plus, BookMarked, Trash2 } from "lucide-react";
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
  words: VocabWord[]; // JSONB in DB
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
          words: validWords // Supabase handles JSONB conversion automatically
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
      alert("Failed to add vocabulary");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Từ vựng ({vocabLists.length} bộ)
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Thêm bộ từ vựng
        </button>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Thêm bộ từ vựng mới</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên bộ / Tuần học *
                </label>
                <input
                  type="text"
                  required
                  value={week}
                  onChange={(e) => setWeek(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-lg"
                  placeholder="Ví dụ: Week 1: Animals"
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Danh sách từ ({words.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddWord}
                    className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Thêm từ
                  </button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {words.map((word, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase">Word {index + 1}</span>
                        {words.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveWord(index)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={word.word}
                          onChange={(e) => handleWordChange(index, "word", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                          placeholder="Word (e.g. Cat)"
                        />
                        <input
                          type="text"
                          value={word.definition}
                          onChange={(e) => handleWordChange(index, "definition", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Definition (e.g. Con mèo)"
                        />
                      </div>
                      <input
                        type="text"
                        value={word.example}
                        onChange={(e) => handleWordChange(index, "example", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm italic bg-white"
                        placeholder="Example (e.g. The cat is cute)"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setWeek("");
                    setWords([{ word: "", definition: "", example: "" }]);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Lưu bộ từ vựng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vocabulary Lists */}
      {vocabLists.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
            <BookMarked className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">Chưa có bộ từ vựng nào.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {vocabLists.map((list) => (
            <div
              key={list.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-blue-300 transition-colors"
            >
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-gray-200 text-blue-600">
                    <BookMarked className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{list.week}</h3>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                      {list.words.length} WORDS
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">
                  {new Date(list.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-2">
                {list.words.map((word, index) => (
                  <div
                    key={index}
                    className="group relative bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md hover:border-blue-100 transition-all"
                  >
                    <div className="font-bold text-blue-700 text-xl mb-1 flex items-center gap-2">
                      {word.word}
                      <span className="text-xs font-normal text-gray-300 px-2 py-0.5 border border-gray-100 rounded-full">EN</span>
                    </div>
                    {word.definition && (
                      <div className="text-gray-800 font-medium mb-2 pb-2 border-b border-gray-50">
                        {word.definition}
                      </div>
                    )}
                    {word.example && (
                      <div className="text-gray-500 text-sm italic pl-2 border-l-2 border-blue-100">
                        "{word.example}"
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

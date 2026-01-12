import { useState, useEffect } from "react";
import { ArrowLeft, Plus, UserPlus, ClipboardList, BookOpen, Award, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { AttendanceView } from "./AttendanceView";
import { StudentList } from "./StudentList";
import { AssignmentList } from "./AssignmentList";
import { VocabularyList } from "./VocabularyList";
import { QuizList } from "./QuizList";

interface ClassDetailProps {
  classData: {
    id: string;
    name: string;
    schedule: string | null;
    level: string | null;
  };
  onBack: () => void;
}

type Tab = "students" | "attendance" | "assignments" | "vocabulary" | "quizzes";

export function ClassDetail({ classData, onBack }: ClassDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>("students");

  const tabs = [
    { id: "students" as Tab, label: "Học viên", icon: UserPlus },
    { id: "attendance" as Tab, label: "Điểm danh", icon: ClipboardList },
    { id: "assignments" as Tab, label: "Bài tập", icon: BookOpen },
    { id: "vocabulary" as Tab, label: "Từ vựng", icon: Award },
    { id: "quizzes" as Tab, label: "Kiểm tra", icon: ClipboardList },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{classData.name}</h1>
            <p className="text-sm text-gray-600">{classData.schedule} • {classData.level}</p>
          </div>
        </div>

        <button
          onClick={async () => {
            const confirmed = window.confirm(`CẢNH BÁO: Xóa lớp "${classData.name}"?\nToàn bộ dữ liệu của lớp này sẽ bị xóa vĩnh viễn.`);
            if (!confirmed) return;

            const { error } = await supabase.from('classes').delete().eq('id', classData.id);
            if (error) {
              alert("Lỗi khi xóa lớp: " + error.message);
            } else {
              onBack();
            }
          }}
          className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors text-sm absolute top-4 right-6"
        >
          <Trash2 className="w-4 h-4" />
          Xóa Lớp
        </button>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "students" && (
          <StudentList classId={classData.id} />
        )}
        {activeTab === "attendance" && (
          <AttendanceView classId={classData.id} />
        )}
        {activeTab === "assignments" && (
          <AssignmentList classId={classData.id} />
        )}
        {activeTab === "vocabulary" && (
          <VocabularyList classId={classData.id} />
        )}
        {activeTab === "quizzes" && (
          <QuizList classId={classData.id} />
        )}
      </div>
    </div>
  );
}

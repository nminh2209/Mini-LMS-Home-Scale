import React, { useState, useEffect } from "react";
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
    <div className="h-full flex flex-col bg-[#F9FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6 shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <button
              onClick={onBack}
              className="p-3 hover:bg-gray-50 rounded-2xl transition-all border border-gray-100 group"
            >
              <ArrowLeft className="w-6 h-6 text-gray-400 group-hover:text-[#1A1F36]" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-[#1A1F36] tracking-tight">{classData.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-[#008EE2] bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                  {classData.schedule}
                </span>
                <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                  {classData.level}
                </span>
              </div>
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
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-bold transition-all text-xs uppercase tracking-wider border border-red-100"
          >
            <Trash2 className="w-4 h-4" />
            Xóa Lớp Học
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all
                  ${isActive
                    ? "bg-[#1A1F36] text-white shadow-lg shadow-gray-200"
                    : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#008EE2]' : 'text-gray-300'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-10">
        <div className="max-w-6xl mx-auto">
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
    </div>
  );
}

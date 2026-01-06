import { useState, useEffect } from "react";
import { ArrowLeft, Plus, UserPlus, ClipboardList, BookOpen, Award } from "lucide-react";
import { AttendanceView } from "./AttendanceView";
import { StudentList } from "./StudentList";
import { AssignmentList } from "./AssignmentList";
import { VocabularyList } from "./VocabularyList";

interface ClassDetailProps {
  classData: {
    id: string;
    name: string;
    schedule: string;
    level: string;
  };
  onBack: () => void;
  apiUrl: string;
  apiKey: string;
}

type Tab = "students" | "attendance" | "assignments" | "vocabulary";

export function ClassDetail({ classData, onBack, apiUrl, apiKey }: ClassDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>("students");

  const tabs = [
    { id: "students" as Tab, label: "Học viên", icon: UserPlus },
    { id: "attendance" as Tab, label: "Điểm danh", icon: ClipboardList },
    { id: "assignments" as Tab, label: "Bài tập", icon: BookOpen },
    { id: "vocabulary" as Tab, label: "Từ vựng", icon: Award },
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

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
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
          <StudentList classId={classData.id} apiUrl={apiUrl} apiKey={apiKey} />
        )}
        {activeTab === "attendance" && (
          <AttendanceView classId={classData.id} apiUrl={apiUrl} apiKey={apiKey} />
        )}
        {activeTab === "assignments" && (
          <AssignmentList classId={classData.id} apiUrl={apiUrl} apiKey={apiKey} />
        )}
        {activeTab === "vocabulary" && (
          <VocabularyList classId={classData.id} apiUrl={apiUrl} apiKey={apiKey} />
        )}
      </div>
    </div>
  );
}

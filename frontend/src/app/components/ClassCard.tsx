import { Users, Calendar, GraduationCap } from "lucide-react";

interface ClassCardProps {
  classData: {
    id: string;
    name: string;
    schedule: string | null;
    level: string | null;
  };
  studentCount: number;
  onClick: () => void;
}

export function ClassCard({ classData, studentCount, onClick }: ClassCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{classData.name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <GraduationCap className="w-4 h-4" />
            <span>{classData.level}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{classData.schedule}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{studentCount} học viên</span>
        </div>
      </div>
    </div>
  );
}

import { Users, Calendar, GraduationCap, BookOpen, ArrowRight } from "lucide-react";

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
      className="canvas-card group bg-white cursor-pointer hover:border-[#008EE2] transition-all hover:-translate-y-1"
    >
      <div className="h-32 bg-gradient-to-br from-[#2D3B45] to-[#1A1F36] relative p-6">
        <div className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div className="mt-auto">
          <h3 className="text-xl font-bold text-white line-clamp-1">{classData.name}</h3>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">
            {classData.level || "Tiêu chuẩn"}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="w-4 h-4 text-[#008EE2]" />
            <span className="text-xs font-bold">{classData.schedule || "Chưa có lịch"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Users className="w-4 h-4 text-[#008EE2]" />
            <span className="text-xs font-bold">{studentCount} học viên</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-gray-50">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Xem chi tiết</span>
          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#008EE2] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

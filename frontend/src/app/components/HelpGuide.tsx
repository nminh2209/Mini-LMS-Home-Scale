import React from "react";
import {
    Book,
    LayoutDashboard,
    Calendar,
    UserCheck,
    DollarSign,
    BookOpen,
    ListChecks,
    HelpCircle,
    MessageCircle,
    ArrowRight,
    Info
} from "lucide-react";

export function HelpGuide() {
    const sections = [
        {
            id: "overview",
            title: "1. Tổng Quan Hệ Thống",
            icon: <LayoutDashboard className="w-6 h-6 text-[#008EE2]" />,
            content: [
                "Giao diện chính (Dashboard) được thiết kế theo phong cách 'Canvas' hiện đại, giúp bạn quản lý mọi thứ tập trung.",
                "Lịch Dạy Hôm Nay: Tự động hiển thị các lớp học có lịch trong ngày.",
                "Trung Tâm Hành Động: Cảnh báo các lớp chưa điểm danh hoặc học phí quá hạn.",
                "Danh Sách Lớp Học: Quản lý tất cả các lớp bạn đang phụ trách."
            ]
        },
        {
            id: "calendar",
            title: "2. Quản Lý Lịch Dạy",
            icon: <Calendar className="w-6 h-6 text-purple-500" />,
            content: [
                "Tính năng Lịch Dạy giúp bạn theo dõi lộ trình giảng dạy theo tuần.",
                "Sử dụng nút 'Tuần trước' / 'Tuần sau' để xem lịch trình.",
                "Các lớp học được hiển thị trực quan dưới dạng thẻ màu sắc.",
                "Nhấn vào lớp học trên lịch để truy cập nhanh vào chi tiết lớp đó."
            ]
        },
        {
            id: "attendance",
            title: "3. Điểm Danh (Attendance)",
            icon: <UserCheck className="w-6 h-6 text-green-500" />,
            content: [
                "Điểm danh Tổng quát: Nhấn vào tab 'Điểm danh' ở thanh bên trái để xem và điền điểm danh cho bất kỳ lớp nào.",
                "Điểm danh theo lớp: Vào chi tiết một lớp học cụ thể -> Chọn tab 'Điểm danh'.",
                "Trạng thái: 'Có mặt', 'Muộn', 'Vắng'."
            ]
        },
        {
            id: "tuition",
            title: "4. Quản Lý Học Phí (Tuition)",
            icon: <DollarSign className="w-6 h-6 text-amber-500" />,
            content: [
                "Hệ thống giúp bạn theo dõi tình trạng đóng phí của từng học sinh.",
                "Tạo Phiếu Thu: Nhấn 'Tạo Phiếu Thu' để ghi nhận một khoản phí cần thu.",
                "Trạng thái: 'Chờ thanh toán' (Vàng) và 'Đã thanh toán' (Xanh).",
                "Lời nhắc: Hệ thống sẽ tự động nhắc nhở nếu phiếu thu quá hạn."
            ]
        },
        {
            id: "assignments",
            title: "5. Bài Tập & Từ Vựng",
            icon: <BookOpen className="w-6 h-6 text-rose-500" />,
            content: [
                "Trong mỗi lớp học, bạn có thể giao bài tập: Đặt tiêu đề, mô tả và hạn nộp.",
                "Danh sách từ vựng: Lưu trữ các từ mới của buổi học để học sinh tra cứu.",
                "Tính năng này giúp học sinh ôn tập kiến thức cũ hiệu quả hơn."
            ]
        },
        {
            id: "workflow",
            title: "6. Quy Trình Làm Việc Hằng Ngày",
            icon: <ListChecks className="w-6 h-6 text-indigo-500" />,
            content: [
                "Bước 1: Mở Dashboard xem lịch và các lớp hôm nay.",
                "Bước 2: Trong buổi dạy, mở tab 'Điểm danh' để ghi nhận sự hiện diện.",
                "Bước 3: Kết thúc buổi dạy, cập nhật danh sách 'Từ vựng' và giao 'Bài tập'.",
                "Bước 4: Kiểm tra tab 'Học phí' định kỳ để nhắc nhở phụ huynh."
            ]
        }
    ];

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-[#1A1F36] to-[#2D334D] rounded-[2.5rem] p-12 text-white mb-10 shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-blue-300 text-[10px] font-black uppercase tracking-widest mb-6 border border-white/10">
                        <HelpCircle className="w-3 h-3" />
                        Trợ giúp & Hướng dẫn
                    </div>
                    <h1 className="text-5xl font-black mb-4 tracking-tight leading-tight">
                        Làm chủ hệ thống <br />
                        <span className="text-[#008EE2]">Mini-LMS</span> của bạn
                    </h1>
                    <p className="text-gray-400 text-lg font-medium max-w-xl leading-relaxed">
                        Chào mừng bạn đến với hệ thống quản lý lớp học tinh gọn. Hãy cùng khám phá
                        các tính năng mạnh mẽ được thiết kế riêng cho giáo viên.
                    </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#008EE2]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {sections.map((section, idx) => (
                    <div
                        key={section.id}
                        className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-4 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                {section.icon}
                            </div>
                            <h3 className="text-xl font-black text-[#1A1F36] tracking-tight group-hover:text-[#008EE2] transition-colors uppercase italic italic-none">
                                {section.title}
                            </h3>
                        </div>

                        <ul className="space-y-4">
                            {section.content.map((text, i) => (
                                <li key={i} className="flex gap-3 text-gray-500 font-medium leading-relaxed">
                                    <div className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-100 flex-shrink-0 group-hover:bg-[#008EE2] transition-colors" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                {/* Support Card */}
                <div className="md:col-span-2 bg-[#F8FAFC] border-2 border-dashed border-gray-200 rounded-[2rem] p-10 flex flex-col items-center text-center">
                    <div className="p-5 bg-white rounded-full shadow-lg mb-6">
                        <MessageCircle className="w-10 h-10 text-[#008EE2]" />
                    </div>
                    <h3 className="text-2xl font-black text-[#1A1F36] mb-3 tracking-tight">Cần hỗ trợ thêm?</h3>
                    <p className="text-gray-500 font-medium mb-8 max-w-lg">
                        Nếu bạn gặp bất kỳ sự cố kỹ thuật nào trong quá trình sử dụng,
                        đừng ngần ngại liên hệ với đội ngũ phát triển.
                    </p>
                    <button className="flex items-center gap-3 px-10 py-4 bg-[#1A1F36] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-gray-200 hover:bg-[#2D334D] transition-all hover:gap-5">
                        Gửi yêu cầu hỗ trợ
                        <ArrowRight className="w-4 h-4 text-[#008EE2]" />
                    </button>
                </div>
            </div>
        </div>
    );
}

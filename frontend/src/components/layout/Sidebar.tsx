import { useState } from 'react';
import {
    LayoutDashboard,
    BookOpen,
    Calendar,
    Inbox,
    LogOut,
    Menu,
    X,
    GraduationCap,
    DollarSign,
    UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
    currentView: string;
    onNavigate: (view: string) => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
}

export function Sidebar({ currentView, onNavigate, isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) {
    const { signOut, user, profile } = useAuth(); // Get profile

    const navItems = [
        { id: 'dashboard', label: 'Bảng tin', icon: LayoutDashboard },
        { id: 'courses', label: 'Lớp học', icon: BookOpen },
        { id: 'attendance', label: 'Điểm danh', icon: UserCheck },
        { id: 'tuition', label: 'Học phí', icon: DollarSign },
        { id: 'calendar', label: 'Lịch biểu', icon: Calendar },
        { id: 'inbox', label: 'Hộp thư', icon: Inbox },
    ];

    // Add Admin Tab if user is admin
    if (profile?.role === 'admin') {
        navItems.push({ id: 'admin', label: 'Quản trị', icon: GraduationCap }); // Re-using GradCap or Shield if imported
    }

    const handleNavClick = (viewId: string) => {
        onNavigate(viewId);
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 z-50 h-screen bg-[#2D3B45] text-white transition-all duration-300 ease-in-out flex flex-col border-r border-white/10
                ${isMobileMenuOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-24 lg:hover:w-64'}
                group
            `}>
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-white/10">
                    <div className="min-w-[40px] flex justify-center">
                        <GraduationCap className="w-10 h-10 text-[#008EE2]" />
                    </div>
                    <span className="ml-4 font-bold text-xl lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                        Mini LMS
                    </span>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 py-8 space-y-1 px-3">
                    {navItems.map((item) => {
                        const isActive = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={`
                                    w-full flex items-center px-4 py-4 rounded-xl transition-all relative group/item
                                    ${isActive
                                        ? 'bg-white text-[#2D3B45] shadow-lg scale-[1.02]'
                                        : 'text-gray-300 hover:bg-white/10 hover:text-white'}
                                `}
                                title={item.label}
                            >
                                <div className="min-w-[40px] flex justify-center">
                                    <item.icon className={`w-6 h-6 flex-shrink-0 transition-transform ${isActive ? 'scale-110' : ''}`} />
                                </div>
                                <span className={`
                                    ml-4 font-semibold whitespace-nowrap transition-all duration-300
                                    lg:opacity-0 lg:group-hover:opacity-100
                                    ${isMobileMenuOpen ? 'opacity-100' : ''}
                                `}>
                                    {item.label}
                                </span>

                                {/* Active Indicator Bar (Canvas style) */}
                                {isActive && !isMobileMenuOpen && (
                                    <div className="absolute -left-3 top-2 bottom-2 w-1.5 bg-[#008EE2] rounded-r-full lg:hidden group-hover:block" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* User / Logout */}
                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={signOut}
                        className="w-full flex items-center px-4 py-4 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-xl transition-all group/logout"
                        title="Sign Out"
                    >
                        <div className="min-w-[40px] flex justify-center">
                            <LogOut className="w-5 h-5 group-hover/logout:translate-x-1 transition-transform" />
                        </div>
                        <span className={`
                            ml-4 font-medium transition-all duration-300
                            lg:opacity-0 lg:group-hover:opacity-100
                            ${isMobileMenuOpen ? 'opacity-100' : ''}
                        `}>
                            Đăng xuất
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
}

// Hamburger Button for Mobile
export function MobileHeader({ isOpen, setIsOpen, title }: { isOpen: boolean, setIsOpen: (v: boolean) => void, title: string }) {
    return (
        <div className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 sticky top-0 z-30 shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
                {isOpen ? <X /> : <Menu />}
            </button>
            <h1 className="ml-4 text-lg font-bold text-gray-800">{title}</h1>
        </div>
    );
}

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
    DollarSign
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
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
        fixed top-0 left-0 z-50 h-screen bg-[#2D3436] text-white transition-all duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20 lg:hover:w-64'}
      `}>
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-center border-b border-gray-700">
                    <GraduationCap className="w-8 h-8 text-blue-400" />
                    <span className="ml-3 font-bold text-lg lg:hidden lg:group-hover:block transition-all duration-300 whitespace-nowrap overflow-hidden group-hover:block">
                        Mini LMS
                    </span>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 py-6 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`
                w-full flex items-center px-4 py-3 transition-colors relative group
                ${currentView === item.id ? 'bg-[#0984E3] text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}
              `}
                            title={item.label}
                        >
                            <item.icon className={`w-6 h-6 flex-shrink-0 ${currentView === item.id ? 'text-white' : ''}`} />
                            <span className={`
                ml-4 font-medium whitespace-nowrap transition-opacity duration-300
                lg:opacity-0 lg:group-hover:opacity-100 lg:absolute lg:left-14
                ${isMobileMenuOpen ? 'opacity-100' : ''}
              `}>
                                {item.label}
                            </span>

                            {/* Active Indicator Bar (Canvas style) */}
                            {currentView === item.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
                            )}
                        </button>
                    ))}
                </nav>

                {/* User / Logout */}
                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={signOut}
                        className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-white hover:bg-red-900/50 rounded-lg transition-colors group"
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className={`
               ml-3 lg:hidden lg:group-hover:inline-block whitespace-nowrap
               ${isMobileMenuOpen ? 'inline-block' : 'hidden'}
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

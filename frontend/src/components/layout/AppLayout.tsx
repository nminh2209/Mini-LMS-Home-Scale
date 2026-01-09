import { useState } from 'react';
import { Sidebar, MobileHeader } from './Sidebar';

interface AppLayoutProps {
    children: React.ReactNode;
    currentView: string;
    onNavigate: (view: string) => void;
    title?: string;
}

export function AppLayout({ children, currentView, onNavigate, title = "Dashboard" }: AppLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar (Fixed width on desktop, overlay on mobile) */}
            <Sidebar
                currentView={currentView}
                onNavigate={onNavigate}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-20 transition-all duration-300">
                <MobileHeader
                    isOpen={isMobileMenuOpen}
                    setIsOpen={setIsMobileMenuOpen}
                    title={title}
                />

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

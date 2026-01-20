import { useState, type ReactNode } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row-reverse" dir="rtl">
            {/* Mobile Header */}
            <header className="bg-slate-900 text-white p-4 flex justify-between items-center md:hidden sticky top-0 z-30">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-xl font-bold text-blue-500">لوحة التحكم</h1>
            </header>

            {/* Sidebar - Fixed Right / Mobile Drawer */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content - Left of Sidebar */}
            <main className="flex-1 transition-all duration-300 min-h-screen md:mr-64">
                <div className="container mx-auto p-4 md:p-8 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;

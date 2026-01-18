import { type ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-row-reverse" dir="rtl">
            {/* Sidebar - Fixed Right */}
            <Sidebar />

            {/* Main Content - Left of Sidebar */}
            <main className="flex-1 mr-64 transition-all duration-300 min-h-screen">
                <div className="container mx-auto p-4 md:p-8 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;

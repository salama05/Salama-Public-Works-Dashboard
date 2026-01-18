import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, Truck, ShoppingCart, Users, Hammer, Clock, Receipt, LogOut } from 'lucide-react';
import { cn } from '../../utils';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const navItems = [
        { name: 'الرئيسية', path: '/', icon: LayoutDashboard },
        { name: 'رأس المال والتمويل', path: '/capital', icon: Wallet },
        { name: 'المشتريات', path: '/purchases', icon: ShoppingCart },
        { name: 'الموردين', path: '/suppliers', icon: Truck },
        { name: 'العمال', path: '/workers', icon: Users },
        { name: 'أشغال بالحصة', path: '/piecework', icon: Hammer },
        { name: 'أشغال بالأجرة', path: '/daily-wages', icon: Clock },
        { name: 'المصاريف', path: '/expenses', icon: Receipt },
    ];

    const { logout } = useAuth();

    return (
        <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 right-0 z-50 overflow-y-auto print:hidden shadow-xl">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-2xl font-bold text-blue-500">لوحة التحكم</h1>
                <p className="text-xs text-slate-400 mt-1">مقاولة أشغال البناء</p>
            </div>

            <nav className="flex-1 py-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors duration-200",
                                isActive
                                    ? "bg-blue-600 text-white border-r-4 border-white"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )
                        }
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>تسجيل الخروج</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;

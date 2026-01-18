import { useQuery } from '@tanstack/react-query';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    Wallet, TrendingDown, ShoppingCart, Users, Briefcase,
    AlertCircle, CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
    const { data: summary, isLoading } = useQuery({
        queryKey: ['dashboardSummary'],
        queryFn: async () => {
            const { data } = await api.get('/dashboard/summary');
            return data;
        },
    });

    if (isLoading) return <div className="p-8 text-center text-slate-500">جار تحميل لوحة التحكم...</div>;

    // Data for Charts
    const financialData = [
        { name: 'رأس المال', amount: summary?.capital.total || 0 },
        { name: 'المصاريف', amount: summary?.expenses || 0 },
        { name: 'المشتريات', amount: summary?.purchases.total || 0 },
        { name: 'العمالة', amount: summary?.labor.total || 0 },
    ];

    const debtsData = [
        { name: 'ديون الموردين', value: summary?.purchases.remaining || 0 },
        { name: 'مستحقات العمال', value: summary?.labor.remaining || 0 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">لوحة التحكم</h1>
                <div className="text-sm text-slate-500">
                    آخر تحديث: {format(new Date(), 'yyyy/MM/dd HH:mm')}
                </div>
            </div>

            {/* Top Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">الرصيد الحالي</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${summary?.currentBalance >= 0 ? 'text-blue-900' : 'text-red-600'}`}>
                            {summary?.currentBalance.toLocaleString()} د.ج
                        </div>
                        <p className="text-xs text-slate-500 mt-1">المتاح في الخزينة</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">إجمالي المصروفات</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">
                            {summary?.expenses.toLocaleString()} د.ج
                        </div>
                        <p className="text-xs text-slate-500 mt-1">مصاريف عامة</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">المشتريات</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            {summary?.purchases.total.toLocaleString()} د.ج
                        </div>
                        <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            باقي: {summary?.purchases.remaining.toLocaleString()} د.ج
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">تكاليف العمالة</CardTitle>
                        <Users className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            {summary?.labor.total.toLocaleString()} د.ج
                        </div>
                        <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            باقي: {summary?.labor.remaining.toLocaleString()} د.ج
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>نظرة عامة مالية</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={financialData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                                    <Tooltip formatter={(value) => `${Number(value).toLocaleString()} د.ج`} />
                                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>توزيع الديون</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={debtsData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {debtsData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${Number(value).toLocaleString()} د.ج`} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 text-center text-sm text-slate-500">
                            إجمالي الديون: {(summary?.purchases.remaining + summary?.labor.remaining).toLocaleString()} د.ج
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">عدد الموردين</p>
                            <h3 className="text-2xl font-bold text-slate-900">{summary?.counts.suppliers}</h3>
                        </div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="p-2 bg-purple-100 rounded-full">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">عدد العمال</p>
                            <h3 className="text-2xl font-bold text-slate-900">{summary?.counts.workers}</h3>
                        </div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="p-2 bg-emerald-100 rounded-full">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">حالة النظام</p>
                            <h3 className="text-lg font-bold text-emerald-700">يعمل بنجاح</h3>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;

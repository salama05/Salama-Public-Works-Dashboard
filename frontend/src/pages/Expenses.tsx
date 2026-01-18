import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Plus, Trash2, FileSpreadsheet } from 'lucide-react';

import api from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import SearchInput from '../components/ui/SearchInput';
import { exportToExcel } from '../utils/exportToExcel';

const Expenses = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { register, handleSubmit, reset } = useForm();

    const { data: expenses, isLoading } = useQuery({
        queryKey: ['expenses'],
        queryFn: async () => {
            const { data } = await api.get('/expenses');
            return data;
        },
    });

    const filteredExpenses = useMemo(() => {
        if (!expenses) return [];
        return expenses.filter((expense: any) =>
            expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            expense.notes?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [expenses, searchQuery]);

    const handleExport = () => {
        const dataToExport = filteredExpenses.map((e: any) => ({
            'التاريخ': format(new Date(e.date), 'yyyy/MM/dd'),
            'الوصف': e.description,
            'المبلغ': e.amount,
            'ملاحظات': e.notes
        }));
        exportToExcel(dataToExport, 'المصاريف');
    };

    const createMutation = useMutation({
        mutationFn: async (data: any) => await api.post('/expenses', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            setIsModalOpen(false);
            reset();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => await api.delete(`/expenses/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
    });

    const onSubmit = (data: any) => {
        createMutation.mutate(data);
    };

    if (isLoading) return <div>جار التحميل...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-800">المصاريف</h1>
                <div className="flex w-full md:w-auto gap-2">
                    <SearchInput
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث في المصاريف..."
                        className="w-full md:w-64"
                    />
                    <Button variant="outline" onClick={handleExport} className="gap-2 shrink-0">
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        تصدير
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)} className="gap-2 shrink-0">
                        <Plus className="w-4 h-4" />
                        إضافة مصروف
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>التاريخ</TableHead>
                                <TableHead>الوصف</TableHead>
                                <TableHead>المبلغ</TableHead>
                                <TableHead>ملاحظات</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredExpenses?.map((expense: any) => (
                                <TableRow key={expense._id}>
                                    <TableCell>{format(new Date(expense.date), 'yyyy/MM/dd')}</TableCell>
                                    <TableCell className="font-medium text-slate-900">{expense.description}</TableCell>
                                    <TableCell className="font-bold text-red-600">{expense.amount} د.ج</TableCell>
                                    <TableCell>{expense.notes || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(expense._id)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredExpenses?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        {searchQuery ? 'لا توجد نتائج' : 'لا توجد مصاريف مسجلة'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تسجيل مصروف جديد">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">التاريخ</label>
                        <Input type="date" {...register('date', { required: true })} defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>

                    <Input label="الوصف" {...register('description', { required: true })} placeholder="مثال: فاتورة كهرباء، نقل..." />
                    <Input label="المبلغ" type="number" step="any" {...register('amount', { required: true })} placeholder="0.00" />
                    <Input label="ملاحظات" {...register('notes')} />

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
                        <Button type="submit">حفظ</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Expenses;

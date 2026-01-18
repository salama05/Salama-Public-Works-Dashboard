import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Plus, Trash2, User, FileSpreadsheet } from 'lucide-react';

import api from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import SearchInput from '../components/ui/SearchInput';
import { exportToExcel } from '../utils/exportToExcel';

const Purchases = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { register, handleSubmit, reset, watch } = useForm();

    // Watch quantity and price to calculate total
    const quantity = watch('quantity');
    const unitPrice = watch('unitPrice');
    const paidAmount = watch('paidAmount');

    const totalPrice = (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0);
    const remainingAmount = totalPrice - (parseFloat(paidAmount) || 0);

    // Fetch Purchases
    const { data: purchases, isLoading: isPurchasesLoading } = useQuery({
        queryKey: ['purchases'],
        queryFn: async () => {
            const { data } = await api.get('/purchases');
            return data;
        },
    });

    // Filter Purchases
    const filteredPurchases = useMemo(() => {
        if (!purchases) return [];
        return purchases.filter((p: any) =>
            (p.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.supplier?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [purchases, searchQuery]);

    const handleExport = () => {
        const dataToExport = filteredPurchases.map((p: any) => ({
            'التاريخ': format(new Date(p.date), 'yyyy/MM/dd'),
            'المنتج': p.productName,
            'الكمية': p.quantity,
            'سعر الوحدة': p.unitPrice,
            'الإجمالي': p.totalPrice,
            'المورد': p.supplier?.name || 'مورد محذوف',
            'المدفوع': p.paidAmount,
            'الباقي': p.remainingAmount
        }));
        exportToExcel(dataToExport, 'سجل_المشتريات');
    };

    // Fetch Suppliers for Dropdown
    const { data: suppliers } = useQuery({
        queryKey: ['suppliers'],
        queryFn: async () => {
            const { data } = await api.get('/suppliers');
            return data;
        },
    });

    // Create Purchase Mutation
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.post('/purchases', {
                ...data,
                totalPrice,
                remainingAmount
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            setIsModalOpen(false);
            reset();
        },
    });

    // Delete Purchase Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/purchases/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
        },
    });

    const onSubmit = (data: any) => {
        createMutation.mutate(data);
    };

    if (isPurchasesLoading) return <div>جار التحميل...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-800">المشتريات</h1>
                <div className="flex w-full md:w-auto gap-2">
                    <SearchInput
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث في المشتريات..."
                        className="w-full md:w-64"
                    />
                    <Button variant="outline" onClick={handleExport} className="gap-2 shrink-0">
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        تصدير
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)} className="gap-2 shrink-0">
                        <Plus className="w-4 h-4" />
                        تسجيل مشتريات
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>التاريخ</TableHead>
                                <TableHead>المنتج</TableHead>
                                <TableHead>الكمية</TableHead>
                                <TableHead>سعر الوحدة</TableHead>
                                <TableHead>الإجمالي</TableHead>
                                <TableHead>المورد</TableHead>
                                <TableHead>المدفوع</TableHead>
                                <TableHead>الباقي</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPurchases?.map((purchase: any) => (
                                <TableRow key={purchase._id}>
                                    <TableCell>{format(new Date(purchase.date), 'yyyy/MM/dd')}</TableCell>
                                    <TableCell className="font-medium text-slate-900">{purchase.productName}</TableCell>
                                    <TableCell>{purchase.quantity}</TableCell>
                                    <TableCell>{purchase.unitPrice} د.ج</TableCell>
                                    <TableCell className="font-bold">{purchase.totalPrice} د.ج</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <User className="w-3 h-3 text-slate-400" />
                                            {purchase.supplier?.name || 'مورد محذوف'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-emerald-600">{purchase.paidAmount} د.ج</TableCell>
                                    <TableCell className="text-red-500 font-medium">{purchase.remainingAmount} د.ج</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(purchase._id)}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredPurchases?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">{searchQuery ? 'لا توجد نتائج مطابقة' : 'لا توجد مشتريات مسجلة'}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تسجيل مشتريات جديدة">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">التاريخ</label>
                        <Input type="date" {...register('date', { required: true })} defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>

                    <Input label="اسم المنتج" {...register('productName', { required: true })} placeholder="مثال: إسمنت، حديد..." />

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="العدد/الكمية" type="number" step="any" {...register('quantity', { required: true })} placeholder="0" />
                        <Input label="سعر الوحدة" type="number" step="any" {...register('unitPrice', { required: true })} placeholder="0.00" />
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center text-sm font-bold border border-slate-200">
                        <span>السعر الإجمالي:</span>
                        <span className="text-blue-600 text-lg">{totalPrice.toFixed(2)} د.ج</span>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">المورد</label>
                        <select {...register('supplier', { required: true })} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">اختر مورد...</option>
                            {suppliers?.map((s: any) => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <Input label="المبلغ المدفوع" type="number" step="any" {...register('paidAmount', { required: true })} placeholder="0.00" />

                    <div className="p-3 bg-red-50 text-red-700 rounded-lg flex justify-between items-center text-sm font-bold border border-red-100">
                        <span>المبلغ المتبقي:</span>
                        <span>{remainingAmount.toFixed(2)} د.ج</span>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
                        <Button type="submit">حفظ</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Purchases;

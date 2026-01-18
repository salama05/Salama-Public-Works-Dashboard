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

const Piecework = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { register, handleSubmit, reset, watch } = useForm();

    const quantity = watch('quantity');
    const unitPrice = watch('unitPrice');
    const selectedWorkerId = watch('worker');

    const totalPrice = (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0);

    // Fetch Workers for dropdown
    const { data: workers } = useQuery({
        queryKey: ['workers'],
        queryFn: async () => {
            const { data } = await api.get('/workers');
            return data;
        },
    });

    // Watch worker selection to display profession automatically (optional visual cue)
    const selectedWorker = workers?.find((w: any) => w._id === selectedWorkerId);

    // Fetch Piecework List
    const { data: pieceworks, isLoading } = useQuery({
        queryKey: ['piecework'],
        queryFn: async () => {
            const { data } = await api.get('/piecework');
            return data;
        },
    });

    const filteredPieceworks = useMemo(() => {
        if (!pieceworks) return [];
        return pieceworks.filter((work: any) =>
            (work.worker?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (work.notes || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [pieceworks, searchQuery]);

    const handleExport = () => {
        const dataToExport = filteredPieceworks.map((w: any) => ({
            'التاريخ': format(new Date(w.date), 'yyyy/MM/dd'),
            'العامل': w.worker?.name,
            'المهنة': w.worker?.profession,
            'الكمية': w.quantity,
            'سعر الوحدة': w.unitPrice,
            'الإجمالي': w.totalPrice,
            'المدفوع': w.paidAmount,
            'الباقي': w.remainingAmount,
            'ملاحظات': w.notes
        }));
        exportToExcel(dataToExport, 'أشغال_بالحصة');
    };

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.post('/piecework', {
                ...data,
                totalPrice,
                paidAmount: 0,
                remainingAmount: totalPrice
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['piecework'] });
            setIsModalOpen(false);
            reset();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => await api.delete(`/piecework/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['piecework'] });
        },
    });

    const onSubmit = (data: any) => {
        createMutation.mutate(data);
    };

    if (isLoading) return <div>جار التحميل...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-800">الأشغال بالحصة</h1>
                <div className="flex w-full md:w-auto gap-2">
                    <SearchInput
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث عن عامل أو ملاحظة..."
                        className="w-full md:w-64"
                    />
                    <Button variant="outline" onClick={handleExport} className="gap-2 shrink-0">
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        تصدير
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)} className="gap-2 shrink-0">
                        <Plus className="w-4 h-4" />
                        إضافة شغل
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>التاريخ</TableHead>
                                <TableHead>العامل (المهنة)</TableHead>
                                <TableHead>الكمية</TableHead>
                                <TableHead>سعر الوحدة</TableHead>
                                <TableHead>الإجمالي</TableHead>
                                <TableHead>ملاحظات</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPieceworks?.map((work: any) => (
                                <TableRow key={work._id}>
                                    <TableCell>{format(new Date(work.date), 'yyyy/MM/dd')}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-900">{work.worker?.name}</span>
                                            <span className="text-xs text-slate-500">{work.worker?.profession}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{work.quantity}</TableCell>
                                    <TableCell>{work.unitPrice} د.ج</TableCell>
                                    <TableCell className="font-bold">{work.totalPrice} د.ج</TableCell>
                                    <TableCell className="max-w-[150px] truncate">{work.notes || '-'}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(work._id)}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredPieceworks?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        {searchQuery ? 'لا توجد نتائج' : 'لا توجد أشغال مسجلة'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تسجيل شغل بالحصة">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">التاريخ</label>
                        <Input type="date" {...register('date', { required: true })} defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">العامل</label>
                        <select {...register('worker', { required: true })} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">اختر عامل...</option>
                            {workers?.map((w: any) => (
                                <option key={w._id} value={w._id}>{w.name} ({w.profession})</option>
                            ))}
                        </select>
                        {selectedWorker && <p className="text-xs text-blue-600">المهنة: {selectedWorker.profession}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="الكمية" type="number" step="any" {...register('quantity', { required: true })} placeholder="0" />
                        <Input label="سعر الوحدة" type="number" step="any" {...register('unitPrice', { required: true })} placeholder="0.00" />
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center text-sm font-bold border border-slate-200">
                        <span>السعر الإجمالي:</span>
                        <span className="text-blue-600 text-lg">{totalPrice.toFixed(2)} د.ج</span>
                    </div>

                    <Input label="ملاحظات" {...register('notes')} placeholder="تفاصيل الشغل..." />

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
                        <Button type="submit">حفظ</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Piecework;

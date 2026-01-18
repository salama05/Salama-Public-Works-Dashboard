import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Edit, User, HardHat, FileSpreadsheet, Eye, Banknote } from 'lucide-react';

import api from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import SearchInput from '../components/ui/SearchInput';
import { exportToExcel } from '../utils/exportToExcel';
import { format } from 'date-fns';

// Unified Worker Financial Overview Component
const WorkerFinancialOverview = ({ workerId }: { workerId: string }) => {
    const { data: pieceworks, isLoading: isPieceworkLoading } = useQuery({
        queryKey: ['piecework', workerId],
        queryFn: async () => {
            const { data } = await api.get('/piecework');
            return data.filter((p: any) => p.worker?._id === workerId);
        },
        enabled: !!workerId,
    });

    const { data: dailyWages, isLoading: isDailyLoading } = useQuery({
        queryKey: ['daily-wages-summary', workerId],
        queryFn: async () => {
            const { data } = await api.get('/dailywages');
            return data.filter((w: any) => w.worker?._id === workerId);
        },
        enabled: !!workerId,
    });

    const { data: payments, isLoading: isPaymentsLoading } = useQuery({
        queryKey: ['worker-payments-summary', workerId],
        queryFn: async () => {
            const { data } = await api.get('/worker-payments');
            return data.filter((p: any) => p.worker?._id === workerId);
        },
        enabled: !!workerId,
    });

    const totalPiecework = pieceworks?.reduce((sum: number, p: any) => sum + (p.totalPrice || 0), 0) || 0;
    const totalDailyWages = dailyWages?.reduce((sum: number, w: any) => sum + (w.totalPrice || 0), 0) || 0;
    const totalEarned = totalPiecework + totalDailyWages;
    const totalPaid = payments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
    const totalRemaining = totalEarned - totalPaid;

    if (isPieceworkLoading || isDailyLoading || isPaymentsLoading)
        return <div className="text-center py-4 text-slate-500">جار التحميل...</div>;

    return (
        <div className="border-t border-gray-100 pt-4 space-y-4">
            <h4 className="font-semibold text-slate-800">الملخص المالي</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <label className="text-xs text-blue-700 font-medium block mb-1">إجمالي المستحقات</label>
                    <p className="text-xl font-bold text-blue-600">{totalEarned.toFixed(2)} د.ج</p>
                    <div className="mt-1 flex flex-col text-[10px] text-blue-400">
                        {totalPiecework > 0 && <span>• حصة: {totalPiecework.toFixed(2)}</span>}
                        {totalDailyWages > 0 && <span>• يوميات: {totalDailyWages.toFixed(2)}</span>}
                    </div>
                </div>

                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <label className="text-xs text-green-700 font-medium block mb-1">إجمالي المدفوع</label>
                    <p className="text-xl font-bold text-green-600">{totalPaid.toFixed(2)} د.ج</p>
                </div>

                <div className={`p-3 rounded-lg border ${totalRemaining > 0 ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-100'}`}>
                    <label className={`text-xs font-medium block mb-1 ${totalRemaining > 0 ? 'text-orange-700' : 'text-slate-500'}`}>المبلغ المتبقي</label>
                    <p className={`text-xl font-bold ${totalRemaining > 0 ? 'text-orange-600' : 'text-slate-600'}`}>
                        {totalRemaining.toFixed(2)} د.ج
                    </p>
                </div>
            </div>
        </div>
    );
};

// Worker Payment History Component
const WorkerPaymentHistory = ({ workerId }: { workerId: string }) => {
    const queryClient = useQueryClient();
    const [editingPayment, setEditingPayment] = useState<any>(null);
    const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, setValue } = useForm();

    const { data: payments, isLoading } = useQuery({
        queryKey: ['worker-payments', workerId],
        queryFn: async () => {
            const { data } = await api.get('/worker-payments');
            return data.filter((p: any) => p.worker?._id === workerId);
        },
        enabled: !!workerId,
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => await api.delete(`/worker-payments/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['worker-payments', workerId] });
            queryClient.invalidateQueries({ queryKey: ['worker-payments-summary', workerId] });
            alert('تم حذف الدفعة بنجاح');
        },
        onError: () => {
            alert('حدث خطأ أثناء حذف الدفعة');
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (data: any) => await api.put(`/worker-payments/${editingPayment._id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['worker-payments', workerId] });
            queryClient.invalidateQueries({ queryKey: ['worker-payments-summary', workerId] });
            setEditingPayment(null);
            resetEdit();
            alert('تم تحديث الدفعة بنجاح');
        },
        onError: () => {
            alert('حدث خطأ أثناء تحديث الدفعة');
        }
    });

    const handleEdit = (payment: any) => {
        setEditingPayment(payment);
        setValue('date', new Date(payment.date).toISOString().split('T')[0]);
        setValue('amount', payment.amount);
        setValue('notes', payment.notes || '');
    };

    const handleDelete = (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الدفعة؟')) {
            deleteMutation.mutate(id);
        }
    };

    const onEditSubmit = (data: any) => {
        updateMutation.mutate(data);
    };

    const totalPaid = payments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;

    if (isLoading) return <div className="text-center py-4 text-slate-500">جار تحميل سجل الدفعات...</div>;

    return (
        <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-slate-800">سجل الدفعات</h4>
                <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">
                    إجمالي المدفوع: {totalPaid.toFixed(2)} د.ج
                </span>
            </div>

            {payments && payments.length > 0 ? (
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 sticky top-0">
                            <tr>
                                <th className="px-3 py-2 text-right font-medium text-slate-600">التاريخ</th>
                                <th className="px-3 py-2 text-right font-medium text-slate-600">المبلغ</th>
                                <th className="px-3 py-2 text-right font-medium text-slate-600">ملاحظات</th>
                                <th className="px-3 py-2 text-right font-medium text-slate-600"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment: any) => (
                                <tr key={payment._id} className="border-t border-gray-100 hover:bg-slate-50">
                                    <td className="px-3 py-2 text-slate-700">
                                        {format(new Date(payment.date), 'yyyy/MM/dd')}
                                    </td>
                                    <td className="px-3 py-2 font-semibold text-green-600">
                                        {payment.amount} د.ج
                                    </td>
                                    <td className="px-3 py-2 text-slate-600 max-w-[150px] truncate">
                                        {payment.notes || '-'}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex gap-1 justify-end">
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(payment)} title="تعديل">
                                                <Edit className="w-3 h-3 text-blue-500" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(payment._id)} title="حذف">
                                                <Trash2 className="w-3 h-3 text-red-500" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
                    لا توجد دفعات مسجلة لهذا العامل
                </div>
            )}

            {editingPayment && (
                <Modal isOpen={!!editingPayment} onClose={() => { setEditingPayment(null); resetEdit(); }} title="تعديل الدفعة">
                    <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
                        <Input
                            label="تاريخ الدفع"
                            type="date"
                            {...registerEdit('date', { required: true })}
                        />

                        <Input
                            label="المبلغ المدفوع (د.ج)"
                            type="number"
                            step="any"
                            {...registerEdit('amount', { required: true })}
                        />

                        <Input
                            label="ملاحظات"
                            {...registerEdit('notes')}
                        />

                        <div className="flex justify-end gap-3 mt-6">
                            <Button type="button" variant="secondary" onClick={() => { setEditingPayment(null); resetEdit(); }}>إلغاء</Button>
                            <Button type="submit">حفظ التعديلات</Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

const Workers = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [editingWorker, setEditingWorker] = useState<any>(null);
    const [viewingWorker, setViewingWorker] = useState<any>(null);
    const [payingWorker, setPayingWorker] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { register, handleSubmit, reset, setValue } = useForm();
    const { register: registerPayment, handleSubmit: handleSubmitPayment, reset: resetPayment } = useForm();

    const { data: workers, isLoading } = useQuery({
        queryKey: ['workers'],
        queryFn: async () => {
            const { data } = await api.get('/workers');
            return data;
        },
    });

    const filteredWorkers = useMemo(() => {
        if (!workers) return [];
        return workers.filter((worker: any) =>
            worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            worker.profession?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [workers, searchQuery]);

    const handleExport = () => {
        const dataToExport = filteredWorkers.map((w: any) => ({
            'الاسم': w.name,
            'المهنة': w.profession,
            'العنوان': w.address,
            'الهاتف': w.phone
        }));
        exportToExcel(dataToExport, 'قائمة_العمال');
    };

    const createMutation = useMutation({
        mutationFn: async (data: any) => await api.post('/workers', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workers'] });
            closeModal();
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: any) => await api.put(`/workers/${editingWorker._id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workers'] });
            closeModal();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => await api.delete(`/workers/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workers'] });
        },
    });

    const paymentMutation = useMutation({
        mutationFn: async (data: any) => await api.post('/worker-payments', {
            ...data,
            worker: payingWorker._id
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['worker-payments', payingWorker._id] });
            queryClient.invalidateQueries({ queryKey: ['worker-payments-summary', payingWorker._id] });
            closeModal();
            alert('تم تسجيل الدفعة بنجاح');
        },
        onError: (error: any) => {
            console.error(error);
            alert(error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدفع');
        }
    });

    const onSubmit = (data: any) => {
        if (editingWorker) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const onPaymentSubmit = (data: any) => {
        paymentMutation.mutate(data);
    };

    const openEditModal = (worker: any) => {
        setEditingWorker(worker);
        setValue('name', worker.name);
        setValue('profession', worker.profession);
        setValue('phone', worker.phone);
        setValue('address', worker.address);
        setIsModalOpen(true);
    };

    const openViewModal = (worker: any) => {
        setViewingWorker(worker);
        setIsViewModalOpen(true);
    };

    const openPaymentModal = (worker: any) => {
        setPayingWorker(worker);
        setIsPaymentModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsPaymentModalOpen(false);
        setEditingWorker(null);
        setPayingWorker(null);
        reset();
        resetPayment();
    };

    if (isLoading) return <div>جار التحميل...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-800">قائمة العمال</h1>
                <div className="flex w-full md:w-auto gap-2">
                    <SearchInput
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث عن عامل..."
                        className="w-full md:w-64"
                    />
                    <Button variant="outline" onClick={handleExport} className="gap-2 shrink-0">
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        تصدير
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)} className="gap-2 shrink-0">
                        <Plus className="w-4 h-4" />
                        إضافة عامل
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الاسم واللقب</TableHead>
                                <TableHead>المهنة</TableHead>
                                <TableHead>العنوان</TableHead>
                                <TableHead>الهاتف</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredWorkers?.map((worker: any) => (
                                <TableRow key={worker._id}>
                                    <TableCell className="font-medium text-slate-900 flex items-center gap-2">
                                        <User className="w-4 h-4 text-slate-400" />
                                        {worker.name}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <HardHat className="w-4 h-4 text-slate-400" />
                                            {worker.profession}
                                        </div>
                                    </TableCell>
                                    <TableCell>{worker.address || '-'}</TableCell>
                                    <TableCell dir="ltr" className="text-right">{worker.phone || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => openPaymentModal(worker)} title="تسجيل دفعة">
                                                <Banknote className="w-4 h-4 text-green-600" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => openViewModal(worker)} title="عرض الملف">
                                                <Eye className="w-4 h-4 text-blue-500" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => openEditModal(worker)} title="تعديل">
                                                <Edit className="w-4 h-4 text-slate-500" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(worker._id)} title="حذف">
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredWorkers?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        {searchQuery ? 'لا توجد نتائج مطابقة' : 'لا يوجد عمال مسجلين'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingWorker ? "تعديل بيانات عامل" : "إضافة عامل جديد"}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input label="الاسم واللقب" {...register('name', { required: true })} placeholder="الاسم الكامل" />
                    <Input label="المهنة" {...register('profession', { required: true })} placeholder="بناء، دهان، سباك..." />
                    <Input label="رقم الهاتف" {...register('phone')} placeholder="0X XX XX XX XX" />
                    <Input label="العنوان" {...register('address')} placeholder="المدينة، الولاية" />

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="secondary" onClick={closeModal}>إلغاء</Button>
                        <Button type="submit">{editingWorker ? 'حفظ التعديلات' : 'إضافة العامل'}</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isPaymentModalOpen} onClose={closeModal} title={`دفع للمال: ${payingWorker?.name}`}>
                <form onSubmit={handleSubmitPayment(onPaymentSubmit)} className="space-y-4">
                    <div className="bg-green-50 p-3 rounded-lg border border-green-100 mb-4">
                        <p className="text-sm text-green-800">
                            تسجيل دفعة مالية للعامل <strong>{payingWorker?.name}</strong>.
                        </p>
                    </div>

                    <Input
                        label="تاريخ الدفع"
                        type="date"
                        {...registerPayment('date', { required: true })}
                        defaultValue={new Date().toISOString().split('T')[0]}
                    />

                    <Input
                        label="المبلغ المدفوع (د.ج)"
                        type="number"
                        step="any"
                        {...registerPayment('amount', { required: true })}
                        placeholder="0.00"
                    />

                    <Input
                        label="ملاحظات"
                        {...registerPayment('notes')}
                        placeholder="تفاصيل إضافية..."
                    />

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="secondary" onClick={closeModal}>إلغاء</Button>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">تأكيد الدفع</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="ملف العامل">
                {viewingWorker && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{viewingWorker.name}</h3>
                                <p className="text-slate-500">{viewingWorker.profession}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <label className="text-xs text-slate-500 font-medium block mb-1">رقم الهاتف</label>
                                <p className="font-semibold text-slate-800" dir="ltr">{viewingWorker.phone || 'غير متوفر'}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <label className="text-xs text-slate-500 font-medium block mb-1">العنوان</label>
                                <p className="font-semibold text-slate-800">{viewingWorker.address || 'غير متوفر'}</p>
                            </div>
                        </div>

                        <WorkerFinancialOverview workerId={viewingWorker._id} />

                        <WorkerPaymentHistory workerId={viewingWorker._id} />

                        <div className="flex justify-end">
                            <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>إغلاق</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Workers;

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Plus, Trash2, FileSpreadsheet } from 'lucide-react';

import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import Input from '../components/ui/Input';
import SearchInput from '../components/ui/SearchInput';
import Modal from '../components/ui/Modal';
import { exportToExcel } from '../utils/exportToExcel';

const Capital = () => {
    const queryClient = useQueryClient();
    const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);
    const [isCapitalModalOpen, setIsCapitalModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { register: registerCapital, handleSubmit: handleSubmitCapital } = useForm();
    const { register: registerFunding, handleSubmit: handleSubmitFunding, reset: resetFundingForm } = useForm();

    // Fetch Capital Summary
    const { data: summary, isLoading: isSummaryLoading } = useQuery({
        queryKey: ['capitalSummary'],
        queryFn: async () => {
            const { data } = await api.get('/capital/summary');
            return data;
        },
    });

    // Fetch Fundings
    const { data: fundings, isLoading: isFundingsLoading } = useQuery({
        queryKey: ['fundings'],
        queryFn: async () => {
            const { data } = await api.get('/funding');
            return data;
        },
    });

    const filteredFundings = useMemo(() => {
        if (!fundings) return [];
        return fundings.filter((funding: any) =>
            funding.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            funding.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            funding.amount.toString().includes(searchQuery)
        );
    }, [fundings, searchQuery]);

    const handleExport = () => {
        const dataToExport = filteredFundings.map((f: any) => ({
            'التاريخ': format(new Date(f.date), 'yyyy/MM/dd'),
            'المبلغ': f.amount,
            'الوسيلة': f.paymentMethod,
            'المرجع': f.reference,
            'ملاحظات': f.notes
        }));
        exportToExcel(dataToExport, 'سجل_التمويلات');
    };

    const createCapitalMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.post('/capital', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['capitalSummary'] });
            setIsCapitalModalOpen(false);
        },
    });

    const createFundingMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.post('/funding', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fundings'] });
            queryClient.invalidateQueries({ queryKey: ['capitalSummary'] });
            setIsFundingModalOpen(false);
            resetFundingForm();
        },
    });

    const deleteFundingMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/funding/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fundings'] });
            queryClient.invalidateQueries({ queryKey: ['capitalSummary'] });
        },
    });


    const onCapitalSubmit = (data: any) => {
        createCapitalMutation.mutate(data);
    };

    const onFundingSubmit = (data: any) => {
        createFundingMutation.mutate(data);
    };

    // if (isSummaryLoading || isFundingsLoading) return <div>جار التحميل...</div>; // Removed to allow partial rendering

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">رأس المال والتمويل</h1>

            {/* Capital Summary Cards */}
            {isSummaryLoading ? (
                <div className="text-center py-8">جار تحميل الملخص...</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-600">الرصيد الافتتاحي</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">{summary?.openingBalance || 0} د.ج</div>
                            {(!summary?.openingBalance && summary?.openingBalance !== 0) && (
                                <Button variant="outline" size="sm" onClick={() => setIsCapitalModalOpen(true)} className="mt-2">
                                    تعيين الرصيد
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="bg-emerald-50 border-emerald-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-600">إجمالي التمويلات</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-900">{summary?.totalFunding || 0} د.ج</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-50 border-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">رأس المال الكلي</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{summary?.totalCapital || 0} د.ج</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Fundings List */}
            <Card>
                <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <CardTitle>سجل التمويلات والإضافات المالية</CardTitle>
                    <div className="flex w-full md:w-auto gap-2">
                        <SearchInput
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="بحث في التمويلات..."
                            className="w-full md:w-64"
                        />
                        <Button variant="outline" onClick={handleExport} className="gap-2 shrink-0">
                            <FileSpreadsheet className="w-4 h-4 text-green-600" />
                            تصدير
                        </Button>
                        <Button onClick={() => setIsFundingModalOpen(true)} className="gap-2 shrink-0">
                            <Plus className="w-4 h-4" />
                            إضافة تمويل
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isFundingsLoading ? (
                        <div className="text-center py-8">جار تحميل القائمة...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>التاريخ</TableHead>
                                    <TableHead>المبلغ</TableHead>
                                    <TableHead>الوسيلة</TableHead>
                                    <TableHead>المرجع</TableHead>
                                    <TableHead>ملاحظات</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredFundings?.map((funding: any) => (
                                    <TableRow key={funding._id}>
                                        <TableCell>{format(new Date(funding.date), 'yyyy/MM/dd')}</TableCell>
                                        <TableCell className="font-bold text-emerald-600">+{funding.amount} د.ج</TableCell>
                                        <TableCell>
                                            {funding.paymentMethod === 'cash' && 'نقدًا'}
                                            {funding.paymentMethod === 'bank' && 'بنك'}
                                            {funding.paymentMethod === 'check' && 'شيك'}
                                        </TableCell>
                                        <TableCell>{funding.reference || '-'}</TableCell>
                                        <TableCell>{funding.notes || '-'}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteFundingMutation.mutate(funding._id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredFundings?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            {searchQuery ? 'لا توجد نتائج' : 'لا توجد تمويلات مسجلة'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Funding Modal */}
            <Modal isOpen={isFundingModalOpen} onClose={() => setIsFundingModalOpen(false)} title="إضافة تمويل جديد">
                <form onSubmit={handleSubmitFunding(onFundingSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">التاريخ</label>
                        <Input type="date" {...registerFunding('date', { required: true })} defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <Input label="المبلغ" type="number" step="any" {...registerFunding('amount', { required: true })} placeholder="0.00" />

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">طريقة الدفع</label>
                        <select {...registerFunding('paymentMethod', { required: true })} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="cash">نقدًا (Espèce)</option>
                            <option value="bank">تحويل بنكي (Virement)</option>
                            <option value="check">شيك (Chèque)</option>
                        </select>
                    </div>

                    <Input label="المرجع (رقم الشيك/التحويل)" {...registerFunding('reference')} placeholder="اختياري" />
                    <Input label="ملاحظات" {...registerFunding('notes')} placeholder="اختياري" />

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="secondary" onClick={() => setIsFundingModalOpen(false)}>إلغاء</Button>
                        <Button type="submit">إضافة</Button>
                    </div>
                </form>
            </Modal>

            {/* Capital Modal */}
            <Modal isOpen={isCapitalModalOpen} onClose={() => setIsCapitalModalOpen(false)} title="تعيين الرصيد الافتتاحي">
                <form onSubmit={handleSubmitCapital(onCapitalSubmit)} className="space-y-4">
                    <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm mb-4">
                        تنبيه: يمكن تعيين الرصيد الافتتاحي مرة واحدة فقط ولا يمكن تعديله لاحقًا.
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">التاريخ</label>
                        <Input type="date" {...registerCapital('date', { required: true })} defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <Input label="الرصيد الافتتاحي" type="number" step="any" {...registerCapital('openingBalance', { required: true })} placeholder="0.00" />

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="secondary" onClick={() => setIsCapitalModalOpen(false)}>إلغاء</Button>
                        <Button type="submit">حفظ وتثبيت</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Capital;

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Edit, Phone, MapPin, FileSpreadsheet } from 'lucide-react';

import api from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import SearchInput from '../components/ui/SearchInput';
import { exportToExcel } from '../utils/exportToExcel';

const Suppliers = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { register, handleSubmit, reset, setValue } = useForm();

    const { data: suppliers, isLoading } = useQuery({
        queryKey: ['suppliers'],
        queryFn: async () => {
            const { data } = await api.get('/suppliers');
            return data;
        },
    });

    const filteredSuppliers = useMemo(() => {
        if (!suppliers) return [];
        return suppliers.filter((supplier: any) =>
            supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            supplier.phone?.includes(searchQuery) ||
            supplier.address?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [suppliers, searchQuery]);

    const handleExport = () => {
        const dataToExport = filteredSuppliers.map((s: any) => ({
            'الاسم': s.name,
            'الهاتف': s.phone,
            'العنوان': s.address,
            'إجمالي المشتريات': 0, // Placeholder
            'المدفوع': 0, // Placeholder
            'الباقي': 0 // Placeholder
        }));
        exportToExcel(dataToExport, 'قائمة_الموردين');
    };

    const createMutation = useMutation({
        mutationFn: async (data: any) => await api.post('/suppliers', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            closeModal();
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: any) => await api.put(`/suppliers/${editingSupplier._id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            closeModal();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => await api.delete(`/suppliers/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        },
    });

    const onSubmit = (data: any) => {
        if (editingSupplier) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const openEditModal = (supplier: any) => {
        setEditingSupplier(supplier);
        setValue('name', supplier.name);
        setValue('phone', supplier.phone);
        setValue('address', supplier.address);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSupplier(null);
        reset();
    };

    if (isLoading) return <div>جار التحميل...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-800">الموردين</h1>
                <div className="flex w-full md:w-auto gap-2">
                    <SearchInput
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث عن مورد..."
                        className="w-full md:w-64"
                    />
                    <Button variant="outline" onClick={handleExport} className="gap-2 shrink-0">
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        تصدير
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)} className="gap-2 shrink-0">
                        <Plus className="w-4 h-4" />
                        إضافة مورد
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الاسم</TableHead>
                                <TableHead>الهاتف</TableHead>
                                <TableHead>العنوان</TableHead>
                                <TableHead>إجمالي المشتريات</TableHead>
                                <TableHead>المدفوع</TableHead>
                                <TableHead>الباقي</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSuppliers?.map((supplier: any) => (
                                <TableRow key={supplier._id}>
                                    <TableCell className="font-medium text-slate-900">{supplier.name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3 h-3 text-slate-400" />
                                            <span dir="ltr">{supplier.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3 h-3 text-slate-400" />
                                            {supplier.address}
                                        </div>
                                    </TableCell>
                                    <TableCell>0 د.ج</TableCell> {/* Needs aggregation later */}
                                    <TableCell className="text-emerald-600">0 د.ج</TableCell>
                                    <TableCell className="text-red-600">0 د.ج</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => openEditModal(supplier)}>
                                                <Edit className="w-4 h-4 text-slate-500" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(supplier._id)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredSuppliers?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        {searchQuery ? 'لا توجد نتائج مطابقة للبحث' : 'لا يوجد موردين'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingSupplier ? "تعديل بيانات مورد" : "إضافة مورد جديد"}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input label="اسم المورد" {...register('name', { required: true })} placeholder="الاسم الكامل" />
                    <Input label="رقم الهاتف" {...register('phone')} placeholder="0X XX XX XX XX" />
                    <Input label="العنوان" {...register('address')} placeholder="المدينة، الولاية" />

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="secondary" onClick={closeModal}>إلغاء</Button>
                        <Button type="submit">{editingSupplier ? 'حفظ التعديلات' : 'إضافة المورد'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Suppliers;

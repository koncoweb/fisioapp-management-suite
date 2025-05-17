import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { TherapistSalary, SalaryComponent } from '@/types/salary';

// Definisikan tipe User secara inline untuk menghindari masalah import
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  [key: string]: any;
}

import SalaryReceipt from '@/components/salary/SalaryReceipt';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  CalendarIcon,
  PlusCircle,
  Printer,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Trash2
} from 'lucide-react';

const TherapistSalaryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [salaries, setSalaries] = useState<TherapistSalary[]>([]);
  const [therapists, setTherapists] = useState<User[]>([]);
  const [selectedSalary, setSelectedSalary] = useState<TherapistSalary | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  
  // Dialog states
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [addComponentDialogOpen, setAddComponentDialogOpen] = useState(false);
  const [markAsPaidDialogOpen, setMarkAsPaidDialogOpen] = useState(false);
  
  // New component form
  const [componentType, setComponentType] = useState<string>('bonus');
  const [componentAmount, setComponentAmount] = useState<string>('');
  const [componentDescription, setComponentDescription] = useState<string>('');
  
  // Years and months for dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i));
  const months = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ];

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    fetchTherapists();
  }, [currentUser, navigate]);
  
  useEffect(() => {
    if (selectedTherapist && selectedMonth && selectedYear) {
      fetchSalaries();
    }
  }, [selectedTherapist, selectedMonth, selectedYear]);

  const fetchTherapists = async () => {
    try {
      setLoading(true);
      const therapistsRef = collection(db, 'users');
      const q = query(therapistsRef, where('role', '==', 'therapist'));
      const querySnapshot = await getDocs(q);
      
      const therapistsData: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        therapistsData.push({ 
          id: doc.id, 
          name: data.name || 'Nama tidak tersedia',
          email: data.email || '',
          role: data.role || 'therapist',
          ...data 
        } as User);
      });
      
      setTherapists(therapistsData);
      
      // Set default selected therapist if available
      if (therapistsData.length > 0) {
        setSelectedTherapist(therapistsData[0].id);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching therapists:', error);
      toast.error('Gagal mengambil data terapis');
      setLoading(false);
    }
  };

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const salariesRef = collection(db, 'therapistSalary');
      const q = query(
        salariesRef,
        where('therapistId', '==', selectedTherapist),
        where('periodMonth', '==', parseInt(selectedMonth)),
        where('periodYear', '==', parseInt(selectedYear)),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const salariesData: TherapistSalary[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as TherapistSalary;
        salariesData.push({ id: doc.id, ...data });
      });
      
      setSalaries(salariesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching salaries:', error);
      toast.error('Gagal mengambil data gaji');
      setLoading(false);
    }
  };
  
  const handleViewReceipt = (salary: TherapistSalary) => {
    setSelectedSalary(salary);
    setReceiptDialogOpen(true);
  };
  
  const handleAddComponent = () => {
    if (!componentAmount || !componentDescription) {
      toast.error('Mohon isi semua field');
      return;
    }
    
    if (isNaN(parseFloat(componentAmount)) || parseFloat(componentAmount) <= 0) {
      toast.error('Jumlah harus berupa angka positif');
      return;
    }
    
    addSalaryComponent();
  };
  
  const addSalaryComponent = async () => {
    if (!selectedSalary) return;
    
    try {
      const amount = parseFloat(componentAmount);
      const newComponent: SalaryComponent = {
        date: Timestamp.now().toDate().toISOString(),
        amount,
        description: componentDescription
      };
      
      const salaryRef = doc(db, 'therapistSalary', selectedSalary.id);
      const salaryDoc = await getDoc(salaryRef);
      
      if (!salaryDoc.exists()) {
        toast.error('Data gaji tidak ditemukan');
        return;
      }
      
      const salaryData = salaryDoc.data() as TherapistSalary;
      let updatedSalary: Partial<TherapistSalary> = {};
      let newTotalAmount = salaryData.totalAmount;
      
      // Update the appropriate component array
      switch (componentType) {
        case 'bonus':
          const bonuses = salaryData.bonuses || [];
          updatedSalary = { bonuses: [...bonuses, newComponent] };
          newTotalAmount += amount;
          break;
        case 'allowance':
          const allowances = salaryData.allowances || [];
          updatedSalary = { allowances: [...allowances, newComponent] };
          newTotalAmount += amount;
          break;
        case 'deduction':
          const deductions = salaryData.deductions || [];
          updatedSalary = { deductions: [...deductions, newComponent] };
          newTotalAmount -= amount;
          break;
        case 'tax':
          const taxes = salaryData.taxes || [];
          updatedSalary = { taxes: [...taxes, newComponent] };
          newTotalAmount -= amount;
          break;
        case 'cashAdvance':
          const cashAdvances = salaryData.cashAdvances || [];
          updatedSalary = { cashAdvances: [...cashAdvances, newComponent] };
          newTotalAmount -= amount;
          break;
        default:
          break;
      }
      
      // Update the salary document
      await updateDoc(salaryRef, {
        ...updatedSalary,
        totalAmount: newTotalAmount,
        updatedAt: Timestamp.now()
      });
      
      toast.success('Komponen gaji berhasil ditambahkan');
      setAddComponentDialogOpen(false);
      clearComponentForm();
      fetchSalaries();
      
    } catch (error) {
      console.error('Error adding salary component:', error);
      toast.error('Gagal menambahkan komponen gaji');
    }
  };
  
  const handleMarkAsPaid = async () => {
    if (!selectedSalary) return;
    
    try {
      const salaryRef = doc(db, 'therapistSalary', selectedSalary.id);
      
      await updateDoc(salaryRef, {
        status: 'paid',
        paidDate: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now()
      });
      
      toast.success('Gaji berhasil ditandai sebagai dibayar');
      setMarkAsPaidDialogOpen(false);
      fetchSalaries();
      
    } catch (error) {
      console.error('Error marking salary as paid:', error);
      toast.error('Gagal menandai gaji sebagai dibayar');
    }
  };
  
  const clearComponentForm = () => {
    setComponentType('bonus');
    setComponentAmount('');
    setComponentDescription('');
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Belum Dibayar</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Lunas</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getComponentTypeLabel = (type: string) => {
    switch (type) {
      case 'bonus':
        return 'Bonus';
      case 'allowance':
        return 'Tunjangan';
      case 'deduction':
        return 'Potongan';
      case 'tax':
        return 'Pajak';
      case 'cashAdvance':
        return 'Kasbon';
      default:
        return type;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Pengelolaan Gaji Terapis</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Data Gaji</CardTitle>
          <CardDescription>Pilih terapis dan periode untuk melihat data gaji</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="w-full">
              <Label htmlFor="therapist">Terapis</Label>
              <Select
                value={selectedTherapist}
                onValueChange={setSelectedTherapist}
              >
                <SelectTrigger id="therapist" className="w-full">
                  <SelectValue placeholder="Pilih Terapis" />
                </SelectTrigger>
                <SelectContent>
                  {therapists.length > 0 ? (
                    therapists.map((therapist) => (
                      <SelectItem key={therapist.id} value={therapist.id}>
                        {therapist.name || therapist.email || 'Nama tidak tersedia'}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-therapist" disabled>
                      Tidak ada terapis tersedia
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full">
              <Label htmlFor="month">Bulan</Label>
              <Select
                value={selectedMonth}
                onValueChange={setSelectedMonth}
              >
                <SelectTrigger id="month" className="w-full">
                  <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full">
              <Label htmlFor="year">Tahun</Label>
              <Select
                value={selectedYear}
                onValueChange={setSelectedYear}
              >
                <SelectTrigger id="year" className="w-full">
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          {salaries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg text-gray-500">Tidak ada data gaji untuk periode yang dipilih</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Data Gaji Terapis</CardTitle>
                <CardDescription>
                  Periode: {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {salaries.map((salary) => (
                  <div key={salary.id} className="border rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{salary.therapistName}</h3>
                        <p className="text-sm text-gray-500">
                          ID: {salary.therapistId}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {getStatusBadge(salary.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium mb-2">Rincian Pendapatan</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Pembayaran Terapi ({salary.therapyPayments.length})</span>
                            <span>{formatCurrency(salary.therapyPayments.reduce((sum, p) => sum + p.amount, 0))}</span>
                          </div>
                          
                          {salary.bonuses && salary.bonuses.length > 0 && (
                            <div className="flex justify-between">
                              <span>Bonus ({salary.bonuses.length})</span>
                              <span>{formatCurrency(salary.bonuses.reduce((sum, b) => sum + b.amount, 0))}</span>
                            </div>
                          )}
                          
                          {salary.allowances && salary.allowances.length > 0 && (
                            <div className="flex justify-between">
                              <span>Tunjangan ({salary.allowances.length})</span>
                              <span>{formatCurrency(salary.allowances.reduce((sum, a) => sum + a.amount, 0))}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Rincian Potongan</h4>
                        <div className="space-y-2">
                          {salary.deductions && salary.deductions.length > 0 && (
                            <div className="flex justify-between">
                              <span>Potongan ({salary.deductions.length})</span>
                              <span>-{formatCurrency(salary.deductions.reduce((sum, d) => sum + d.amount, 0))}</span>
                            </div>
                          )}
                          
                          {salary.taxes && salary.taxes.length > 0 && (
                            <div className="flex justify-between">
                              <span>Pajak ({salary.taxes.length})</span>
                              <span>-{formatCurrency(salary.taxes.reduce((sum, t) => sum + t.amount, 0))}</span>
                            </div>
                          )}
                          
                          {salary.cashAdvances && salary.cashAdvances.length > 0 && (
                            <div className="flex justify-between">
                              <span>Kasbon ({salary.cashAdvances.length})</span>
                              <span>-{formatCurrency(salary.cashAdvances.reduce((sum, c) => sum + c.amount, 0))}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="font-semibold">Total Gaji Bersih:</span>
                        <span className="text-lg font-bold ml-2">{formatCurrency(salary.totalAmount)}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedSalary(salary);
                            handleViewReceipt(salary);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Lihat Slip
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedSalary(salary);
                            setAddComponentDialogOpen(true);
                          }}
                        >
                          <PlusCircle className="h-4 w-4 mr-1" />
                          Tambah Komponen
                        </Button>
                        
                        {salary.status === 'pending' && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => {
                              setSelectedSalary(salary);
                              setMarkAsPaidDialogOpen(true);
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Tandai Dibayar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
      
      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Slip Gaji Terapis</DialogTitle>
            <DialogDescription>
              Periode: {selectedSalary && `${months.find(m => m.value === String(selectedSalary.periodMonth))?.label} ${selectedSalary.periodYear}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSalary && (
            <SalaryReceipt 
              salary={selectedSalary} 
              onClose={() => setReceiptDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Component Dialog */}
      <Dialog open={addComponentDialogOpen} onOpenChange={setAddComponentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Komponen Gaji</DialogTitle>
            <DialogDescription>
              Tambahkan komponen gaji seperti bonus, tunjangan, potongan, pajak, atau kasbon.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="componentType">Jenis Komponen</Label>
              <Select
                value={componentType}
                onValueChange={setComponentType}
              >
                <SelectTrigger id="componentType">
                  <SelectValue placeholder="Pilih Jenis Komponen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bonus">Bonus</SelectItem>
                  <SelectItem value="allowance">Tunjangan</SelectItem>
                  <SelectItem value="deduction">Potongan</SelectItem>
                  <SelectItem value="tax">Pajak</SelectItem>
                  <SelectItem value="cashAdvance">Kasbon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="componentAmount">Jumlah</Label>
              <Input
                id="componentAmount"
                type="number"
                placeholder="Masukkan jumlah"
                value={componentAmount}
                onChange={(e) => setComponentAmount(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="componentDescription">Deskripsi</Label>
              <Textarea
                id="componentDescription"
                placeholder="Masukkan deskripsi"
                value={componentDescription}
                onChange={(e) => setComponentDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddComponentDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddComponent}>
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Mark as Paid Dialog */}
      <Dialog open={markAsPaidDialogOpen} onOpenChange={setMarkAsPaidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tandai Gaji Sebagai Dibayar</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menandai gaji ini sebagai sudah dibayar?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p>Nama Terapis: <span className="font-semibold">{selectedSalary?.therapistName}</span></p>
            <p>Periode: <span className="font-semibold">
              {selectedSalary && `${months.find(m => m.value === String(selectedSalary.periodMonth))?.label} ${selectedSalary.periodYear}`}
            </span></p>
            <p>Total Gaji: <span className="font-semibold">
              {selectedSalary && formatCurrency(selectedSalary.totalAmount)}
            </span></p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkAsPaidDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleMarkAsPaid}>
              Tandai Dibayar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TherapistSalaryPage;

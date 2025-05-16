import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, getDocs, doc, updateDoc, addDoc, where, getDoc } from 'firebase/firestore';
import { useAddExpense } from '@/hooks/use-transactions';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { TherapySession } from '@/types/therapySession';
import { TherapyPayment } from '@/types/payment';
import { TherapistSalary, TherapyPaymentSalary } from '@/types/salary';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle, DollarSign, Search } from 'lucide-react';
import PaymentReceipt from '@/components/payment/PaymentReceipt';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TherapyPaymentsPage = () => {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [confirmedSessions, setConfirmedSessions] = useState<TherapySession[]>([]);
  const [payments, setPayments] = useState<TherapyPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TherapySession | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentType, setPaymentType] = useState<'direct' | 'salary'>('direct');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<TherapyPayment | null>(null);
  const [activeTab, setActiveTab] = useState('sessions');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Hook untuk menambahkan pengeluaran
  const { mutate: addExpense } = useAddExpense();

  useEffect(() => {
    fetchConfirmedSessions();
    fetchPayments();
  }, []);

  const fetchConfirmedSessions = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'therapySessions'),
        where('status', '==', 'confirmed')
      );
      const sessionsSnapshot = await getDocs(q);
      const sessionsData = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TherapySession[];
      
      // Periksa sesi mana yang sudah memiliki pembayaran
      const paymentsQuery = query(collection(db, 'therapyPayments'));
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const paymentsData = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TherapyPayment[];
      
      // Tandai sesi yang sudah dibayar dan jenisnya
      const sessionsWithPaymentStatus = sessionsData.map(session => {
        const payment = paymentsData.find(
          payment => payment.therapySessionId === session.id
        );
        
        if (payment) {
          return {
            ...session,
            isPaid: true,
            paymentType: payment.paymentType || 'direct' // Default ke 'direct' jika tidak ada paymentType
          };
        } else {
          return {
            ...session,
            isPaid: false
          };
        }
      });
      
      setConfirmedSessions(sessionsWithPaymentStatus);
    } catch (error) {
      console.error('Error fetching confirmed therapy sessions:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengambil data sesi terapi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'therapyPayments'));
      const paymentsSnapshot = await getDocs(q);
      const paymentsData = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TherapyPayment[];
      
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error fetching therapy payments:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengambil data pembayaran',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReceiptNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}${day}-${random}`;
  };

  const handleCreatePayment = async () => {
    if (!selectedSession || !userData || !paymentAmount || !paymentMethod) {
      toast({
        title: 'Error',
        description: 'Semua field harus diisi',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(paymentAmount);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Jumlah pembayaran harus lebih dari 0');
      }

      // Generate receipt number
      const receiptNumber = generateReceiptNumber();

      const paymentData = {
        therapySessionId: selectedSession.id,
        patientId: selectedSession.patientId,
        patientName: selectedSession.patientName,
        therapistId: selectedSession.therapistId,
        therapistName: selectedSession.therapistName,
        serviceId: selectedSession.serviceId,
        serviceName: selectedSession.serviceName,
        amount,
        status: 'paid',
        paymentMethod,
        paymentType,
        paymentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedBy: {
          userId: userData.uid,
          name: userData.namaLengkap
        },
        notes: paymentNotes,
        receiptNumber
      };

      const paymentRef = await addDoc(collection(db, 'therapyPayments'), paymentData);
      
      toast({
        title: 'Sukses',
        description: 'Pembayaran berhasil dicatat',
      });
      
      // Get the payment with ID
      const newPayment: TherapyPayment = {
        id: paymentRef.id,
        ...paymentData,
        status: paymentData.status as 'paid' | 'pending' | 'cancelled'
      };
      
      // Jika pembayaran langsung, catat sebagai pengeluaran di halaman keuangan
      if (paymentType === 'direct') {
        // Tambahkan ke pengeluaran
        addExpense({
          name: `Pembayaran Terapis - ${selectedSession.therapistName}`,
          amount: amount,
          description: `Pembayaran untuk sesi terapi ${selectedSession.serviceName} oleh ${selectedSession.therapistName} untuk pasien ${selectedSession.patientName}`,
          date: new Date(),
          category: 'Gaji Terapis',
          createdBy: userData.uid,
          type: 'expense'
        }, {
          onSuccess: () => {
            console.log('Pengeluaran berhasil dicatat');
          },
          onError: (error) => {
            console.error('Gagal mencatat pengeluaran:', error);
            toast({
              title: 'Peringatan',
              description: 'Pembayaran berhasil dicatat, tetapi gagal mencatat sebagai pengeluaran',
              variant: 'destructive',
            });
          }
        });
        
        // Tampilkan receipt
        setCurrentPayment(newPayment);
        setPaymentDialogOpen(false);
        setReceiptDialogOpen(true);
      } else {
        // Jika pembayaran masuk gaji, tambahkan ke collection therapistSalary untuk rekap gaji bulanan
        try {
          // Dapatkan bulan dan tahun saat ini untuk periode gaji
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
          const currentYear = currentDate.getFullYear();
          
          // Data pembayaran untuk ditambahkan ke array therapyPayments
          const paymentData: TherapyPaymentSalary = {
            paymentId: paymentRef.id,
            therapySessionId: selectedSession.id,
            patientName: selectedSession.patientName,
            serviceName: selectedSession.serviceName,
            amount: amount,
            date: new Date().toISOString(),
            notes: paymentNotes
          };
          
          // Cek apakah sudah ada rekap gaji untuk terapis ini pada bulan dan tahun ini
          const salaryQuery = query(
            collection(db, 'therapistSalary'),
            where('therapistId', '==', selectedSession.therapistId),
            where('periodMonth', '==', currentMonth),
            where('periodYear', '==', currentYear)
          );
          
          const salarySnapshot = await getDocs(salaryQuery);
          
          if (salarySnapshot.empty) {
            // Jika belum ada, buat dokumen baru
            const newSalaryData: Omit<TherapistSalary, 'id'> = {
              therapistId: selectedSession.therapistId,
              therapistName: selectedSession.therapistName,
              periodMonth: currentMonth,
              periodYear: currentYear,
              therapyPayments: [paymentData],
              totalAmount: amount, // Awalnya hanya jumlah dari pembayaran ini
              status: 'pending', // Default status adalah pending sampai dibayarkan
              createdAt: new Date().toISOString(),
              updatedBy: {
                userId: userData.uid,
                name: userData.namaLengkap
              },
              notes: `Rekap gaji terapis ${selectedSession.therapistName} untuk periode ${currentMonth}/${currentYear}`
            };
            
            await addDoc(collection(db, 'therapistSalary'), newSalaryData);
            
            toast({
              title: 'Sukses',
              description: 'Pembayaran berhasil dicatat dan ditambahkan ke rekap gaji terapis',
            });
          } else {
            // Jika sudah ada, update dokumen yang ada
            const salaryDoc = salarySnapshot.docs[0];
            const salaryData = salaryDoc.data() as TherapistSalary;
            
            // Tambahkan pembayaran baru ke array therapyPayments
            const updatedTherapyPayments = [...salaryData.therapyPayments, paymentData];
            
            // Hitung total amount baru (jumlah semua pembayaran + bonus - potongan dll)
            let newTotalAmount = updatedTherapyPayments.reduce((sum, payment) => sum + payment.amount, 0);
            
            // Tambahkan bonus jika ada
            if (salaryData.bonuses && salaryData.bonuses.length > 0) {
              newTotalAmount += salaryData.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
            }
            
            // Tambahkan tunjangan jika ada
            if (salaryData.allowances && salaryData.allowances.length > 0) {
              newTotalAmount += salaryData.allowances.reduce((sum, allowance) => sum + allowance.amount, 0);
            }
            
            // Kurangi potongan jika ada
            if (salaryData.deductions && salaryData.deductions.length > 0) {
              newTotalAmount -= salaryData.deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
            }
            
            // Kurangi pajak jika ada
            if (salaryData.taxes && salaryData.taxes.length > 0) {
              newTotalAmount -= salaryData.taxes.reduce((sum, tax) => sum + tax.amount, 0);
            }
            
            // Kurangi kasbon jika ada
            if (salaryData.cashAdvances && salaryData.cashAdvances.length > 0) {
              newTotalAmount -= salaryData.cashAdvances.reduce((sum, cashAdvance) => sum + cashAdvance.amount, 0);
            }
            
            // Update dokumen
            await updateDoc(doc(db, 'therapistSalary', salaryDoc.id), {
              therapyPayments: updatedTherapyPayments,
              totalAmount: newTotalAmount,
              updatedAt: new Date().toISOString(),
              updatedBy: {
                userId: userData.uid,
                name: userData.namaLengkap
              }
            });
            
            toast({
              title: 'Sukses',
              description: 'Pembayaran berhasil dicatat dan ditambahkan ke rekap gaji terapis',
            });
          }
        } catch (error) {
          console.error('Error adding to therapist salary:', error);
          toast({
            title: 'Peringatan',
            description: 'Pembayaran berhasil dicatat, tetapi gagal menambahkan ke rekap gaji terapis',
            variant: 'destructive',
          });
        }
        
        // Reset form
        setPaymentAmount('');
        setPaymentMethod('cash');
        setPaymentType('direct');
        setPaymentNotes('');
        setPaymentDialogOpen(false);
        
        // Refresh payments list
        await fetchPayments();
        
        // Switch to payments tab
        setActiveTab('payments');
      }
    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal mencatat pembayaran. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };



  const handleCloseReceipt = () => {
    setReceiptDialogOpen(false);
    setCurrentPayment(null);
    
    // Reset form
    setPaymentAmount('');
    setPaymentMethod('cash');
    setPaymentType('direct');
    setPaymentNotes('');
    
    // Refresh payments list dan sessions list
    fetchPayments();
    fetchConfirmedSessions();
    
    // Switch to payments tab
    setActiveTab('payments');
  };

  const handleOpenPaymentDialog = (session: TherapySession) => {
    setSelectedSession(session);
    setPaymentDialogOpen(true);
  };

  const getStatusBadge = (status: string, paymentType?: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Menunggu</Badge>;
      case 'paid':
        if (paymentType === 'salary') {
          return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Masuk Gaji</Badge>;
        }
        return <Badge variant="outline" className="bg-green-100 text-green-800">Dibayar</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredSessions = confirmedSessions.filter(session => 
    session.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.therapistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPayments = payments.filter(payment => 
    payment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.therapistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Pembayaran Sesi Terapi</h1>
      
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan nama pasien, terapis, atau layanan"
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="sessions">Sesi Terapi Terkonfirmasi</TabsTrigger>
          <TabsTrigger value="payments">Riwayat Pembayaran</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Sesi Terapi Terkonfirmasi</CardTitle>
              <CardDescription>
                Daftar sesi terapi yang telah dikonfirmasi dan siap untuk pembayaran
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Memuat data...</div>
              ) : filteredSessions.length === 0 ? (
                <div className="text-center py-4">Belum ada sesi terapi yang dikonfirmasi</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Pasien</TableHead>
                        <TableHead>Terapis</TableHead>
                        <TableHead>Layanan</TableHead>
                        <TableHead>Durasi</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>{session.date}</TableCell>
                          <TableCell>{session.time}</TableCell>
                          <TableCell>{session.patientName}</TableCell>
                          <TableCell>{session.therapistName}</TableCell>
                          <TableCell>{session.serviceName}</TableCell>
                          <TableCell>{session.duration} menit</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className={`${session.isPaid ? 
                                (session.paymentType === 'salary' ? 'bg-blue-100 hover:bg-blue-200 text-blue-800' : 'bg-green-100 hover:bg-green-200 text-green-800') : 
                                'bg-green-100 hover:bg-green-200 text-green-800'}`}
                              onClick={() => handleOpenPaymentDialog(session)}
                              disabled={session.isPaid}
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              {session.isPaid ? 
                                (session.paymentType === 'salary' ? 'Masuk Gaji' : 'Pembayaran Tercatat') : 
                                'Catat Pembayaran'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pembayaran</CardTitle>
              <CardDescription>
                Daftar pembayaran sesi terapi yang telah dicatat
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Memuat data...</div>
              ) : filteredPayments.length === 0 ? (
                <div className="text-center py-4">Belum ada pembayaran yang dicatat</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal Pembayaran</TableHead>
                        <TableHead>Pasien</TableHead>
                        <TableHead>Terapis</TableHead>
                        <TableHead>Layanan</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Metode</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{new Date(payment.paymentDate || payment.createdAt).toLocaleDateString('id-ID')}</TableCell>
                          <TableCell>{payment.patientName}</TableCell>
                          <TableCell>{payment.therapistName}</TableCell>
                          <TableCell>{payment.serviceName}</TableCell>
                          <TableCell>{formatCurrency(payment.amount)}</TableCell>
                          <TableCell>{payment.paymentMethod}</TableCell>
                          <TableCell>{getStatusBadge(payment.status, payment.paymentType)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Catat Pembayaran</DialogTitle>
            <DialogDescription>
              Masukkan detail pembayaran untuk sesi terapi
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Pasien</Label>
                <div className="col-span-3">{selectedSession.patientName}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Terapis</Label>
                <div className="col-span-3">{selectedSession.therapistName}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Layanan</Label>
                <div className="col-span-3">{selectedSession.serviceName}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="amount">Jumlah</Label>
                <div className="col-span-3">
                  <Input
                    id="amount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Masukkan jumlah pembayaran"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="method">Metode Pembayaran</Label>
                <div className="col-span-3">
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger id="method">
                      <SelectValue placeholder="Pilih metode pembayaran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Tunai</SelectItem>
                      <SelectItem value="transfer">Transfer Bank</SelectItem>
                      <SelectItem value="debit">Kartu Debit</SelectItem>
                      <SelectItem value="credit">Kartu Kredit</SelectItem>
                      <SelectItem value="qris">QRIS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="paymentType">Jenis Pembayaran</Label>
                <div className="col-span-3">
                  <Select value={paymentType} onValueChange={(value: 'direct' | 'salary') => setPaymentType(value)}>
                    <SelectTrigger id="paymentType">
                      <SelectValue placeholder="Pilih jenis pembayaran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Pembayaran Langsung</SelectItem>
                      <SelectItem value="salary">Masuk Gaji Terapis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="notes">Catatan</Label>
                <div className="col-span-3">
                  <Textarea
                    id="notes"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Tambahkan catatan tentang pembayaran ini (opsional)"
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleCreatePayment}
              disabled={loading || !paymentAmount || !paymentMethod}
            >
              {loading ? 'Menyimpan...' : 'Simpan Pembayaran'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Bukti Pembayaran</DialogTitle>
            <DialogDescription>
              Bukti pembayaran sesi terapi
            </DialogDescription>
          </DialogHeader>
          
          {currentPayment && (
            <PaymentReceipt 
              payment={currentPayment} 
              onClose={handleCloseReceipt} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TherapyPaymentsPage;

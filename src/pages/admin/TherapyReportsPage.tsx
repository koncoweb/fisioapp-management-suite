import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { TherapySession } from '@/types/therapySession';
import { TherapyPayment } from '@/types/payment';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Calendar as CalendarIcon, Download, FileBarChart } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TherapistSummary {
  id: string;
  name: string;
  totalSessions: number;
  confirmedSessions: number;
  pendingSessions: number;
  cancelledSessions: number;
  totalDuration: number;
  totalPayments: number;
}

interface PatientSummary {
  id: string;
  name: string;
  totalSessions: number;
  totalDuration: number;
  totalPayments: number;
}

const TherapyReportsPage = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [payments, setPayments] = useState<TherapyPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('therapist');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const [therapistSummaries, setTherapistSummaries] = useState<TherapistSummary[]>([]);
  const [patientSummaries, setPatientSummaries] = useState<PatientSummary[]>([]);
  const [periodFilter, setPeriodFilter] = useState('this-month');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (sessions.length > 0 && payments.length > 0) {
      generateSummaries();
    }
  }, [sessions, payments, dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all therapy sessions
      const sessionsSnapshot = await getDocs(collection(db, 'therapySessions'));
      const sessionsData = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TherapySession[];
      setSessions(sessionsData);
      
      // Fetch all therapy payments
      const paymentsSnapshot = await getDocs(collection(db, 'therapyPayments'));
      const paymentsData = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TherapyPayment[];
      setPayments(paymentsData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengambil data. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (value: string) => {
    setPeriodFilter(value);
    
    const today = new Date();
    let from: Date;
    let to: Date = today;
    
    switch (value) {
      case 'today':
        from = today;
        break;
      case 'yesterday':
        from = subDays(today, 1);
        to = subDays(today, 1);
        break;
      case 'last-7-days':
        from = subDays(today, 6);
        break;
      case 'last-30-days':
        from = subDays(today, 29);
        break;
      case 'this-month':
      default:
        from = startOfMonth(today);
        break;
    }
    
    setDateRange({ from, to });
  };

  const generateSummaries = () => {
    if (!dateRange?.from) return;
    
    const filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return dateRange.to 
        ? isWithinInterval(sessionDate, { start: dateRange.from, end: dateRange.to })
        : format(sessionDate, 'yyyy-MM-dd') === format(dateRange.from, 'yyyy-MM-dd');
    });
    
    const filteredPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate || payment.createdAt);
      return dateRange.to 
        ? isWithinInterval(paymentDate, { start: dateRange.from, end: dateRange.to })
        : format(paymentDate, 'yyyy-MM-dd') === format(dateRange.from, 'yyyy-MM-dd');
    });
    
    // Generate therapist summaries
    const therapistMap = new Map<string, TherapistSummary>();
    
    filteredSessions.forEach(session => {
      if (!therapistMap.has(session.therapistId)) {
        therapistMap.set(session.therapistId, {
          id: session.therapistId,
          name: session.therapistName,
          totalSessions: 0,
          confirmedSessions: 0,
          pendingSessions: 0,
          cancelledSessions: 0,
          totalDuration: 0,
          totalPayments: 0
        });
      }
      
      const summary = therapistMap.get(session.therapistId)!;
      summary.totalSessions += 1;
      summary.totalDuration += session.duration;
      
      if (session.status === 'confirmed') {
        summary.confirmedSessions += 1;
      } else if (session.status === 'pending') {
        summary.pendingSessions += 1;
      } else if (session.status === 'cancelled') {
        summary.cancelledSessions += 1;
      }
    });
    
    filteredPayments.forEach(payment => {
      if (therapistMap.has(payment.therapistId)) {
        const summary = therapistMap.get(payment.therapistId)!;
        summary.totalPayments += payment.amount;
      }
    });
    
    setTherapistSummaries(Array.from(therapistMap.values()));
    
    // Generate patient summaries
    const patientMap = new Map<string, PatientSummary>();
    
    filteredSessions.forEach(session => {
      if (!patientMap.has(session.patientId)) {
        patientMap.set(session.patientId, {
          id: session.patientId,
          name: session.patientName,
          totalSessions: 0,
          totalDuration: 0,
          totalPayments: 0
        });
      }
      
      const summary = patientMap.get(session.patientId)!;
      summary.totalSessions += 1;
      summary.totalDuration += session.duration;
    });
    
    filteredPayments.forEach(payment => {
      if (patientMap.has(payment.patientId)) {
        const summary = patientMap.get(payment.patientId)!;
        summary.totalPayments += payment.amount;
      }
    });
    
    setPatientSummaries(Array.from(patientMap.values()));
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: 'Error',
        description: 'Tidak ada data untuk diekspor',
        variant: 'destructive',
      });
      return;
    }
    
    // Convert data to CSV
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).join(','));
    const csv = [headers, ...rows].join('\n');
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours} jam ${remainingMinutes} menit`;
    }
    
    return `${remainingMinutes} menit`;
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Laporan Sesi Terapi</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <Select value={periodFilter} onValueChange={handlePeriodChange}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="yesterday">Kemarin</SelectItem>
              <SelectItem value="last-7-days">7 Hari Terakhir</SelectItem>
              <SelectItem value="last-30-days">30 Hari Terakhir</SelectItem>
              <SelectItem value="this-month">Bulan Ini</SelectItem>
              <SelectItem value="custom">Kustom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {periodFilter === 'custom' && (
          <div className="w-full md:w-1/3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy")
                    )
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="therapist">Laporan Terapis</TabsTrigger>
          <TabsTrigger value="patient">Laporan Pasien</TabsTrigger>
        </TabsList>
        
        <TabsContent value="therapist">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Kinerja Terapis</CardTitle>
                <CardDescription>
                  Ringkasan sesi terapi dan pembayaran berdasarkan terapis
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToCSV(therapistSummaries, 'laporan-terapis')}
                disabled={therapistSummaries.length === 0}
              >
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Memuat data...</div>
              ) : therapistSummaries.length === 0 ? (
                <div className="text-center py-4">Tidak ada data untuk periode yang dipilih</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Terapis</TableHead>
                        <TableHead>Total Sesi</TableHead>
                        <TableHead>Sesi Terkonfirmasi</TableHead>
                        <TableHead>Sesi Tertunda</TableHead>
                        <TableHead>Sesi Dibatalkan</TableHead>
                        <TableHead>Total Durasi</TableHead>
                        <TableHead>Total Pembayaran</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {therapistSummaries.map((summary) => (
                        <TableRow key={summary.id}>
                          <TableCell>{summary.name}</TableCell>
                          <TableCell>{summary.totalSessions}</TableCell>
                          <TableCell>{summary.confirmedSessions}</TableCell>
                          <TableCell>{summary.pendingSessions}</TableCell>
                          <TableCell>{summary.cancelledSessions}</TableCell>
                          <TableCell>{formatDuration(summary.totalDuration)}</TableCell>
                          <TableCell>{formatCurrency(summary.totalPayments)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="patient">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Aktivitas Pasien</CardTitle>
                <CardDescription>
                  Ringkasan sesi terapi dan pembayaran berdasarkan pasien
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToCSV(patientSummaries, 'laporan-pasien')}
                disabled={patientSummaries.length === 0}
              >
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Memuat data...</div>
              ) : patientSummaries.length === 0 ? (
                <div className="text-center py-4">Tidak ada data untuk periode yang dipilih</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pasien</TableHead>
                        <TableHead>Total Sesi</TableHead>
                        <TableHead>Total Durasi</TableHead>
                        <TableHead>Total Pembayaran</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patientSummaries.map((summary) => (
                        <TableRow key={summary.id}>
                          <TableCell>{summary.name}</TableCell>
                          <TableCell>{summary.totalSessions}</TableCell>
                          <TableCell>{formatDuration(summary.totalDuration)}</TableCell>
                          <TableCell>{formatCurrency(summary.totalPayments)}</TableCell>
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
    </div>
  );
};

export default TherapyReportsPage;

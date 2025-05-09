import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, isSameDay, parseISO, differenceInMinutes } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Loader2, Calendar as CalendarIcon, ArrowLeft, Download, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Attendance } from '@/types/biometric';
import { getUserAttendanceHistory } from '@/services/attendanceService';
import { getUsersList } from '@/services/biometricService';
import { UserData } from '@/contexts/AuthContext';

// Definisi tipe untuk pengguna dengan data biometrik
type UserWithBiometricData = UserData & {
  // Properti tambahan jika diperlukan
}

// Definisi tipe untuk periode laporan
type ReportPeriod = 'daily' | 'weekly' | 'monthly';

// Definisi tipe untuk data rekapitulasi
interface AttendanceSummary {
  userId: string;
  userName: string;
  date: string;
  checkIn?: Attendance;
  checkOut?: Attendance;
  workDuration?: number; // dalam menit
  status: 'hadir' | 'terlambat' | 'pulang-cepat' | 'absen' | 'tidak-lengkap';
}

const AttendanceReportPage: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State untuk data pengguna
  const [users, setUsers] = useState<UserWithBiometricData[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  
  // State untuk periode laporan
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<{from: Date, to: Date}>({
    from: new Date(),
    to: new Date()
  });
  
  // State untuk data absensi
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // State untuk pencarian
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Memuat daftar pengguna
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser || userData?.role !== 'admin') return;
      
      try {
        const usersList = await getUsersList();
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Gagal memuat daftar pengguna",
          variant: "destructive",
        });
      }
    };
    
    fetchUsers();
  }, [currentUser, userData, toast]);
  
  // Mengupdate rentang tanggal berdasarkan periode laporan
  useEffect(() => {
    if (reportPeriod === 'daily') {
      setDateRange({
        from: selectedDate,
        to: selectedDate
      });
    } else if (reportPeriod === 'weekly') {
      setDateRange({
        from: startOfWeek(selectedDate, { weekStartsOn: 1 }),
        to: endOfWeek(selectedDate, { weekStartsOn: 1 })
      });
    } else if (reportPeriod === 'monthly') {
      setDateRange({
        from: startOfMonth(selectedDate),
        to: endOfMonth(selectedDate)
      });
    }
  }, [reportPeriod, selectedDate]);
  
  // Memuat data absensi
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!currentUser || (!userData?.role && userData?.role !== 'admin')) return;
      
      try {
        setIsLoading(true);
        
        // Jika tidak ada pengguna yang dipilih atau 'all', keluar dari fungsi
        if (!selectedUserId || (selectedUserId === 'all' && users.length === 0)) {
          setIsLoading(false);
          return;
        }
        
        // Jika 'all', ambil data untuk semua pengguna
        if (selectedUserId === 'all') {
          const allAttendance: Attendance[] = [];
          
          // Ambil data untuk setiap pengguna
          for (const user of users) {
            const userAttendance = await getUserAttendanceHistory(
              user.uid,
              dateRange.from,
              dateRange.to
            );
            allAttendance.push(...userAttendance);
          }
          
          setAttendanceData(allAttendance);
        } else {
          // Ambil data untuk pengguna tertentu
          const userAttendance = await getUserAttendanceHistory(
            selectedUserId,
            dateRange.from,
            dateRange.to
          );
          setAttendanceData(userAttendance);
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        toast({
          title: "Error",
          description: "Gagal memuat data absensi",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAttendanceData();
  }, [currentUser, userData, selectedUserId, dateRange, users, toast]);
  
  // Memproses data absensi menjadi rekapitulasi
  useEffect(() => {
    const processAttendanceData = () => {
      if (attendanceData.length === 0) {
        setAttendanceSummary([]);
        return;
      }
      
      // Kelompokkan data berdasarkan userId dan tanggal
      const groupedData: Record<string, Record<string, Attendance[]>> = {};
      
      attendanceData.forEach(attendance => {
        const userId = attendance.userId;
        const date = format(parseISO(attendance.timestamp), 'yyyy-MM-dd');
        
        if (!groupedData[userId]) {
          groupedData[userId] = {};
        }
        
        if (!groupedData[userId][date]) {
          groupedData[userId][date] = [];
        }
        
        groupedData[userId][date].push(attendance);
      });
      
      // Buat rekapitulasi
      const summary: AttendanceSummary[] = [];
      
      Object.keys(groupedData).forEach(userId => {
        const userName = users.find(user => user.uid === userId)?.namaLengkap || 'Unknown User';
        
        Object.keys(groupedData[userId]).forEach(date => {
          const dayAttendance = groupedData[userId][date];
          
          // Cari check-in dan check-out
          const checkIn = dayAttendance.find(a => a.type === 'check-in' && a.status === 'valid');
          const checkOut = dayAttendance.find(a => a.type === 'check-out' && a.status === 'valid');
          
          // Hitung durasi kerja jika ada check-in dan check-out
          let workDuration: number | undefined;
          if (checkIn && checkOut) {
            workDuration = differenceInMinutes(
              parseISO(checkOut.timestamp),
              parseISO(checkIn.timestamp)
            );
          }
          
          // Tentukan status
          let status: AttendanceSummary['status'] = 'hadir';
          
          if (!checkIn && !checkOut) {
            status = 'absen';
          } else if (!checkIn || !checkOut) {
            status = 'tidak-lengkap';
          } else {
            // Asumsi: Terlambat jika check-in setelah jam 8 pagi
            const checkInTime = parseISO(checkIn.timestamp);
            const checkInHour = checkInTime.getHours();
            const checkInMinute = checkInTime.getMinutes();
            
            if (checkInHour > 8 || (checkInHour === 8 && checkInMinute > 0)) {
              status = 'terlambat';
            }
            
            // Asumsi: Pulang cepat jika check-out sebelum jam 5 sore
            const checkOutTime = parseISO(checkOut.timestamp);
            const checkOutHour = checkOutTime.getHours();
            
            if (checkOutHour < 17) {
              // Jika sudah terlambat, prioritaskan status terlambat
              if (status !== 'terlambat') {
                status = 'pulang-cepat';
              }
            }
          }
          
          summary.push({
            userId,
            userName,
            date,
            checkIn,
            checkOut,
            workDuration,
            status
          });
        });
      });
      
      // Urutkan berdasarkan tanggal dan nama
      summary.sort((a, b) => {
        // Urutkan berdasarkan tanggal (terbaru dulu)
        const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        
        // Jika tanggal sama, urutkan berdasarkan nama
        return a.userName.localeCompare(b.userName);
      });
      
      setAttendanceSummary(summary);
    };
    
    processAttendanceData();
  }, [attendanceData, users]);
  
  // Filter data berdasarkan pencarian
  const filteredSummary = attendanceSummary.filter(summary => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      summary.userName.toLowerCase().includes(searchLower) ||
      summary.date.includes(searchLower) ||
      summary.status.includes(searchLower)
    );
  });
  
  // Fungsi untuk mengekspor data ke CSV
  const exportToCSV = () => {
    if (filteredSummary.length === 0) {
      toast({
        title: "Peringatan",
        description: "Tidak ada data untuk diekspor",
        variant: "default",
      });
      return;
    }
    
    // Header CSV
    let csvContent = "Nama,Tanggal,Jam Masuk,Jam Pulang,Durasi Kerja (menit),Status\n";
    
    // Data CSV
    filteredSummary.forEach(summary => {
      const checkInTime = summary.checkIn 
        ? format(parseISO(summary.checkIn.timestamp), 'HH:mm:ss')
        : '-';
      
      const checkOutTime = summary.checkOut
        ? format(parseISO(summary.checkOut.timestamp), 'HH:mm:ss')
        : '-';
      
      const row = [
        summary.userName,
        format(new Date(summary.date), 'dd/MM/yyyy'),
        checkInTime,
        checkOutTime,
        summary.workDuration || '-',
        summary.status
      ];
      
      csvContent += row.join(',') + '\n';
    });
    
    // Buat file dan download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Kembali ke halaman attendance
  const goToAttendance = () => {
    navigate('/attendance');
  };
  
  // Render status badge
  const renderStatusBadge = (status: AttendanceSummary['status']) => {
    switch (status) {
      case 'hadir':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Hadir
          </span>
        );
      case 'terlambat':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Terlambat
          </span>
        );
      case 'pulang-cepat':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Pulang Cepat
          </span>
        );
      case 'absen':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Tidak Hadir
          </span>
        );
      case 'tidak-lengkap':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Tidak Lengkap
          </span>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rekapitulasi Absensi</h1>
        <Button variant="outline" onClick={goToAttendance}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
          <CardDescription>
            Pilih periode dan pengguna untuk melihat rekapitulasi absensi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Periode Laporan */}
            <div className="space-y-2">
              <Label htmlFor="reportPeriod">Periode Laporan</Label>
              <Select
                value={reportPeriod}
                onValueChange={(value: ReportPeriod) => setReportPeriod(value)}
              >
                <SelectTrigger id="reportPeriod">
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Harian</SelectItem>
                  <SelectItem value="weekly">Mingguan</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Pemilihan Tanggal */}
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reportPeriod === 'daily' && format(selectedDate, 'PPP', { locale: id })}
                    {reportPeriod === 'weekly' && `${format(dateRange.from, 'dd MMM', { locale: id })} - ${format(dateRange.to, 'dd MMM yyyy', { locale: id })}`}
                    {reportPeriod === 'monthly' && format(selectedDate, 'MMMM yyyy', { locale: id })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Pemilihan Pengguna */}
            <div className="space-y-2">
              <Label htmlFor="userId">Pengguna</Label>
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
              >
                <SelectTrigger id="userId">
                  <SelectValue placeholder="Pilih pengguna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Pengguna</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.uid} value={user.uid}>
                      {user.namaLengkap || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Pencarian */}
          <div className="mt-4 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan nama atau tanggal..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          Hasil Rekapitulasi
          {dateRange.from && dateRange.to && (
            <span className="ml-2 font-normal text-muted-foreground">
              {format(dateRange.from, 'dd MMM', { locale: id })} - {format(dateRange.to, 'dd MMM yyyy', { locale: id })}
            </span>
          )}
        </h2>
        <Button variant="outline" onClick={exportToCSV} disabled={filteredSummary.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Memuat data...</span>
            </div>
          ) : filteredSummary.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Tidak ada data absensi untuk periode yang dipilih
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jam Masuk</TableHead>
                  <TableHead>Jam Pulang</TableHead>
                  <TableHead>Durasi Kerja</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSummary.map((summary, index) => (
                  <TableRow key={`${summary.userId}-${summary.date}-${index}`}>
                    <TableCell className="font-medium">{summary.userName}</TableCell>
                    <TableCell>{format(new Date(summary.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      {summary.checkIn 
                        ? format(parseISO(summary.checkIn.timestamp), 'HH:mm:ss')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {summary.checkOut
                        ? format(parseISO(summary.checkOut.timestamp), 'HH:mm:ss')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {summary.workDuration
                        ? `${Math.floor(summary.workDuration / 60)}j ${summary.workDuration % 60}m`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(summary.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceReportPage;

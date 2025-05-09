import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon, Download } from 'lucide-react';
import { getUserAttendanceHistory } from '@/services/attendanceService';
import { Attendance } from '@/types/biometric';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

type RecapPeriod = 'daily' | 'weekly' | 'monthly';

const AttendanceRekapPage = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recapPeriod, setRecapPeriod] = useState<RecapPeriod>('daily');
  const [isStartDateOpen, setIsStartDateOpen] = useState<boolean>(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState<boolean>(false);

  // Fungsi untuk memuat daftar pengguna
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().displayName || doc.data().name || 'Nama tidak tersedia',
          email: doc.data().email || 'Email tidak tersedia'
        }));
        setUsers(usersList);
        
        // Jika pengguna saat ini bukan admin, pilih ID pengguna saat ini
        if (currentUser) {
          setSelectedUserId(currentUser.uid);
        } else if (usersList.length > 0) {
          setSelectedUserId(usersList[0].id);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [currentUser]);

  // Fungsi untuk mengatur rentang tanggal berdasarkan periode rekapan
  useEffect(() => {
    const today = new Date();
    
    switch (recapPeriod) {
      case 'weekly':
        setStartDate(startOfWeek(today, { weekStartsOn: 1 })); // Senin
        setEndDate(endOfWeek(today, { weekStartsOn: 1 })); // Minggu
        break;
      case 'monthly':
        setStartDate(startOfMonth(today));
        setEndDate(endOfMonth(today));
        break;
      case 'daily':
      default:
        setStartDate(today);
        setEndDate(today);
        break;
    }
  }, [recapPeriod]);

  // Fungsi untuk memuat data absensi
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!selectedUserId) return;
      
      setIsLoading(true);
      try {
        const attendanceRecords = await getUserAttendanceHistory(
          selectedUserId,
          startDate,
          endDate
        );
        setAttendanceData(attendanceRecords);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, [selectedUserId, startDate, endDate]);

  // Fungsi untuk mengekspor data ke CSV
  const exportToCSV = () => {
    if (attendanceData.length === 0) return;

    // Membuat header CSV
    let csvContent = "Tanggal,Waktu,Tipe,Status,Lokasi,Catatan\n";
    
    // Menambahkan data
    attendanceData.forEach(record => {
      const date = new Date(record.timestamp);
      const dateStr = format(date, 'dd/MM/yyyy');
      const timeStr = format(date, 'HH:mm:ss');
      const type = record.type === 'check-in' ? 'Masuk' : 'Pulang';
      const status = record.status === 'valid' ? 'Valid' : 
                    record.status === 'manual_verification' ? 'Menunggu Verifikasi' : 'Tidak Valid';
      const location = record.location?.locationName || 'Tidak tersedia';
      const notes = record.notes || '';
      
      csvContent += `"${dateStr}","${timeStr}","${type}","${status}","${location}","${notes}"\n`;
    });
    
    // Membuat dan mengunduh file CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rekap_absensi_${selectedUserId}_${format(startDate, 'yyyyMMdd')}_${format(endDate, 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fungsi untuk mendapatkan ringkasan absensi
  const getAttendanceSummary = () => {
    const checkIns = attendanceData.filter(record => record.type === 'check-in' && record.status === 'valid');
    const checkOuts = attendanceData.filter(record => record.type === 'check-out' && record.status === 'valid');
    const pendingVerification = attendanceData.filter(record => record.status === 'manual_verification');
    
    return {
      totalDays: new Set(checkIns.map(record => format(new Date(record.timestamp), 'yyyy-MM-dd'))).size,
      totalCheckIns: checkIns.length,
      totalCheckOuts: checkOuts.length,
      pendingVerification: pendingVerification.length
    };
  };

  // Mengelompokkan data absensi berdasarkan tanggal
  const groupAttendanceByDate = () => {
    const grouped = new Map<string, Attendance[]>();
    
    attendanceData.forEach(record => {
      const dateKey = format(new Date(record.timestamp), 'yyyy-MM-dd');
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)?.push(record);
    });
    
    return Array.from(grouped).map(([date, records]) => ({
      date,
      records: records.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    }));
  };

  const summary = getAttendanceSummary();
  const groupedData = groupAttendanceByDate();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Rekap Absensi</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={exportToCSV}
          disabled={attendanceData.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pilih Pengguna</CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedUserId} 
              onValueChange={setSelectedUserId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih pengguna" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Periode Rekapan</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs 
              value={recapPeriod} 
              onValueChange={(value) => setRecapPeriod(value as RecapPeriod)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="daily">Harian</TabsTrigger>
                <TabsTrigger value="weekly">Mingguan</TabsTrigger>
                <TabsTrigger value="monthly">Bulanan</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rentang Tanggal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP', { locale: id }) : 'Pilih tanggal'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        if (date) {
                          setStartDate(date);
                          setIsStartDateOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1">
                <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP', { locale: id }) : 'Pilih tanggal'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        if (date) {
                          setEndDate(date);
                          setIsEndDateOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Hari Hadir</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.totalDays}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Check-in</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.totalCheckIns}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Check-out</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.totalCheckOuts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Verifikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.pendingVerification}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Absensi</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : groupedData.length > 0 ? (
            <div className="space-y-6">
              {groupedData.map(group => (
                <div key={group.date} className="space-y-2">
                  <h3 className="font-medium">
                    {format(parseISO(group.date), 'EEEE, dd MMMM yyyy', { locale: id })}
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead>Catatan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.records.map(record => (
                        <TableRow key={record.id}>
                          <TableCell>{format(new Date(record.timestamp), 'HH:mm:ss')}</TableCell>
                          <TableCell>{record.type === 'check-in' ? 'Masuk' : 'Pulang'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              record.status === 'valid' 
                                ? 'bg-green-100 text-green-800' 
                                : record.status === 'manual_verification'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {record.status === 'valid' 
                                ? 'Valid' 
                                : record.status === 'manual_verification'
                                ? 'Menunggu Verifikasi'
                                : 'Tidak Valid'}
                            </span>
                          </TableCell>
                          <TableCell>{record.location?.locationName || 'Tidak tersedia'}</TableCell>
                          <TableCell>{record.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Tidak ada data absensi untuk periode yang dipilih
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceRekapPage;

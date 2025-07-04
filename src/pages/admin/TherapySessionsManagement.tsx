import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, getDocs, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { TherapySession } from '@/types/therapySession';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TherapySessionsManagement = () => {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TherapySession | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    fetchTherapySessions();
  }, [selectedDate, filterStatus]);

  const fetchTherapySessions = async () => {
    setLoading(true);
    try {
      let q;
      
      if (selectedDate) {
        // Format the date as YYYY-MM-DD
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        
        if (filterStatus !== 'all') {
          // Filter by both date and status
          q = query(
            collection(db, 'therapySessions'),
            where('date', '==', formattedDate),
            where('status', '==', filterStatus)
          );
        } else {
          // Filter by date only
          q = query(
            collection(db, 'therapySessions'),
            where('date', '==', formattedDate)
          );
        }
      } else if (filterStatus !== 'all') {
        // Filter by status only
        q = query(
          collection(db, 'therapySessions'),
          where('status', '==', filterStatus)
        );
      } else {
        // No filters
        q = query(collection(db, 'therapySessions'));
      }
      
      const sessionsSnapshot = await getDocs(q);
      const sessionsData = sessionsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data as object
        } as TherapySession;
      });
      
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error fetching therapy sessions:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengambil data sesi terapi. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSession = async (session: TherapySession) => {
    if (!userData) return;
    
    try {
      const sessionRef = doc(db, 'therapySessions', session.id);
      await updateDoc(sessionRef, {
        status: 'confirmed',
        statusDiupdate: {
          nama: userData.namaLengkap,
          userId: userData.uid,
          timestamp: new Date().toISOString()
        }
      });
      
      toast({
        title: 'Sukses',
        description: 'Status sesi terapi berhasil diperbarui',
      });
      
      // Refresh sessions list
      await fetchTherapySessions();
    } catch (error) {
      console.error('Error confirming therapy session:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui status sesi terapi. Silakan coba lagi.',
        variant: 'destructive',
      });
    }
  };

  const handleCancelSession = async (session: TherapySession) => {
    if (!userData) return;
    
    try {
      const sessionRef = doc(db, 'therapySessions', session.id);
      await updateDoc(sessionRef, {
        status: 'cancelled',
        statusDiupdate: {
          nama: userData.namaLengkap,
          userId: userData.uid,
          timestamp: new Date().toISOString()
        }
      });
      
      toast({
        title: 'Sukses',
        description: 'Status sesi terapi berhasil diperbarui',
      });
      
      // Refresh sessions list
      await fetchTherapySessions();
    } catch (error) {
      console.error('Error cancelling therapy session:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui status sesi terapi. Silakan coba lagi.',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = (session: TherapySession) => {
    setSelectedSession(session);
    setDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Menunggu Konfirmasi</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Dikonfirmasi</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredSessions = filterStatus === 'all' 
    ? sessions 
    : sessions.filter(session => session.status === filterStatus);

  const handleStatusChange = async (session: TherapySession, newStatus: string) => {
    if (!userData) return;
    
    try {
      const sessionRef = doc(db, 'therapySessions', session.id);
      await updateDoc(sessionRef, {
        status: newStatus,
        statusDiupdate: {
          nama: userData.namaLengkap,
          userId: userData.uid,
          timestamp: new Date().toISOString()
        }
      });
      
      toast({
        title: 'Sukses',
        description: 'Status sesi terapi berhasil diperbarui',
      });
      
      // Refresh sessions list
      await fetchTherapySessions();
    } catch (error) {
      console.error('Error updating therapy session status:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui status sesi terapi. Silakan coba lagi.',
        variant: 'destructive',
      });
    }
  };

  const clearFilters = () => {
    setSelectedDate(undefined);
    setFilterStatus('all');
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Sesi Terapi</CardTitle>
          <CardDescription>
            Konfirmasi atau batalkan sesi terapi yang telah dicatat oleh terapis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
            <div className="flex-1 min-w-[250px]">
              <div className="flex flex-col">
                <Label className="mb-2">Filter Tanggal</Label>
                <div className="flex gap-2 items-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Pilih Tanggal'}
                  </Button>
                  {selectedDate && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedDate(undefined)}
                    >
                      ×
                    </Button>
                  )}
                </div>
                {showCalendar && (
                  <div className="absolute z-50 bg-white rounded-md shadow-md border mt-1">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setShowCalendar(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-[180px]">
              <Label className="mb-2 block">Filter Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu Konfirmasi</SelectItem>
                  <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="mb-0"
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Memuat data...</div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-4">Belum ada sesi terapi yang dicatat</div>
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
                    <TableHead>Status</TableHead>
                    <TableHead>Ubah Status</TableHead>
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
                      <TableCell>{getStatusBadge(session.status)}</TableCell>
                      <TableCell>
                        <Select
                          value={session.status}
                          onValueChange={(value) => handleStatusChange(session, value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Pilih Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Menunggu Konfirmasi</SelectItem>
                            <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                            <SelectItem value="cancelled">Dibatalkan</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewDetails(session)}
                          >
                            Detail
                          </Button>
                          {session.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-green-100 hover:bg-green-200 text-green-800"
                                onClick={() => handleConfirmSession(session)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Konfirmasi
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-red-100 hover:bg-red-200 text-red-800"
                                onClick={() => handleCancelSession(session)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Batalkan
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detail Sesi Terapi</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang sesi terapi
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
                <Label className="text-right">Tanggal</Label>
                <div className="col-span-3">{selectedSession.date}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Waktu</Label>
                <div className="col-span-3">{selectedSession.time}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Durasi</Label>
                <div className="col-span-3">{selectedSession.duration} menit</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <div className="col-span-3">{getStatusBadge(selectedSession.status)}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Paket</Label>
                <div className="col-span-3">
                  {selectedSession.isPackage ? `Ya (Sesi ke-${selectedSession.packageIndex})` : 'Tidak'}
                </div>
              </div>
              {selectedSession.notes && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Catatan</Label>
                  <div className="col-span-3">{selectedSession.notes}</div>
                </div>
              )}
              {selectedSession.statusDiupdate && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Diperbarui oleh</Label>
                  <div className="col-span-3">
                    {selectedSession.statusDiupdate.nama} pada{' '}
                    {new Date(selectedSession.statusDiupdate.timestamp).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Tutup
            </Button>
            {selectedSession && selectedSession.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  className="bg-green-100 hover:bg-green-200 text-green-800"
                  onClick={() => {
                    handleConfirmSession(selectedSession);
                    setDialogOpen(false);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Konfirmasi
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-red-100 hover:bg-red-200 text-red-800"
                  onClick={() => {
                    handleCancelSession(selectedSession);
                    setDialogOpen(false);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Batalkan
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TherapySessionsManagement;

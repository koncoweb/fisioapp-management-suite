import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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

  useEffect(() => {
    fetchTherapySessions();
  }, []);

  const fetchTherapySessions = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'therapySessions'));
      const sessionsSnapshot = await getDocs(q);
      const sessionsData = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TherapySession[];
      
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

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Manajemen Sesi Terapi</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Sesi Terapi</CardTitle>
          <CardDescription>
            Konfirmasi atau batalkan sesi terapi yang telah dicatat oleh terapis
          </CardDescription>
          <div className="mt-2 w-full md:w-1/3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter berdasarkan status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu Konfirmasi</SelectItem>
                <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
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

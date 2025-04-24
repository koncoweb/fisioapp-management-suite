
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import type { BookingSession } from '@/types';

interface BookingsTableProps {
  bookings: BookingSession[];
  date: string;
  isAdmin: boolean;
}

const BookingsTable = ({ bookings, date, isAdmin }: BookingsTableProps) => {
  const { toast } = useToast();

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const bookingRef = doc(db, 'therapySessions', bookingId);
      await updateDoc(bookingRef, {
        status: newStatus
      });

      toast({
        title: "Status Updated",
        description: "Therapy session status has been updated successfully.",
      });

      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update therapy session status.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sesi Hari Ini</CardTitle>
        <CardDescription>
          {isAdmin 
            ? "Semua sesi terapi terjadwal hari ini" 
            : "Sesi terapi Anda yang terjadwal hari ini"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>
            {bookings.length === 0 
              ? "Tidak ada sesi terjadwal hari ini" 
              : `Menampilkan ${bookings.length} sesi untuk ${date}`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Klien</TableHead>
              <TableHead>Layanan</TableHead>
              {isAdmin && <TableHead>Terapis</TableHead>}
              <TableHead>Status</TableHead>
              {(isAdmin || !isAdmin) && <TableHead>Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-6">
                  Tidak ada jadwal untuk hari ini
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    {booking.startTime} - {booking.endTime}
                  </TableCell>
                  <TableCell>{booking.clientName}</TableCell>
                  <TableCell>{booking.serviceName}</TableCell>
                  {isAdmin && <TableCell>{booking.therapistName}</TableCell>}
                  <TableCell>
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${getStatusBadgeClass(booking.status)}`}
                    >
                      {booking.status === 'completed' ? 'Selesai' :
                       booking.status === 'cancelled' ? 'Dibatalkan' :
                       booking.status === 'scheduled' ? 'Dijadwalkan' : 
                       'Menunggu'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {(isAdmin || (!isAdmin && booking.status === 'scheduled')) && (
                      <div className="space-x-2">
                        {booking.status === 'scheduled' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(booking.id, 'scheduled')}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Konfirmasi
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                              className="text-red-600 hover:text-red-700"
                            >
                              Tolak
                            </Button>
                          </>
                        )}
                        {booking.status === 'scheduled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(booking.id, 'completed')}
                            className="text-green-600 hover:text-green-700"
                          >
                            Selesai
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BookingsTable;

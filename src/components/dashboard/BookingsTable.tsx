
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
import type { BookingSession } from '@/types';

interface BookingsTableProps {
  bookings: BookingSession[];
  date: string;
  isAdmin: boolean;
}

const BookingsTable = ({ bookings, date, isAdmin }: BookingsTableProps) => {
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-6">
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
                      ${booking.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                        'bg-blue-100 text-blue-800'}`}
                    >
                      {booking.status === 'completed' ? 'Selesai' :
                       booking.status === 'cancelled' ? 'Dibatalkan' : 
                       'Terjadwal'}
                    </div>
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


import React from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, CalendarCheck, Clock, User } from 'lucide-react';

interface BookingSummaryProps {
  booking: {
    patientName: string;
    therapistName: string;
    serviceName: string;
    servicePrice: number;
    serviceDuration: number;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
  };
  onConfirm: () => void;
  onBack: () => void;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ booking, onConfirm, onBack }) => {
  // Format the date
  const formattedDate = format(new Date(booking.date), 'EEEE, dd MMMM yyyy', { locale: id });

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Konfirmasi Jadwal Terapi</h1>
      
      <Card>
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-center">Ringkasan Jadwal Terapi</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <CalendarCheck className="mr-3 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Tanggal & Waktu</p>
                <p className="font-medium">{formattedDate}</p>
                <p className="font-medium">{booking.startTime} - {booking.endTime}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Clock className="mr-3 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Jenis Terapi</p>
                <p className="font-medium">{booking.serviceName}</p>
                <p className="text-sm">Durasi: {booking.serviceDuration} menit</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <User className="mr-3 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Terapis</p>
                <p className="font-medium">{booking.therapistName}</p>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-6">
              <p className="text-sm text-muted-foreground">Biaya Terapi</p>
              <p className="text-xl font-semibold">Rp {booking.servicePrice.toLocaleString('id-ID')}</p>
              <p className="text-xs text-muted-foreground mt-1">Pembayaran dilakukan di klinik</p>
            </div>
            
            {booking.notes && (
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground">Catatan</p>
                <p className="text-sm">{booking.notes}</p>
              </div>
            )}

            <div className="bg-green-50 p-4 rounded-md mt-6">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-green-800 font-medium">Status: Menunggu Konfirmasi</p>
                  <p className="text-sm text-green-700">
                    Jadwal akan dikonfirmasi oleh klinik. Anda akan menerima notifikasi setelah dikonfirmasi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Kembali
          </Button>
          <Button onClick={onConfirm}>
            Konfirmasi Jadwal
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BookingSummary;

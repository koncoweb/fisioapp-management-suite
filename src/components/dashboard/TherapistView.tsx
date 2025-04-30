
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TherapySessionForm from '@/components/therapy/TherapySessionForm';
import BookingsTable from './BookingsTable';
import { DashboardStats } from './StatsCards';
import type { BookingSession } from '@/types';

interface TherapistViewProps {
  todayBookings: BookingSession[];
  today: string;
}

const TherapistView = ({ todayBookings, today }: TherapistViewProps) => {
  const navigate = useNavigate();
  
  // Filter for unconfirmed sessions to display in the table
  const unconfirmedBookings = todayBookings.filter(
    booking => booking.status === 'scheduled' || !booking.status
  );
  
  return (
    <Tabs defaultValue="sessions" className="w-full">
      <TabsList>
        <TabsTrigger value="sessions">Sesi Hari Ini</TabsTrigger>
        <TabsTrigger value="results">Hasil Sesi</TabsTrigger>
      </TabsList>
      <TabsContent value="sessions">
        <DashboardStats 
          todayBookings={todayBookings.length}
          isAdmin={false}
        />
        <div className="mt-6">
          <BookingsTable
            bookings={unconfirmedBookings}
            date={today}
            isAdmin={false}
          />
        </div>
      </TabsContent>
      <TabsContent value="results">
        <Card>
          <CardHeader>
            <CardTitle>Catat Sesi Terapi</CardTitle>
            <CardDescription>
              Masukkan detail dan hasil sesi terapi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TherapySessionForm />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default TherapistView;

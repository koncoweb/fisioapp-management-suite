
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TherapySessionsTable from '@/components/therapy/TherapySessionsTable';
import TherapySessionFilters from '@/components/therapy/TherapySessionFilters';
import { useTherapySessions } from '@/hooks/use-therapy-sessions';
import { useSessionStatus } from '@/hooks/use-session-status';
import { TherapySession } from '@/types/booking';

const BookingManagement = () => {
  const { userData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const { data: sessions, isLoading } = useTherapySessions();
  const { updateSessionStatus } = useSessionStatus();

  // Filter sessions based on search inputs
  const filteredSessions = sessions?.filter(session => {
    const matchesSearch = searchQuery === '' || 
      session.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.therapistName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = searchDate === '' || session.date === searchDate;
    
    return matchesSearch && matchesDate;
  });

  const handleStatusUpdate = async (sessionId: string, newStatus: 'confirmed' | 'cancelled') => {
    await updateSessionStatus(sessionId, newStatus, userData);
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Therapy Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <TherapySessionFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchDate={searchDate}
            setSearchDate={setSearchDate}
          />
          
          <TherapySessionsTable 
            sessions={filteredSessions} 
            isLoading={isLoading} 
            onUpdateStatus={handleStatusUpdate} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingManagement;

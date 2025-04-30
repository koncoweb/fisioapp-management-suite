
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, getDocs, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import TherapySessionsTable from '@/components/therapy/TherapySessionsTable';
import { TherapySession } from '@/types/booking';

const BookingManagement = () => {
  const { toast } = useToast();
  const { userData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState('');

  const { data: sessions, isLoading, refetch } = useQuery({
    queryKey: ['therapySessions'],
    queryFn: async () => {
      const sessionsQuery = query(collection(db, 'therapySessions'));
      const snapshot = await getDocs(sessionsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TherapySession[];
    }
  });

  const handleStatusUpdate = async (sessionId: string, newStatus: 'confirmed' | 'cancelled') => {
    if (!userData) {
      toast({
        title: "Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }

    try {
      const sessionRef = doc(db, 'therapySessions', sessionId);
      await updateDoc(sessionRef, {
        status: newStatus,
        statusDiupdate: {
          nama: userData.namaLengkap,
          userId: userData.uid,
          timestamp: new Date().toISOString()
        }
      });
      
      await refetch();
      
      toast({
        title: "Status Updated",
        description: `Session has been ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating session:', error);
      toast({
        title: "Error",
        description: "Failed to update session status",
        variant: "destructive",
      });
    }
  };

  // Filter sessions based on search inputs
  const filteredSessions = sessions?.filter(session => {
    const matchesSearch = searchQuery === '' || 
      session.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.therapistName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = searchDate === '' || session.date === searchDate;
    
    return matchesSearch && matchesDate;
  });

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Therapy Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient or therapist name..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-auto">
              <Input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
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

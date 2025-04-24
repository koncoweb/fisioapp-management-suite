
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { TherapySession } from '@/types/booking';

const BookingManagement = () => {
  const { toast } = useToast();

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
    try {
      const sessionRef = doc(db, 'therapySessions', sessionId);
      await updateDoc(sessionRef, {
        status: newStatus
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Therapy Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions?.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{session.patientName}</TableCell>
                  <TableCell>{session.serviceName}</TableCell>
                  <TableCell>{session.date}</TableCell>
                  <TableCell>{session.startTime}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${session.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      session.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}`
                    }>
                      {session.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {session.status === 'pending' && (
                      <div className="space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusUpdate(session.id, 'confirmed')}
                          className="text-green-600 hover:text-green-700"
                        >
                          Confirm
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(session.id, 'cancelled')}
                          className="text-red-600 hover:text-red-700"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingManagement;

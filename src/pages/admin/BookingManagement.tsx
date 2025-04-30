
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, getDocs, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
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
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

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

  if (isLoading) {
    return <div className="container mx-auto py-6 flex items-center justify-center">Loading sessions...</div>;
  }

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
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Therapist</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions && filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.patientName}</TableCell>
                      <TableCell>{session.therapistName}</TableCell>
                      <TableCell>{session.serviceName}</TableCell>
                      <TableCell>{session.date}</TableCell>
                      <TableCell>{session.time}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${session.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                          session.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'}`
                        }>
                          {session.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {session.statusDiupdate ? (
                          <div className="text-sm">
                            <p>{session.statusDiupdate.nama}</p>
                            <p className="text-gray-500 text-xs">
                              {new Date(session.statusDiupdate.timestamp).toLocaleString()}
                            </p>
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        {session.status !== 'cancelled' && session.status !== 'completed' && (
                          <div className="space-x-2">
                            {session.status !== 'scheduled' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusUpdate(session.id, 'confirmed')}
                                className="text-green-600 hover:text-green-700"
                              >
                                Confirm
                              </Button>
                            )}
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(session.id, 'cancelled')}
                              className="text-red-600 hover:text-red-700"
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No therapy sessions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingManagement;

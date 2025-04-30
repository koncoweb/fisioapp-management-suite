
import React from 'react';
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

interface TherapySessionsTableProps {
  sessions: TherapySession[] | undefined;
  isLoading: boolean;
  onUpdateStatus: (sessionId: string, newStatus: 'confirmed' | 'cancelled') => Promise<void>;
}

const TherapySessionsTable: React.FC<TherapySessionsTableProps> = ({
  sessions,
  isLoading,
  onUpdateStatus
}) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading sessions...</div>;
  }

  return (
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
          {sessions && sessions.length > 0 ? (
            sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell className="font-medium">{session.patientName}</TableCell>
                <TableCell>{session.therapistName}</TableCell>
                <TableCell>{session.serviceName}</TableCell>
                <TableCell>{session.date}</TableCell>
                <TableCell>{session.time || (session.startTime && `${session.startTime} - ${session.endTime}`)}</TableCell>
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
                      {session.status !== 'confirmed' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onUpdateStatus(session.id, 'confirmed')}
                          className="text-green-600 hover:text-green-700"
                        >
                          Confirm
                        </Button>
                      )}
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateStatus(session.id, 'cancelled')}
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
  );
};

export default TherapySessionsTable;

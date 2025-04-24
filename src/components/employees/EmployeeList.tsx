
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserData } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const EmployeeList = () => {
  const [employees, setEmployees] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('role', 'in', ['admin', 'therapist'])
        );
        
        const querySnapshot = await getDocs(q);
        const employeesData = querySnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as UserData[];
        
        setEmployees(employeesData);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.uid}>
              <TableCell>{employee.namaLengkap}</TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>
                <Badge variant={employee.role === 'admin' ? 'default' : 'secondary'}>
                  {employee.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">Active</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {employees.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          No employees found
        </div>
      )}
    </div>
  );
};

export default EmployeeList;

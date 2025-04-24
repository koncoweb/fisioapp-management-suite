
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import EmployeeList from '@/components/employees/EmployeeList';

const EmployeeManagement = () => {
  return (
    <div className="container mx-auto px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Employee Management</CardTitle>
          <CardDescription>
            Manage your clinic staff and therapists
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeList />
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeManagement;

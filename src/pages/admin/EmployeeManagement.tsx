
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import EmployeeList from '@/components/employees/EmployeeList';
import EmployeeForm from '@/components/employees/EmployeeForm';

const EmployeeManagement = () => {
  const [showNewEmployeeForm, setShowNewEmployeeForm] = useState(false);

  return (
    <div className="container mx-auto px-4">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Employee Management</CardTitle>
            <CardDescription>
              Manage your clinic staff and therapists
            </CardDescription>
          </div>
          <Button onClick={() => setShowNewEmployeeForm(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            New Employee
          </Button>
        </CardHeader>
        <CardContent>
          <EmployeeList />
        </CardContent>
      </Card>

      <EmployeeForm 
        isOpen={showNewEmployeeForm}
        onClose={() => setShowNewEmployeeForm(false)}
      />
    </div>
  );
};

export default EmployeeManagement;

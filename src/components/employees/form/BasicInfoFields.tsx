
import React from 'react';
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormData } from '../EmployeeForm';
import { FullNameField } from './fields/FullNameField';
import { EmailField } from './fields/EmailField';
import { RoleField } from './fields/RoleField';

interface BasicInfoFieldsProps {
  form: UseFormReturn<EmployeeFormData>;
  isExistingEmployee: boolean;
}

export const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ form, isExistingEmployee }) => {
  return (
    <>
      <FullNameField form={form} />
      <EmailField form={form} isExistingEmployee={isExistingEmployee} />
      <RoleField form={form} />
    </>
  );
};

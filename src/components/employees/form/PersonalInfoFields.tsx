
import React from 'react';
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormData } from '../EmployeeForm';
import { AddressField } from './fields/AddressField';
import { GenderField } from './fields/GenderField';
import { AgeField } from './fields/AgeField';

interface PersonalInfoFieldsProps {
  form: UseFormReturn<EmployeeFormData>;
}

export const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({ form }) => {
  return (
    <>
      <AddressField form={form} />
      <GenderField form={form} />
      <AgeField form={form} />
    </>
  );
};

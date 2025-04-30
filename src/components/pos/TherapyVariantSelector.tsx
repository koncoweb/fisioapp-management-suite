
import React, { useState } from 'react';
import { Product } from '@/types/product';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppointmentSlot } from '@/pages/admin/PointOfSale';
import TherapyOptions from './therapy/TherapyOptions';
import AppointmentList from './therapy/AppointmentList';
import AppointmentDialog from './therapy/AppointmentDialog';
import ConfirmationDialog from './therapy/ConfirmationDialog';
import { generateTimeSlots } from './therapy/timeUtils';

interface TherapyVariantSelectorProps {
  product: Product | null;
  onSelectVariant: (product: Product, isPackage: boolean, appointments: AppointmentSlot[]) => void;
  onCancel: () => void;
}

const timeSlots = generateTimeSlots();

const TherapyVariantSelector: React.FC<TherapyVariantSelectorProps> = ({
  product,
  onSelectVariant,
  onCancel
}) => {
  const [selectedOption, setSelectedOption] = useState<'visit' | 'package'>('visit');
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentSlot[]>([]);
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [tempDate, setTempDate] = useState<Date | undefined>(undefined);
  const [tempTime, setTempTime] = useState<string | undefined>(undefined);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  if (!product) {
    return null;
  }

  // Number of slots needed based on selected option
  const requiredSlots = selectedOption === 'package' ? 4 : 1;

  const handleOpenDateDialog = () => {
    // Reset temporary values
    setTempDate(undefined);
    setTempTime(undefined);
    setIsDateDialogOpen(true);
  };

  const handleAddAppointment = () => {
    if (tempDate && tempTime) {
      // Create a new appointment slot
      const newAppointment: AppointmentSlot = { date: tempDate, time: tempTime };
      
      // If we're editing an existing slot
      if (currentSlotIndex < appointments.length) {
        const updatedAppointments = [...appointments];
        updatedAppointments[currentSlotIndex] = newAppointment;
        setAppointments(updatedAppointments);
      } else {
        // Add new slot
        setAppointments([...appointments, newAppointment]);
      }
      
      // Close dialog and reset temp values
      setIsDateDialogOpen(false);
      setTempDate(undefined);
      setTempTime(undefined);
      
      // If we still need more slots and we're in package mode, open dialog for the next slot
      if (appointments.length + 1 < requiredSlots) {
        setCurrentSlotIndex(appointments.length + 1);
        setTimeout(() => {
          setIsDateDialogOpen(true);
        }, 300);
      }
    }
  };

  const handleEditAppointment = (index: number) => {
    setCurrentSlotIndex(index);
    setTempDate(appointments[index].date);
    setTempTime(appointments[index].time);
    setIsDateDialogOpen(true);
  };

  const handleRemoveAppointment = (index: number) => {
    const updatedAppointments = appointments.filter((_, i) => i !== index);
    setAppointments(updatedAppointments);
  };

  const handleSelectVariant = () => {
    if (appointments.length === requiredSlots) {
      onSelectVariant(product, selectedOption === 'package', appointments);
    }
  };

  const handleOptionChange = (value: 'visit' | 'package') => {
    if (appointments.length > 0 && value !== selectedOption) {
      // Open confirmation dialog if changing from one option to another with existing appointments
      setConfirmDialogOpen(true);
      return;
    }
    
    setSelectedOption(value);
    // Clear appointments when changing options
    setAppointments([]);
  };

  const confirmOptionChange = () => {
    setAppointments([]);
    setSelectedOption(selectedOption === 'visit' ? 'package' : 'visit');
    setConfirmDialogOpen(false);
  };

  const isFormValid = appointments.length === requiredSlots;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="w-full glass-card shadow-md">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs">Choose Therapy Variant</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="mb-1.5">
            <p className="text-[10px] font-medium mb-0.5">Selected Therapy:</p>
            <p className="text-xs font-semibold">{product.name}</p>
          </div>

          <TherapyOptions 
            product={product}
            selectedOption={selectedOption}
            onOptionChange={handleOptionChange}
          />
          
          <div className="mt-2 space-y-2 border-t pt-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium">Schedule Appointment:</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleOpenDateDialog}
                className="h-6 px-2 text-[9px]"
              >
                <Calendar className="h-2.5 w-2.5 mr-1" />
                {selectedOption === 'visit' ? 'Pick Date & Time' : `Add Appointment ${appointments.length}/${requiredSlots}`}
              </Button>
            </div>
            
            {/* Display selected appointments */}
            <AppointmentList
              appointments={appointments}
              selectedOption={selectedOption}
              onEditAppointment={handleEditAppointment}
              onRemoveAppointment={handleRemoveAppointment}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-muted/30 p-1.5">
          <Button variant="outline" size="sm" className="text-[10px] h-6 px-2" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="text-[10px] h-6 px-2" 
            onClick={handleSelectVariant}
            disabled={!isFormValid}
          >
            Add to Cart
          </Button>
        </CardFooter>
      </Card>

      {/* Date & Time Dialog */}
      <AppointmentDialog
        isOpen={isDateDialogOpen}
        onOpenChange={(open) => {
          if (!open) setIsDateDialogOpen(false);
        }}
        selectedOption={selectedOption}
        currentSlotIndex={currentSlotIndex}
        tempDate={tempDate}
        setTempDate={setTempDate}
        tempTime={tempTime}
        setTempTime={setTempTime}
        onAddAppointment={handleAddAppointment}
        timeSlots={timeSlots}
        appointments={appointments}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        selectedOption={selectedOption}
        onConfirm={confirmOptionChange}
      />
    </motion.div>
  );
};

export default TherapyVariantSelector;

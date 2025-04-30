
import React, { useState } from 'react';
import { Product } from '@/types/product';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Clock, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";

interface AppointmentSlot {
  date: Date;
  time: string;
}

interface TherapyVariantSelectorProps {
  product: Product | null;
  onSelectVariant: (product: Product, isPackage: boolean, appointments: AppointmentSlot[]) => void;
  onCancel: () => void;
}

// Generate time slots from 8:00 to 18:00 with 30-minute intervals
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute of [0, 30]) {
      // Skip 18:30 as the last appointment should be at 18:00
      if (hour === 18 && minute === 30) continue;
      
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      slots.push(`${hourStr}:${minuteStr}`);
    }
  }
  return slots;
};

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

  const packagePrice = (product.price * 4) - 200000;
  
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

  // Disable past dates and today if it's after 5 PM
  const disabledDates = (currentDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If it's after 5 PM, disable today as well
    if (new Date().getHours() >= 17) {
      today.setDate(today.getDate() + 1);
    }
    
    return currentDate < today;
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

          <RadioGroup
            value={selectedOption}
            onValueChange={(value) => handleOptionChange(value as 'visit' | 'package')}
            className="space-y-1.5"
          >
            <label className="flex items-start space-x-2 space-y-0 rounded-md border p-1.5 cursor-pointer hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="visit" id="visit" />
              <div className="flex flex-1 items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <Calendar className="h-2.5 w-2.5 mr-1 text-primary" />
                    <p className="text-[10px] font-medium">Single Visit</p>
                  </div>
                  <p className="text-[9px] text-muted-foreground">One-time therapy session</p>
                </div>
                <div className="text-[10px] font-semibold">
                  Rp {product.price.toLocaleString('id-ID')}
                </div>
              </div>
            </label>
            
            <label className="flex items-start space-x-2 space-y-0 rounded-md border p-1.5 cursor-pointer hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="package" id="package" />
              <div className="flex flex-1 items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <Package className="h-2.5 w-2.5 mr-1 text-accent" />
                    <p className="text-[10px] font-medium">Package (4 Visits)</p>
                  </div>
                  <p className="text-[9px] text-muted-foreground">Save Rp 200,000</p>
                </div>
                <div className="text-[10px] font-semibold">
                  Rp {packagePrice.toLocaleString('id-ID')}
                </div>
              </div>
            </label>
          </RadioGroup>
          
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
            {appointments.length > 0 && (
              <div className="space-y-1 mt-1">
                {appointments.map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between bg-secondary/10 rounded-md p-1.5 text-[9px]">
                    <div>
                      <span className="font-medium mr-1">
                        {selectedOption === 'package' ? `Visit ${index + 1}:` : 'Appointment:'}
                      </span>
                      {format(appointment.date, "dd MMM yyyy")} at {appointment.time}
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleEditAppointment(index)}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleRemoveAppointment(index)}
                        className="text-destructive hover:text-destructive/80 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
      <Dialog open={isDateDialogOpen} onOpenChange={(open) => {
        if (!open) setIsDateDialogOpen(false);
      }}>
        <DialogContent className="sm:max-w-[350px] p-3">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-center text-sm">
              {selectedOption === 'package' 
                ? `Select Date & Time for Visit ${currentSlotIndex + 1}` 
                : 'Select Date & Time'
              }
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 py-2">
            {/* Calendar */}
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">Date:</p>
              <div className="border rounded-md">
                <CalendarComponent
                  mode="single"
                  selected={tempDate}
                  onSelect={setTempDate}
                  disabled={disabledDates}
                  initialFocus
                  className="p-2 pointer-events-auto"
                />
              </div>
            </div>
            
            {/* Time Selection */}
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">Time:</p>
              <Select value={tempTime} onValueChange={setTempTime}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <Clock className="h-3 w-3 mr-1.5" />
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot} className="text-xs">
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="pt-2">
            <Button 
              className="w-full h-7 text-xs" 
              disabled={!tempDate || !tempTime}
              onClick={handleAddAppointment}
            >
              {currentSlotIndex < appointments.length ? 'Update Appointment' : 'Add Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent className="p-3">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">Change appointment type?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Changing from {selectedOption === 'visit' ? 'single visit' : 'package'} to {selectedOption === 'visit' ? 'package' : 'single visit'} will remove your current appointment selection(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel className="text-xs h-7">Cancel</AlertDialogCancel>
            <AlertDialogAction className="text-xs h-7" onClick={confirmOptionChange}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default TherapyVariantSelector;

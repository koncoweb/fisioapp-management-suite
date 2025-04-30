
import React, { useState } from 'react';
import { Product } from '@/types/product';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppointmentSlot } from '@/types/pos';
import AppointmentDialog from './therapy/AppointmentDialog';
import TherapyOptions from './therapy/TherapyOptions';
import ConfirmationDialog from './therapy/ConfirmationDialog';
import AppointmentList from './therapy/AppointmentList';
import TherapistSelector from './therapy/TherapistSelector';
import { Employee } from '@/types';
import { toast } from 'sonner';

interface TherapyVariantSelectorProps {
  product: Product;
  onSelectVariant: (product: Product, isPackage: boolean, appointments: AppointmentSlot[], therapist: Employee) => void;
  onCancel: () => void;
}

const TherapyVariantSelector: React.FC<TherapyVariantSelectorProps> = ({ product, onSelectVariant, onCancel }) => {
  const [isPackage, setIsPackage] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentSlot[]>([]);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [selectedTherapist, setSelectedTherapist] = useState<Employee | null>(null);

  const handleAppointmentConfirm = (selectedAppointments: AppointmentSlot[]) => {
    setAppointments(selectedAppointments);
    setAppointmentDialogOpen(false);
    
    // Open confirmation dialog only when switching between visit/package types
    if (confirmationDialogOpen) {
      setConfirmationDialogOpen(false);
      
      if (selectedTherapist) {
        onSelectVariant(product, isPackage, selectedAppointments, selectedTherapist);
      } else {
        toast.error("Please select a therapist");
      }
    }
  };

  const handleConfirmation = (confirmed: boolean) => {
    setConfirmationDialogOpen(false);
    if (confirmed) {
      // If confirmed, clear appointments and show appointment dialog for the new selection type
      setAppointments([]);
      setCurrentSlotIndex(0);
      setAppointmentDialogOpen(true);
    }
  };

  const handleSelectVariant = () => {
    if (!selectedTherapist) {
      toast.error("Please select a therapist first");
      return;
    }
    
    // For both package and single visit, ensure appointments are selected
    if (appointments.length > 0) {
      onSelectVariant(product, isPackage, appointments, selectedTherapist);
    } else {
      // Open the appointment dialog if no appointments are set
      setAppointmentDialogOpen(true);
    }
  };

  const handleEditAppointment = (index: number) => {
    setCurrentSlotIndex(index);
    setAppointmentDialogOpen(true);
  };

  const handleRemoveAppointment = (index: number) => {
    setAppointments(prevAppointments => 
      prevAppointments.filter((_, i) => i !== index)
    );
  };

  const handlePackageToggle = (newIsPackage: boolean) => {
    // If the user already has appointments and is changing the type, show confirmation
    if (appointments.length > 0 && isPackage !== newIsPackage) {
      setIsPackage(newIsPackage);
      setConfirmationDialogOpen(true);
    } else {
      setIsPackage(newIsPackage);
    }
  };

  const handleTherapistSelect = (therapist: Employee) => {
    setSelectedTherapist(therapist);
  };

  return (
    <>
      <Card className="w-full glass-card">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">{product.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {product.description || `${product.name} - ${product.type}`}
          </p>

          {/* Therapist selector */}
          <TherapistSelector 
            selectedTherapist={selectedTherapist}
            onTherapistSelect={handleTherapistSelect}
          />

          <TherapyOptions 
            isPackage={isPackage} 
            setIsPackage={handlePackageToggle}
            product={product}
          />

          {isPackage ? (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Pilih paket untuk 4 kali kunjungan dengan harga lebih hemat.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full h-8 text-xs"
                onClick={() => setAppointmentDialogOpen(true)}
              >
                {appointments.length === 0 
                  ? "Pilih Jadwal 4 Kunjungan" 
                  : `Edit Jadwal (${appointments.length}/4 dipilih)`}
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full h-8 text-xs mt-4"
              onClick={() => setAppointmentDialogOpen(true)}
            >
              Pilih Jadwal Kunjungan
            </Button>
          )}
          
          {appointments.length > 0 && (
            <AppointmentList 
              appointments={appointments} 
              selectedOption={isPackage ? 'package' : 'visit'}
              onEditAppointment={handleEditAppointment}
              onRemoveAppointment={handleRemoveAppointment}
            />
          )}

          <div className="flex justify-between mt-4">
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              size="sm" 
              className="h-8 text-xs" 
              onClick={handleSelectVariant}
              disabled={
                !selectedTherapist || 
                appointments.length === 0 || 
                (isPackage && appointments.length < 4)
              }
            >
              Add to Cart
            </Button>
          </div>
        </CardContent>
      </Card>

      <AppointmentDialog
        isOpen={appointmentDialogOpen}
        onClose={() => setAppointmentDialogOpen(false)}
        onConfirm={handleAppointmentConfirm}
        selectedOption={isPackage ? 'package' : 'visit'}
        currentSlotIndex={currentSlotIndex}
        appointments={appointments}
        maxAppointments={isPackage ? 4 : 1}
        therapistId={selectedTherapist?.id}
      />

      <ConfirmationDialog
        isOpen={confirmationDialogOpen}
        onClose={() => setConfirmationDialogOpen(false)}
        onConfirm={handleConfirmation}
        selectedOption={isPackage ? 'package' : 'visit'}
      />
    </>
  );
};

export default TherapyVariantSelector;

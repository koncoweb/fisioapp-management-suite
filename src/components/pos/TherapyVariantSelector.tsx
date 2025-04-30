
import React, { useState } from 'react';
import { Product } from '@/types/product';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppointmentSlot } from '@/types/pos';
import AppointmentDialog from './therapy/AppointmentDialog';
import TherapyOptions from './therapy/TherapyOptions';
import ConfirmationDialog from './therapy/ConfirmationDialog';
import AppointmentList from './therapy/AppointmentList';

interface TherapyVariantSelectorProps {
  product: Product;
  onSelectVariant: (product: Product, isPackage: boolean, appointments: AppointmentSlot[]) => void;
  onCancel: () => void;
}

const TherapyVariantSelector: React.FC<TherapyVariantSelectorProps> = ({ product, onSelectVariant, onCancel }) => {
  const [isPackage, setIsPackage] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentSlot[]>([]);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  const handleAppointmentConfirm = (selectedAppointments: AppointmentSlot[]) => {
    setAppointments(selectedAppointments);
    setAppointmentDialogOpen(false);
    setConfirmationDialogOpen(true); // Open confirmation dialog after appointments are set
  };

  const handleConfirmation = (confirmed: boolean) => {
    setConfirmationDialogOpen(false);
    if (confirmed) {
      onSelectVariant(product, isPackage, appointments);
    } else {
      setAppointments([]);
    }
  };

  const handleSelectVariant = () => {
    if (isPackage || appointments.length > 0) {
      onSelectVariant(product, isPackage, appointments);
    } else {
      // Open the appointment dialog if no appointments are set
      setAppointmentDialogOpen(true);
    }
  };

  return (
    <>
      <Card className="w-full glass-card">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">{product.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {(product as any).description || `${product.name} - ${product.type}`}
          </p>

          <TherapyOptions 
            isPackage={isPackage} 
            setIsPackage={setIsPackage}
            product={product}
          />

          {isPackage ? (
            <p className="text-sm text-muted-foreground mb-4">
              Pilih paket untuk 4 kali kunjungan dengan harga lebih hemat.
            </p>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full h-8 text-xs"
              onClick={() => setAppointmentDialogOpen(true)}
            >
              Pilih Jadwal Kunjungan
            </Button>
          )}
          
          {appointments.length > 0 && !isPackage && (
            <AppointmentList 
              appointments={appointments} 
              selectedOption="visit"
              onEditAppointment={() => setAppointmentDialogOpen(true)}
              onRemoveAppointment={() => setAppointments([])}
            />
          )}

          <div className="flex justify-between mt-4">
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onCancel}>
              Cancel
            </Button>
            <Button size="sm" className="h-8 text-xs" onClick={handleSelectVariant}>
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

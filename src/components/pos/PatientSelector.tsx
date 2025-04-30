
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from 'lucide-react';
import { Patient } from '@/types';
import PatientSearch from './patient/PatientSearch';
import PatientForm from './patient/PatientForm';

interface PatientSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient: (patient: Patient) => void;
}

const PatientSelector: React.FC<PatientSelectorProps> = ({ isOpen, onClose, onSelectPatient }) => {
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleSelectExisting = (patient: Patient) => {
    onSelectPatient(patient);
    onClose();
  };

  const handlePatientAdded = (patient: Patient) => {
    onSelectPatient(patient);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Pilih Pasien</DialogTitle>
        </DialogHeader>
        
        {!isAddingNew ? (
          <>
            <PatientSearch onSelectPatient={handleSelectExisting} />
            
            <DialogFooter>
              <Button onClick={() => setIsAddingNew(true)} variant="outline" className="w-full">
                <UserPlus className="h-4 w-4 mr-2" /> Tambah Pasien Baru
              </Button>
            </DialogFooter>
          </>
        ) : (
          <PatientForm 
            onCancel={() => setIsAddingNew(false)} 
            onPatientAdded={handlePatientAdded} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PatientSelector;

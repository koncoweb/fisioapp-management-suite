
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
    // For existing patients, we have Firestore ID already
    onSelectPatient(patient);
    onClose();
  };

  const handlePatientAdded = (patient: Patient) => {
    // For newly added patients, the callback is only called after 
    // successful Firestore transaction with the patient ID assigned
    if (patient && patient.id) {
      onSelectPatient(patient);
      setIsAddingNew(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[450px] p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base">Pilih Pasien</DialogTitle>
        </DialogHeader>
        
        {!isAddingNew ? (
          <>
            <PatientSearch onSelectPatient={handleSelectExisting} />
            
            <DialogFooter>
              <Button onClick={() => setIsAddingNew(true)} variant="outline" className="w-full h-8 text-xs">
                <UserPlus className="h-3 w-3 mr-1.5" /> Tambah Pasien Baru
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

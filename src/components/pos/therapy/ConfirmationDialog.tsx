
import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (confirmed: boolean) => void;
  onOpenChange?: (open: boolean) => void;
  selectedOption?: 'visit' | 'package';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onOpenChange,
  selectedOption = 'visit'
}) => {
  return (
    <AlertDialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (onOpenChange) onOpenChange(open);
        if (!open) onClose();
      }}
    >
      <AlertDialogContent className="p-3">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm">Change appointment type?</AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            Changing from {selectedOption === 'visit' ? 'single visit' : 'package'} to {selectedOption === 'visit' ? 'package' : 'single visit'} will remove your current appointment selection(s).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-2">
          <AlertDialogCancel className="text-xs h-7" onClick={() => onConfirm(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction className="text-xs h-7" onClick={() => onConfirm(true)}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog;

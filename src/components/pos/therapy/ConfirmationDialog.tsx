
import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOption: 'visit' | 'package';
  onConfirm: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedOption,
  onConfirm
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="p-3">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm">Change appointment type?</AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            Changing from {selectedOption === 'visit' ? 'single visit' : 'package'} to {selectedOption === 'visit' ? 'package' : 'single visit'} will remove your current appointment selection(s).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-2">
          <AlertDialogCancel className="text-xs h-7">Cancel</AlertDialogCancel>
          <AlertDialogAction className="text-xs h-7" onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog;

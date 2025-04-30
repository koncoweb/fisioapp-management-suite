
import React from 'react';
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Printer } from "lucide-react";

interface ReceiptActionsProps {
  isSaving: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

const ReceiptActions: React.FC<ReceiptActionsProps> = ({ 
  isSaving, 
  onComplete, 
  onCancel 
}) => {
  return (
    <DialogFooter className="flex-col gap-1.5 sm:flex-col pt-2 print:hidden">
      <Button 
        className="w-full h-7 text-xs" 
        onClick={onComplete}
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <div className="h-3 w-3 mr-1 animate-spin border-2 border-current border-t-transparent rounded-full"></div>
            Menyimpan...
          </>
        ) : (
          <>
            <Printer className="h-3 w-3 mr-1" />
            Selesaikan Pembayaran
          </>
        )}
      </Button>
      <Button 
        variant="outline" 
        className="w-full h-7 text-xs" 
        onClick={onCancel}
        disabled={isSaving}
      >
        Batal
      </Button>
    </DialogFooter>
  );
};

export default ReceiptActions;

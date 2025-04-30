
import React from 'react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ReceiptHeader: React.FC = () => {
  return (
    <DialogHeader className="pb-2">
      <DialogTitle className="text-center text-base">Struk Pembayaran</DialogTitle>
    </DialogHeader>
  );
};

export default ReceiptHeader;

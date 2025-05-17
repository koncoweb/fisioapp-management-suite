
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface ReceiptQRCodeProps {
  receiptNo: string;
  total: number;
  date: string;
}

const ReceiptQRCode: React.FC<ReceiptQRCodeProps> = ({ receiptNo, total, date }) => {
  // Create QR code data with receipt details
  const qrData = JSON.stringify({
    receiptNo,
    total,
    date,
    type: 'payment'
  });

  return (
    <div className="flex flex-col items-center justify-center py-1 mt-1 border-t print:mt-2 print:pb-0">
      <div className="mb-1 text-xs print:text-sm text-center">
        Scan untuk verifikasi pembayaran
      </div>
      <QRCodeSVG 
        value={qrData} 
        size={80}
        level="M"
        className="mx-auto print:h-[80px] print:w-[80px]"
        includeMargin={false}
      />
      <div className="mt-1 text-xs text-center text-muted-foreground font-mono print:pb-0">
        {receiptNo}
      </div>
    </div>
  );
};

export default ReceiptQRCode;

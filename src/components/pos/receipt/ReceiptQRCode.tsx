
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
    <div className="flex flex-col items-center justify-center py-2 print:mt-2">
      <div className="mb-1 text-[9px] text-center text-muted-foreground">
        Scan untuk verifikasi pembayaran
      </div>
      <QRCodeSVG 
        value={qrData} 
        size={80}
        level="M"
        className="mx-auto"
        includeMargin={false}
      />
      <div className="mt-1 text-[8px] text-center text-muted-foreground">
        {receiptNo}
      </div>
    </div>
  );
};

export default ReceiptQRCode;


import React from 'react';
import { format } from 'date-fns';
import { Separator } from "@/components/ui/separator";
import { Patient } from '@/types';

interface ReceiptInfoProps {
  receiptNo: string;
  transactionDate: Date;
  patient?: Patient | null;
}

const ReceiptInfo: React.FC<ReceiptInfoProps> = ({ 
  receiptNo, 
  transactionDate,
  patient 
}) => {
  return (
    <div className="text-xs">
      <div className="flex justify-between">
        <span>No. Struk:</span>
        <span>{receiptNo}</span>
      </div>
      <div className="flex justify-between">
        <span>Tanggal:</span>
        <span>{format(transactionDate, 'dd/MM/yyyy HH:mm')}</span>
      </div>
      
      {patient && (
        <>
          <Separator className="my-1.5" />
          <div className="mb-0.5 font-medium text-xs">Data Pasien:</div>
          <div className="text-[10px] space-y-0.5 bg-secondary/20 p-1.5 rounded-md">
            <div><span className="font-medium">Nama:</span> {patient.nama}</div>
            <div><span className="font-medium">Alamat:</span> {patient.alamat}</div>
            <div><span className="font-medium">Usia:</span> {patient.usia} tahun</div>
            {patient.telepon && <div><span className="font-medium">Telepon:</span> {patient.telepon}</div>}
            <div><span className="font-medium">Keluhan:</span> {patient.keluhan}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReceiptInfo;

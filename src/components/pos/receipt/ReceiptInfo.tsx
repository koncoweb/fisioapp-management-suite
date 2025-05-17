
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
    <div className="text-xs print:text-sm">
      <div className="flex justify-between">
        <span>No. Struk</span>
        <span className="font-medium">{receiptNo}</span>
      </div>
      <div className="flex justify-between mb-1">
        <span>Tanggal</span>
        <span>{format(transactionDate, 'dd/MM/yyyy HH:mm')}</span>
      </div>
      
      {patient && (
        <>
          <Separator className="my-1" />
          <div className="mb-1 font-bold text-xs print:text-sm">DATA PASIEN</div>
          <div className="text-[10px] print:text-xs space-y-0.5 bg-secondary/5 p-1 rounded-sm print:border print:border-gray-200">
            <div className="flex justify-between">
              <span className="font-medium">Nama</span>
              <span>{patient.nama}</span>
            </div>
            {patient.alamat && (
              <div className="flex justify-between">
                <span className="font-medium">Alamat</span>
                <span className="text-right">{patient.alamat}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium">Usia</span>
              <span>{patient.usia} tahun</span>
            </div>
            {patient.telepon && (
              <div className="flex justify-between">
                <span className="font-medium">Telepon</span>
                <span>{patient.telepon}</span>
              </div>
            )}
            {patient.keluhan && (
              <div className="flex justify-between">
                <span className="font-medium">Keluhan</span>
                <span className="text-right">{patient.keluhan}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReceiptInfo;


import React, { useState, useEffect } from 'react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ReceiptHeader: React.FC = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAppConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'appConfig', 'general'));
        if (configDoc.exists()) {
          const data = configDoc.data();
          if (data.logoUrl) {
            setLogoUrl(data.logoUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching app logo:', error);
      }
    };

    fetchAppConfig();
  }, []);
  
  return (
    <DialogHeader className="pb-0 print:pb-0">
      {logoUrl ? (
        <div className="flex justify-center mb-1 print:mb-0">
          <img 
            src={logoUrl} 
            alt="Clinic Logo" 
            className="h-12 w-auto object-contain print:h-14" 
          />
        </div>
      ) : (
        <div className="flex justify-center mb-1 print:mb-0 h-12 items-center">
          <div className="text-xl font-bold text-primary print:text-2xl">Fisioapp</div>
        </div>
      )}
      <DialogTitle className="text-center text-base font-bold print:text-lg mb-0">STRUK PEMBAYARAN</DialogTitle>
    </DialogHeader>
  );
};
export default ReceiptHeader;

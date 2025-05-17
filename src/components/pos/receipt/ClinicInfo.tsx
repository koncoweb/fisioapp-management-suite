
import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ClinicInfo: React.FC = () => {
  const [appTitle, setAppTitle] = useState('Fisioapp Clinic');
  const [appDescription, setAppDescription] = useState('Klinik Fisioterapi');
  
  useEffect(() => {
    const fetchAppConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'appConfig', 'general'));
        if (configDoc.exists()) {
          const data = configDoc.data();
          setAppTitle(data.title || 'Fisioapp Clinic');
          setAppDescription(data.description || 'Klinik Fisioterapi');
        }
      } catch (error) {
        console.error('Error fetching app config:', error);
      }
    };

    fetchAppConfig();
  }, []);
  
  return (
    <div className="text-center text-xs print:text-sm text-black border-b pb-1 mb-1">
      <p className="font-bold">{appTitle}</p>
      <p className="font-medium text-[10px] print:text-xs">{appDescription}</p>
      <p className="text-[10px] print:text-xs">Jl. Kesehatan No. 123</p>
      <p className="text-[10px] print:text-xs">Jakarta, Indonesia</p>
    </div>
  );
};

export default ClinicInfo;

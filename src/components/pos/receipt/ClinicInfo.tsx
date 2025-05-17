
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
    <div className="text-center text-xs text-muted-foreground">
      <p className="font-medium">{appTitle}</p>
      <p>{appDescription}</p>
      <p>Jl. Kesehatan No. 123</p>
      <p>Jakarta, Indonesia</p>
    </div>
  );
};

export default ClinicInfo;

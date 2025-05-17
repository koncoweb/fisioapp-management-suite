import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AppConfigHeaderProps {
  type?: 'payment' | 'salary' | 'pos'; // Tipe receipt untuk styling yang berbeda
}

const AppConfigHeader: React.FC<AppConfigHeaderProps> = ({ type = 'payment' }) => {
  const [appTitle, setAppTitle] = useState('Fisioapp Clinic');
  const [appDescription, setAppDescription] = useState('Klinik Fisioterapi');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const fetchAppConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'appConfig', 'general'));
        if (configDoc.exists()) {
          const data = configDoc.data();
          setAppTitle(data.title || 'Fisioapp Clinic');
          setAppDescription(data.description || 'Klinik Fisioterapi');
          setLogoUrl(data.logoUrl || '');
        }
      } catch (error) {
        console.error('Error fetching app config:', error);
      }
    };

    fetchAppConfig();
  }, []);

  return (
    <div className="text-center mb-4">
      {logoUrl ? (
        <div className="flex justify-center mb-2">
          <img 
            src={logoUrl} 
            alt={appTitle} 
            className="h-16 w-auto object-contain"
            style={{ maxWidth: '100%' }}
          />
        </div>
      ) : (
        <h2 className="text-xl font-bold text-black">{appTitle}</h2>
      )}
      <p className="text-sm text-black">{appDescription}</p>
      <p className="text-sm text-black">Jl. Contoh No. 123, Jakarta</p>
      <p className="text-sm text-black">Telp: (021) 1234-5678</p>
      <div className="border-t border-dashed my-2 border-black"></div>
      
      {type === 'payment' && (
        <h3 className="font-bold text-lg text-black">BUKTI PEMBAYARAN</h3>
      )}
      
      {type === 'salary' && (
        <h3 className="font-bold text-lg text-black">SLIP GAJI</h3>
      )}
      
      {type === 'pos' && (
        <h3 className="font-bold text-lg text-black">STRUK PEMBAYARAN</h3>
      )}
    </div>
  );
};

export default AppConfigHeader;

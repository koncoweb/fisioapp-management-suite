
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Patient } from '@/types';
import { toast } from 'sonner';

interface PatientSearchProps {
  onSelectPatient: (patient: Patient) => void;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ onSelectPatient }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Search in firestore collection 'patients'
      const patientsRef = collection(db, 'patients');
      // Case-insensitive search for name containing the search query
      const q = query(
        patientsRef,
        where('nama', '>=', searchQuery),
        where('nama', '<=', searchQuery + '\uf8ff')
      );
      
      const querySnapshot = await getDocs(q);
      const patientResults: Patient[] = [];
      
      querySnapshot.forEach((doc) => {
        patientResults.push({
          id: doc.id,
          ...doc.data(),
        } as Patient);
      });
      
      setPatients(patientResults);
    } catch (error) {
      console.error("Error searching patients:", error);
      toast.error("Gagal mencari pasien");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari pasien berdasarkan nama..."
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isLoading} variant="default">
          <Search className="h-4 w-4 mr-1" /> Cari
        </Button>
      </div>
      
      {patients.length > 0 || isLoading ? (
        <div className="max-h-60 overflow-auto border rounded-md">
          {patients.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {isLoading ? 'Mencari...' : 'Tidak ada pasien ditemukan'}
            </div>
          ) : (
            <ul className="divide-y">
              {patients.map((patient) => (
                <li 
                  key={patient.id}
                  className="p-3 hover:bg-secondary/20 cursor-pointer transition-colors flex items-center"
                  onClick={() => onSelectPatient(patient)}
                >
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{patient.nama}</p>
                    <p className="text-xs text-muted-foreground">{patient.alamat}, {patient.usia} tahun</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default PatientSearch;

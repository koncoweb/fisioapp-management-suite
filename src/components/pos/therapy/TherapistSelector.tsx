
import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Employee } from '@/types';
import { User } from 'lucide-react';

interface TherapistSelectorProps {
  selectedTherapist: Employee | null;
  onTherapistSelect: (therapist: Employee) => void;
}

const TherapistSelector: React.FC<TherapistSelectorProps> = ({ 
  selectedTherapist, 
  onTherapistSelect 
}) => {
  const [therapists, setTherapists] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setIsLoading(true);
        const therapistsRef = collection(db, "users");
        const q = query(therapistsRef, where("role", "==", "therapist"));
        const querySnapshot = await getDocs(q);
        
        const therapistsList: Employee[] = [];
        querySnapshot.forEach((doc) => {
          therapistsList.push({ id: doc.id, ...doc.data() } as Employee);
        });
        
        setTherapists(therapistsList);
      } catch (error) {
        console.error("Error fetching therapists:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  return (
    <div className="mb-4">
      <p className="text-sm text-muted-foreground mb-2">Pilih Terapis:</p>
      <Select
        value={selectedTherapist?.id}
        onValueChange={(value) => {
          const therapist = therapists.find(t => t.id === value);
          if (therapist) onTherapistSelect(therapist);
        }}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full h-9 text-xs">
          <User className="h-3 w-3 mr-1.5" />
          <SelectValue placeholder={isLoading ? "Loading therapists..." : "Select a therapist"} />
        </SelectTrigger>
        <SelectContent>
          {therapists.map((therapist) => (
            <SelectItem key={therapist.id} value={therapist.id} className="text-xs">
              {therapist.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TherapistSelector;


import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Employee } from '@/types';

export const useTherapists = () => {
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

  return {
    therapists,
    isLoading
  };
};

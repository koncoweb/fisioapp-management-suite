
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Employee } from '@/types';

export const useTherapists = () => {
  return useQuery({
    queryKey: ['therapists'],
    queryFn: async () => {
      const therapistsRef = collection(db, "users");
      const q = query(therapistsRef, where("role", "==", "therapist"));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Employee));
    }
  });
};

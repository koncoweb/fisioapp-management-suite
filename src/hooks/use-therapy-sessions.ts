
import { useQuery } from '@tanstack/react-query';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TherapySession } from '@/types/booking';

export const useTherapySessions = () => {
  return useQuery({
    queryKey: ['therapySessions'],
    queryFn: async () => {
      const sessionsQuery = query(collection(db, 'therapySessions'));
      const snapshot = await getDocs(sessionsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        duration: doc.data().duration || 60 // Ensure there's a duration field, default to 60 minutes
      })) as TherapySession[];
    }
  });
};

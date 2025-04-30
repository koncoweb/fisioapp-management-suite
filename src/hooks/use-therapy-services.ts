
import { useQuery } from '@tanstack/react-query';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TherapyService } from '@/types/booking';

export const useTherapyServices = () => {
  return useQuery({
    queryKey: ['therapyServices'],
    queryFn: async () => {
      const q = query(
        collection(db, 'products'),
        where('type', '==', 'service')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TherapyService[];
    }
  });
};


import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const useSessionStatus = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateSessionStatus = async (
    sessionId: string, 
    newStatus: 'confirmed' | 'cancelled', 
    userData: any
  ) => {
    if (!userData) {
      toast({
        title: "Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }

    try {
      const sessionRef = doc(db, 'therapySessions', sessionId);
      await updateDoc(sessionRef, {
        status: newStatus,
        statusDiupdate: {
          nama: userData.namaLengkap,
          userId: userData.uid,
          timestamp: new Date().toISOString()
        }
      });
      
      await queryClient.invalidateQueries({ queryKey: ['therapySessions'] });
      
      toast({
        title: "Status Updated",
        description: `Session has been ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating session:', error);
      toast({
        title: "Error",
        description: "Failed to update session status",
        variant: "destructive",
      });
    }
  };

  return { updateSessionStatus };
};

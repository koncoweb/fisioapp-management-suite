
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuccessAnimationProps {
  onPrint?: () => void;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ onPrint }) => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-6"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
      <h2 className="text-lg font-semibold">Pembayaran Berhasil</h2>
      <p className="text-xs text-muted-foreground mt-1">Terima kasih telah berbelanja</p>
      
      <Button 
        variant="outline" 
        className="mt-4 flex items-center gap-2"
        onClick={() => {
          console.log('Print button clicked in SuccessAnimation');
          if (typeof onPrint === 'function') {
            onPrint();
          } else {
            console.error('onPrint is not a function');
            // Fallback jika onPrint tidak tersedia
            try {
              window.print();
            } catch (error) {
              console.error('Error printing:', error);
            }
          }
        }}
      >
        <Printer className="h-4 w-4" />
        Cetak Struk
      </Button>
    </motion.div>
  );
};

export default SuccessAnimation;

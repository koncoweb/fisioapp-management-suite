
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const SuccessAnimation: React.FC = () => {
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
    </motion.div>
  );
};

export default SuccessAnimation;


import React from 'react';
import { Star } from 'lucide-react';

interface LoyaltyInfoProps {
  points: number;
  patientName?: string;
}

const LoyaltyInfo: React.FC<LoyaltyInfoProps> = ({ points, patientName }) => {
  // Only show loyalty info if points are earned and we have a patient
  if (points <= 0 || !patientName) {
    return null;
  }

  return (
    <div className="text-sm print:text-base border border-dashed border-amber-200 bg-amber-50 rounded-md p-2 mt-3 print:border-amber-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Star className="h-5 w-5 text-amber-500 mr-1.5 fill-amber-500" />
          <span className="font-bold">Poin Loyalitas</span>
        </div>
        <span className="font-bold text-base print:text-lg">{points} poin</span>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        Selamat {patientName}! Anda mendapatkan {points} poin dari transaksi ini.
      </p>
    </div>
  );
};

export default LoyaltyInfo;

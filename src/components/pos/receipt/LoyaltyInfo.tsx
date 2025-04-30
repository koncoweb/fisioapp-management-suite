
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
    <div className="text-xs border border-dashed border-amber-200 bg-amber-50 rounded-md p-1.5 mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Star className="h-3.5 w-3.5 text-amber-500 mr-1 fill-amber-500" />
          <span className="font-medium">Poin Loyalitas</span>
        </div>
        <span className="font-bold">{points} poin</span>
      </div>
      <p className="text-[9px] text-muted-foreground mt-0.5">
        Selamat {patientName}! Anda mendapatkan {points} poin dari transaksi ini.
      </p>
    </div>
  );
};

export default LoyaltyInfo;

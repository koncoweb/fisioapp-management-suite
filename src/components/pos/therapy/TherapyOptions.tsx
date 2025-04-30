
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Package } from 'lucide-react';
import { Product } from '@/types/product';

interface TherapyOptionsProps {
  product: Product;
  selectedOption: 'visit' | 'package';
  onOptionChange: (value: 'visit' | 'package') => void;
}

const TherapyOptions: React.FC<TherapyOptionsProps> = ({
  product,
  selectedOption,
  onOptionChange
}) => {
  const packagePrice = (product.price * 4) - 200000;
  
  return (
    <RadioGroup
      value={selectedOption}
      onValueChange={(value) => onOptionChange(value as 'visit' | 'package')}
      className="space-y-1.5"
    >
      <label className="flex items-start space-x-2 space-y-0 rounded-md border p-1.5 cursor-pointer hover:bg-muted/50 transition-colors">
        <RadioGroupItem value="visit" id="visit" />
        <div className="flex flex-1 items-start justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center">
              <Calendar className="h-2.5 w-2.5 mr-1 text-primary" />
              <p className="text-[10px] font-medium">Single Visit</p>
            </div>
            <p className="text-[9px] text-muted-foreground">One-time therapy session</p>
          </div>
          <div className="text-[10px] font-semibold">
            Rp {product.price.toLocaleString('id-ID')}
          </div>
        </div>
      </label>
      
      <label className="flex items-start space-x-2 space-y-0 rounded-md border p-1.5 cursor-pointer hover:bg-muted/50 transition-colors">
        <RadioGroupItem value="package" id="package" />
        <div className="flex flex-1 items-start justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center">
              <Package className="h-2.5 w-2.5 mr-1 text-accent" />
              <p className="text-[10px] font-medium">Package (4 Visits)</p>
            </div>
            <p className="text-[9px] text-muted-foreground">Save Rp 200,000</p>
          </div>
          <div className="text-[10px] font-semibold">
            Rp {packagePrice.toLocaleString('id-ID')}
          </div>
        </div>
      </label>
    </RadioGroup>
  );
};

export default TherapyOptions;

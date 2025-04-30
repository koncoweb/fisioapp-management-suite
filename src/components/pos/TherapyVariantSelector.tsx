
import React from 'react';
import { Product } from '@/types/product';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Package } from 'lucide-react';
import { motion } from 'framer-motion';

interface TherapyVariantSelectorProps {
  product: Product | null;
  onSelectVariant: (product: Product, isPackage: boolean) => void;
  onCancel: () => void;
}

const TherapyVariantSelector: React.FC<TherapyVariantSelectorProps> = ({
  product,
  onSelectVariant,
  onCancel
}) => {
  const [selectedOption, setSelectedOption] = React.useState<'visit' | 'package'>('visit');

  if (!product) {
    return null;
  }

  const packagePrice = (product.price * 4) - 200000;

  const handleSelectVariant = () => {
    onSelectVariant(product, selectedOption === 'package');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="w-full glass-card shadow-md">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm">Choose Therapy Variant</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="mb-2">
            <p className="text-xs font-medium mb-0.5">Selected Therapy:</p>
            <p className="text-xs font-semibold">{product.name}</p>
          </div>

          <RadioGroup
            value={selectedOption}
            onValueChange={(value) => setSelectedOption(value as 'visit' | 'package')}
            className="space-y-2"
          >
            <label className="flex items-start space-x-2 space-y-0 rounded-md border p-2 cursor-pointer hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="visit" id="visit" />
              <div className="flex flex-1 items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1 text-primary" />
                    <p className="text-xs font-medium">Single Visit</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">One-time therapy session</p>
                </div>
                <div className="text-xs font-semibold">
                  Rp {product.price.toLocaleString('id-ID')}
                </div>
              </div>
            </label>
            
            <label className="flex items-start space-x-2 space-y-0 rounded-md border p-2 cursor-pointer hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="package" id="package" />
              <div className="flex flex-1 items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <Package className="h-3 w-3 mr-1 text-accent" />
                    <p className="text-xs font-medium">Package (4 Visits)</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Save Rp 200,000</p>
                </div>
                <div className="text-xs font-semibold">
                  Rp {packagePrice.toLocaleString('id-ID')}
                </div>
              </div>
            </label>
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-muted/30 p-2">
          <Button variant="outline" size="sm" className="text-xs h-6 px-2" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="default" size="sm" className="text-xs h-6 px-2" onClick={handleSelectVariant}>
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default TherapyVariantSelector;

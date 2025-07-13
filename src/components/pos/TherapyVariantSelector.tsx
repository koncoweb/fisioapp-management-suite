
import React, { useState } from 'react';
import { Product } from '@/types/product';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppointmentSlot } from '@/types/pos';

import TherapyOptions from './therapy/TherapyOptions';
import TherapistSelector from './therapy/TherapistSelector';
import { Employee } from '@/types';
import { toast } from 'sonner';

interface TherapyVariantSelectorProps {
  product: Product;
  onSelectVariant: (product: Product, isPackage: boolean, appointments: AppointmentSlot[], therapist: Employee) => void;
  onCancel: () => void;
}

const TherapyVariantSelector: React.FC<TherapyVariantSelectorProps> = ({ product, onSelectVariant, onCancel }) => {
  const [isPackage, setIsPackage] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<Employee | null>(null);



  const handleSelectVariant = () => {
    if (!selectedTherapist) {
      toast.error("Please select a therapist first");
      return;
    }
    
    // Create empty appointments array for cart (no scheduling required)
    const emptyAppointments: AppointmentSlot[] = [];
    onSelectVariant(product, isPackage, emptyAppointments, selectedTherapist);
  };

  const handlePackageToggle = (newIsPackage: boolean) => {
    setIsPackage(newIsPackage);
  };

  const handleTherapistSelect = (therapist: Employee) => {
    setSelectedTherapist(therapist);
  };

  return (
    <>
      <Card className="w-full glass-card">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">{product.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {product.description || `${product.name} - ${product.type}`}
            {product.duration && ` - ${product.duration} minutes`}
          </p>

          {/* Therapist selector */}
          <TherapistSelector 
            selectedTherapist={selectedTherapist}
            onTherapistSelect={handleTherapistSelect}
          />

          <TherapyOptions 
            isPackage={isPackage} 
            setIsPackage={handlePackageToggle}
            product={product}
          />

          {isPackage ? (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Paket 4 kali kunjungan dengan harga lebih hemat.
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Kunjungan tunggal.
              </p>
            </div>
          )}
          


          <div className="flex justify-between mt-4">
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              size="sm" 
              className="h-8 text-xs" 
              onClick={handleSelectVariant}
              disabled={!selectedTherapist}
            >
              Add to Cart
            </Button>
          </div>
        </CardContent>
      </Card>


    </>
  );
};

export default TherapyVariantSelector;


import React, { useState } from 'react';
import { Product } from '@/types/product';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Clock, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TherapyVariantSelectorProps {
  product: Product | null;
  onSelectVariant: (product: Product, isPackage: boolean, date?: Date, time?: string) => void;
  onCancel: () => void;
}

// Generate time slots from 8:00 to 18:00 with 30-minute intervals
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute of [0, 30]) {
      // Skip 18:30 as the last appointment should be at 18:00
      if (hour === 18 && minute === 30) continue;
      
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      slots.push(`${hourStr}:${minuteStr}`);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

const TherapyVariantSelector: React.FC<TherapyVariantSelectorProps> = ({
  product,
  onSelectVariant,
  onCancel
}) => {
  const [selectedOption, setSelectedOption] = useState<'visit' | 'package'>('visit');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | undefined>(undefined);

  if (!product) {
    return null;
  }

  const packagePrice = (product.price * 4) - 200000;

  const handleSelectVariant = () => {
    onSelectVariant(product, selectedOption === 'package', date, time);
  };

  // Disable past dates and today if it's after 5 PM
  const disabledDates = (currentDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If it's after 5 PM, disable today as well
    if (new Date().getHours() >= 17) {
      today.setDate(today.getDate() + 1);
    }
    
    return currentDate < today;
  };

  const isFormValid = date !== undefined && time !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="w-full glass-card shadow-md">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs">Choose Therapy Variant</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="mb-1.5">
            <p className="text-[10px] font-medium mb-0.5">Selected Therapy:</p>
            <p className="text-xs font-semibold">{product.name}</p>
          </div>

          <RadioGroup
            value={selectedOption}
            onValueChange={(value) => setSelectedOption(value as 'visit' | 'package')}
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
          
          <div className="mt-2 space-y-2 border-t pt-2">
            <p className="text-[10px] font-medium">Schedule Appointment:</p>
            
            <div className="grid grid-cols-2 gap-2">
              {/* Date Picker */}
              <div className="space-y-0.5">
                <label className="text-[9px] text-muted-foreground">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-7 text-[10px] justify-start"
                    >
                      <Calendar className="h-3 w-3 mr-1.5" />
                      {date ? (
                        <span>{format(date, "dd MMM yyyy")}</span>
                      ) : (
                        <span className="text-muted-foreground">Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={disabledDates}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Time Picker */}
              <div className="space-y-0.5">
                <label className="text-[9px] text-muted-foreground">Time</label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger className="w-full h-7 text-[10px]">
                    <Clock className="h-3 w-3 mr-1.5" />
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot} className="text-[10px]">
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-muted/30 p-1.5">
          <Button variant="outline" size="sm" className="text-[10px] h-6 px-2" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="text-[10px] h-6 px-2" 
            onClick={handleSelectVariant}
            disabled={!isFormValid}
          >
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default TherapyVariantSelector;

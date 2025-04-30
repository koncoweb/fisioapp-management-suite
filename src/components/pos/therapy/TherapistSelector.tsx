
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Employee } from '@/types';
import { User } from 'lucide-react';
import { useTherapists } from '@/hooks/use-therapists';

interface TherapistSelectorProps {
  selectedTherapist: Employee | null;
  onTherapistSelect: (therapist: Employee) => void;
}

const TherapistSelector: React.FC<TherapistSelectorProps> = ({ 
  selectedTherapist, 
  onTherapistSelect 
}) => {
  const { therapists, isLoading } = useTherapists();

  return (
    <div className="mb-4">
      <p className="text-sm text-muted-foreground mb-2">Pilih Terapis:</p>
      <Select
        value={selectedTherapist?.id}
        onValueChange={(value) => {
          const therapist = therapists.find(t => t.id === value);
          if (therapist) onTherapistSelect(therapist);
        }}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full h-9 text-xs">
          <User className="h-3 w-3 mr-1.5" />
          <SelectValue placeholder={isLoading ? "Loading therapists..." : "Select a therapist"} />
        </SelectTrigger>
        <SelectContent>
          {therapists.map((therapist) => (
            <SelectItem key={therapist.id} value={therapist.id} className="text-xs">
              {therapist.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TherapistSelector;
